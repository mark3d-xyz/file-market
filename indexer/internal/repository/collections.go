package repository

import (
	"context"
	"fmt"
	"github.com/ethereum/go-ethereum/common"
	"github.com/jackc/pgx/v4"
	"github.com/mark3d-xyz/mark3d/indexer/internal/domain"
	"math/big"
	"strings"
)

func (p *postgres) GetCollectionsByCreator(
	ctx context.Context,
	tx pgx.Tx,
	address common.Address,
	lastCollectionAddress *common.Address,
	limit int,
) ([]*domain.Collection, error) {
	query := `
		SELECT address, creator, owner, name, token_id, meta_uri, description, image
		FROM collections
		WHERE creator=$1 AND address > $2
		ORDER BY address
		LIMIT $3
	`

	lastCollectionAddressStr := ""
	if lastCollectionAddress != nil {
		lastCollectionAddressStr = strings.ToLower(lastCollectionAddress.String())
	}

	rows, err := tx.Query(ctx, query, strings.ToLower(address.String()), lastCollectionAddressStr, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var res []*domain.Collection
	for rows.Next() {
		var collectionAddress, creator, owner, tokenId string
		c := &domain.Collection{}

		if err := rows.Scan(
			&collectionAddress,
			&creator,
			&owner,
			&c.Name,
			&tokenId,
			&c.MetaUri,
			&c.Description,
			&c.Image,
		); err != nil {
			return nil, err
		}

		c.Address = common.HexToAddress(collectionAddress)
		c.Owner = common.HexToAddress(owner)
		c.Creator = common.HexToAddress(creator)

		var ok bool
		c.TokenId, ok = big.NewInt(0).SetString(tokenId, 10)
		if !ok {
			return nil, fmt.Errorf("failed to parse big int: %s", tokenId)
		}

		res = append(res, c)
	}
	return res, nil
}

func (p *postgres) GetCollectionsByAddress(ctx context.Context,
	tx pgx.Tx, address common.Address) ([]*domain.Collection, error) {
	// language=PostgreSQL
	rows, err := tx.Query(ctx, `SELECT address,creator,owner,name,token_id,meta_uri,description,image 
			FROM collections AS c WHERE owner=$1 OR 
            	EXISTS (SELECT 1 FROM tokens AS t WHERE t.collection_address=c.address AND t.owner=$1)`,
		strings.ToLower(address.String()))
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var res []*domain.Collection
	for rows.Next() {
		var collectionAddress, creator, owner, tokenId string
		c := &domain.Collection{}
		if err := rows.Scan(&collectionAddress, &creator, &owner, &c.Name,
			&tokenId, &c.MetaUri, &c.Description, &c.Image); err != nil {
			return nil, err
		}
		c.Address, c.Owner, c.Creator = common.HexToAddress(collectionAddress),
			common.HexToAddress(creator), common.HexToAddress(owner)
		var ok bool
		c.TokenId, ok = big.NewInt(0).SetString(tokenId, 10)
		if !ok {
			return nil, fmt.Errorf("failed to parse big int: %s", tokenId)
		}
		res = append(res, c)
	}
	return res, nil
}

func (p *postgres) GetCollection(ctx context.Context,
	tx pgx.Tx, contractAddress common.Address) (*domain.Collection, error) {
	// language=PostgreSQL
	row := tx.QueryRow(ctx, `SELECT address,creator,owner,name,token_id,meta_uri,description,
       image FROM collections WHERE address=$1`, strings.ToLower(contractAddress.String()))
	var collectionAddress, creator, owner, tokenId string
	c := &domain.Collection{}
	if err := row.Scan(&collectionAddress, &creator, &owner, &c.Name, &tokenId,
		&c.MetaUri, &c.Description, &c.Image); err != nil {
		return nil, err
	}
	c.Address, c.Owner, c.Creator = contractAddress, common.HexToAddress(creator), common.HexToAddress(owner)
	var ok bool
	c.TokenId, ok = big.NewInt(0).SetString(tokenId, 10)
	if !ok {
		return nil, fmt.Errorf("failed to parse big int: %s", tokenId)
	}
	return c, nil
}

func (p *postgres) GetCollectionsByTokenId(ctx context.Context, tx pgx.Tx,
	tokenId *big.Int) (*domain.Collection, error) {
	// language=PostgreSQL
	row := tx.QueryRow(ctx, `SELECT address,creator,owner,name,meta_uri,description,
       image FROM collections WHERE address=$1`, tokenId.String())
	var collectionAddress, creator, owner string
	c := &domain.Collection{
		TokenId: tokenId,
	}
	if err := row.Scan(&collectionAddress, &creator, &owner, &c.Name,
		&c.MetaUri, &c.Description, &c.Image); err != nil {
		return nil, err
	}
	c.Address, c.Owner, c.Creator = common.HexToAddress(collectionAddress), common.HexToAddress(creator), common.HexToAddress(owner)
	return c, nil
}

func (p *postgres) InsertCollection(ctx context.Context, tx pgx.Tx,
	collection *domain.Collection) error {
	// language=PostgreSQL
	if _, err := tx.Exec(ctx, `INSERT INTO collections VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
		strings.ToLower(collection.Address.String()), strings.ToLower(collection.Creator.String()),
		strings.ToLower(collection.Owner.String()), collection.Name, collection.TokenId.String(),
		collection.MetaUri, collection.Description, collection.Image); err != nil {
		return err
	}
	return nil
}

func (p *postgres) InsertCollectionTransfer(ctx context.Context, tx pgx.Tx,
	collectionAddress common.Address, transfer *domain.CollectionTransfer) error {
	// language=PostgreSQL
	if _, err := tx.Exec(ctx, `INSERT INTO collection_transfers VALUES ($1,$2,$3,$4,$5)`,
		strings.ToLower(collectionAddress.String()), transfer.Timestamp,
		strings.ToLower(transfer.From.String()), strings.ToLower(transfer.To.String()),
		strings.ToLower(transfer.TxId.String())); err != nil {
		return err
	}
	return nil
}

func (p *postgres) UpdateCollection(ctx context.Context, tx pgx.Tx,
	collection *domain.Collection) error {
	// language=PostgreSQL
	if _, err := tx.Exec(ctx, `UPDATE collections SET owner=$1,name=$2,meta_uri=$3 WHERE address=$4`,
		strings.ToLower(collection.Owner.String()), collection.Name, collection.MetaUri,
		strings.ToLower(collection.Address.String())); err != nil {
		return err
	}
	return nil
}

func (p *postgres) CollectionTransferExists(ctx context.Context, tx pgx.Tx, txId string) (bool, error) {
	// language=PostgreSQL
	row := tx.QueryRow(ctx, `SELECT COUNT(*) FROM collection_transfers WHERE tx_id=$1`, txId)
	var res int64
	if err := row.Scan(&res); err != nil {
		return false, err
	}
	return res > 0, nil
}
