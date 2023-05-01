package repository

import (
	"context"
	"fmt"
	"math/big"
	"strings"

	"github.com/ethereum/go-ethereum/common"
	"github.com/jackc/pgx/v4"
	"github.com/mark3d-xyz/mark3d/indexer/internal/domain"
)

func (p *postgres) GetCollectionTokens(
	ctx context.Context,
	tx pgx.Tx,
	collectionAddress common.Address,
) ([]*domain.Token, error) {
	// language=PostgreSQL
	query := `
		SELECT 
		    t.token_id, t.owner, t.meta_uri, t.creator, t.mint_transaction_timestamp, t.mint_transaction_hash,
		    c.name
		FROM tokens t
		INNER JOIN collections c ON c.address = t.collection_address
		WHERE t.collection_address=$1
	`
	rows, err := tx.Query(ctx, query, strings.ToLower(collectionAddress.String()))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var res []*domain.Token
	for rows.Next() {
		var tokenId, owner, creator, mintTxHash string
		t := &domain.Token{}

		err := rows.Scan(&tokenId, &owner, &t.MetaUri, &creator, &t.MintTxTimestamp, &mintTxHash, &t.CollectionName)
		if err != nil {
			return nil, err
		}

		t.CollectionAddress = collectionAddress
		t.Owner = common.HexToAddress(owner)
		t.Creator = common.HexToAddress(creator)
		t.MintTxHash = common.HexToHash(mintTxHash)

		var ok bool
		t.TokenId, ok = big.NewInt(0).SetString(tokenId, 10)
		if !ok {
			return nil, fmt.Errorf("failed to parse big int: %s", tokenId)
		}

		metadata, err := p.GetMetadata(ctx, tx, t.CollectionAddress, t.TokenId)
		if err != nil {
			return nil, err
		}
		t.Metadata = metadata

		res = append(res, t)
	}
	return res, nil
}

func (p *postgres) GetTokensByAddress(
	ctx context.Context,
	tx pgx.Tx,
	ownerAddress common.Address,
) ([]*domain.Token, error) {
	// language=PostgreSQL
	query := `
		SELECT 
		    t.collection_address, t.token_id, t.meta_uri, t.creator, 
		    t.mint_transaction_timestamp, t.mint_transaction_hash,
		    c.name
		FROM tokens t
		INNER JOIN collections c ON c.address = t.collection_address
		WHERE t.owner=$1
	`

	rows, err := tx.Query(ctx, query, strings.ToLower(ownerAddress.String()))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var res []*domain.Token
	for rows.Next() {
		var collectionAddress, tokenId, creator, mintTxHash string
		t := &domain.Token{}

		if err := rows.Scan(
			&collectionAddress,
			&tokenId,
			&t.MetaUri,
			&creator,
			&t.MintTxTimestamp,
			&mintTxHash,
			&t.CollectionName,
		); err != nil {
			return nil, err
		}

		t.Owner = ownerAddress
		t.CollectionAddress = common.HexToAddress(collectionAddress)
		t.Creator = common.HexToAddress(creator)
		t.MintTxHash = common.HexToHash(mintTxHash)

		var ok bool
		t.TokenId, ok = big.NewInt(0).SetString(tokenId, 10)
		if !ok {
			return nil, fmt.Errorf("failed to parse big int: %s", tokenId)
		}

		metadata, err := p.GetMetadata(ctx, tx, t.CollectionAddress, t.TokenId)
		if err != nil {
			return nil, err
		}
		t.Metadata = metadata

		res = append(res, t)
	}
	return res, nil
}

func (p *postgres) GetToken(
	ctx context.Context,
	tx pgx.Tx,
	contractAddress common.Address,
	tokenId *big.Int,
) (*domain.Token, error) {
	// language=PostgreSQL
	query := `
		SELECT 
		    t.owner, t.meta_uri, t.creator, t.mint_transaction_timestamp, t.mint_transaction_hash,
		    c.name
		FROM tokens t
		INNER JOIN collections c ON t.collection_address = c.address
		WHERE t.collection_address=$1 
		  AND t.token_id=$2
		`
	row := tx.QueryRow(ctx, query,
		strings.ToLower(contractAddress.String()),
		tokenId.String(),
	)

	t := &domain.Token{}
	var owner, creator, mintTxHash string

	err := row.Scan(
		&owner,
		&t.MetaUri,
		&creator,
		&t.MintTxTimestamp,
		&mintTxHash,
		&t.CollectionName,
	)
	if err != nil {
		return nil, err
	}

	t.CollectionAddress = contractAddress
	t.TokenId = tokenId
	t.Owner = common.HexToAddress(owner)
	t.Creator = common.HexToAddress(creator)
	t.MintTxHash = common.HexToHash(mintTxHash)

	metadata, err := p.GetMetadata(ctx, tx, t.CollectionAddress, t.TokenId)
	if err != nil {
		return nil, err
	}
	t.Metadata = metadata

	return t, nil
}

func (p *postgres) InsertToken(ctx context.Context, tx pgx.Tx, token *domain.Token) error {
	// language=PostgreSQL
	query := `
		INSERT INTO tokens (
		    collection_address, token_id, owner, meta_uri, creator, mint_transaction_timestamp, mint_transaction_hash
		)
		VALUES ($1,$2,$3,$4,$5,$6,$7) 
		ON CONFLICT ON CONSTRAINT tokens_pkey DO NOTHING
	`
	_, err := tx.Exec(ctx, query,
		strings.ToLower(token.CollectionAddress.String()),
		token.TokenId.String(),
		strings.ToLower(token.Owner.String()),
		token.MetaUri,
		strings.ToLower(token.Creator.String()),
		token.MintTxTimestamp,
		strings.ToLower(token.MintTxHash.Hex()),
	)
	if err != nil {
		return err
	}

	if err := p.InsertMetadata(ctx, tx, token.Metadata, token.CollectionAddress, token.TokenId); err != nil {
		return err
	}

	return nil
}

func (p *postgres) UpdateToken(ctx context.Context, tx pgx.Tx, token *domain.Token) error {
	// language=PostgreSQL
	if _, err := tx.Exec(ctx, `UPDATE tokens SET owner=$1,meta_uri=$2 WHERE collection_address=$3 AND token_id=$4`,
		strings.ToLower(token.Owner.String()), token.MetaUri,
		strings.ToLower(token.CollectionAddress.String()), token.TokenId.String()); err != nil {
		return err
	}
	return nil
}

func (p *postgres) GetMetadata(
	ctx context.Context,
	tx pgx.Tx,
	contractAddress common.Address,
	tokenId *big.Int,
) (*domain.TokenMetadata, error) {
	metadataQuery := `
		SELECT 
		    tm.id, tm.name, tm.description, tm.image, tm.external_link, tm.hidden_file, tm.license, tm.license_url,
			hfm.name, hfm.type, hfm.size
		FROM token_metadata tm
		LEFT JOIN hidden_file_metadata hfm on tm.id = hfm.metadata_id
		WHERE collection_address=$1 
		  AND token_id=$2
	`
	var md domain.TokenMetadata
	err := tx.QueryRow(ctx, metadataQuery,
		strings.ToLower(contractAddress.String()),
		tokenId.String(),
	).Scan(
		&md.Id,
		&md.Name,
		&md.Description,
		&md.Image,
		&md.ExternalLink,
		&md.HiddenFile,
		&md.License,
		&md.LicenseUrl,
		&md.HiddenFileMeta.Name,
		&md.HiddenFileMeta.Type,
		&md.HiddenFileMeta.Size,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query metadata: %w", err)
	}

	propertiesQuery := `
		SELECT trait_type, display_type, value, max_value, property_type
		FROM token_metadata_properties
		WHERE metadata_id=$1
	`
	rows, err := tx.Query(ctx, propertiesQuery, md.Id)
	if err != nil {
		return nil, fmt.Errorf("failed to query properties: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var prop domain.MetadataProperty
		var propType string

		if err := rows.Scan(
			&prop.TraitType,
			&prop.DisplayType,
			&prop.Value,
			&prop.MaxValue,
			&propType,
		); err != nil {
			return nil, err
		}

		switch propType {
		case "property":
			md.Properties = append(md.Properties, &prop)
		case "ranking":
			md.Rankings = append(md.Rankings, &prop)
		case "stat":
			md.Stats = append(md.Stats, &prop)
		}
	}

	tagsQuery := `
		SELECT tag
		FROM token_metadata_tags
		WHERE metadata_id=$1
	`
	tRows, err := tx.Query(ctx, tagsQuery, md.Id)
	if err != nil {
		return nil, err
	}
	defer tRows.Close()

	for tRows.Next() {
		var tag string
		if err := tRows.Scan(&tag); err != nil {
			return nil, err
		}
		md.Tags = append(md.Tags, tag)
	}

	categoriesQuery := `
		SELECT category
		FROM token_metadata_categories
		WHERE metadata_id=$1
	`
	cRows, err := tx.Query(ctx, categoriesQuery, md.Id)
	if err != nil {
		return nil, err
	}
	defer cRows.Close()

	for cRows.Next() {
		var category string
		if err := cRows.Scan(&category); err != nil {
			return nil, err
		}
		md.Categories = append(md.Categories, category)
	}

	subcategoriesQuery := `
		SELECT subcategory
		FROM token_metadata_subcategories
		WHERE metadata_id=$1
	`
	scRows, err := tx.Query(ctx, subcategoriesQuery, md.Id)
	if err != nil {
		return nil, err
	}
	defer scRows.Close()

	for scRows.Next() {
		var subcategory string
		if err := scRows.Scan(&subcategory); err != nil {
			return nil, err
		}
		md.Subcategories = append(md.Subcategories, subcategory)
	}

	return &md, nil
}

func (p *postgres) InsertMetadata(
	ctx context.Context,
	tx pgx.Tx,
	metadata *domain.TokenMetadata,
	collectionAddress common.Address,
	tokenId *big.Int,
) error {
	// FIXME: too many separate INSERT statements. Use query builder later
	tokenQuery := `
		INSERT INTO token_metadata (
			id, collection_address, token_id, name, description, 
		    image, hidden_file, license, license_url, external_link
		)
		VALUES (DEFAULT,$1,$2,$3,$4,$5,$6,$7,$8,$9)  
		ON CONFLICT ON CONSTRAINT token_metadata_pkey DO NOTHING 
		RETURNING id
	`

	var metadataId int64
	err := tx.QueryRow(ctx, tokenQuery,
		strings.ToLower(collectionAddress.String()),
		tokenId.String(),
		metadata.Name,
		metadata.Description,
		metadata.Image,
		metadata.HiddenFile,
		metadata.License,
		metadata.LicenseUrl,
		metadata.ExternalLink,
	).Scan(&metadataId)
	if err != nil {
		return err
	}

	propertiesQuery := `
		INSERT INTO token_metadata_properties (
		    id, metadata_id, trait_type, display_type, value, max_value, property_type
		)
		VALUES (DEFAULT,$1,$2,$3,$4,$5,$6)  
		ON CONFLICT ON CONSTRAINT token_metadata_properties_pkey DO NOTHING
	`
	for _, attr := range metadata.Properties {
		_, err := tx.Exec(ctx, propertiesQuery,
			metadataId,
			attr.TraitType,
			attr.DisplayType,
			attr.Value,
			"",
			"property",
		)
		if err != nil {
			return err
		}
	}

	for _, stat := range metadata.Stats {
		_, err := tx.Exec(ctx, propertiesQuery,
			metadataId,
			stat.TraitType,
			stat.DisplayType,
			stat.Value,
			stat.MaxValue,
			"stat",
		)
		if err != nil {
			return err
		}
	}

	for _, ranking := range metadata.Rankings {
		_, err := tx.Exec(ctx, propertiesQuery,
			metadataId,
			ranking.TraitType,
			ranking.DisplayType,
			ranking.Value,
			ranking.MaxValue,
			"ranking",
		)
		if err != nil {
			return err
		}
	}

	tagsQuery := `
		INSERT INTO token_metadata_tags (id, metadata_id, tag)
		VALUES (DEFAULT, $1, $2)
		ON CONFLICT ON CONSTRAINT token_metadata_tags_pkey DO NOTHING
	`
	for _, tag := range metadata.Tags {
		_, err := tx.Exec(ctx, tagsQuery, metadataId, tag)
		if err != nil {
			return err
		}
	}

	categoriesQuery := `
		INSERT INTO token_metadata_categories (id, metadata_id, category)
		VALUES (DEFAULT, $1, $2)
		ON CONFLICT ON CONSTRAINT token_metadata_categories_pkey DO NOTHING
	`
	for _, category := range metadata.Categories {
		_, err := tx.Exec(ctx, categoriesQuery, metadataId, category)
		if err != nil {
			return err
		}
	}

	subcategoriesQuery := `
		INSERT INTO token_metadata_subcategories (id, metadata_id, subcategory)
		VALUES (DEFAULT, $1, $2)
		ON CONFLICT ON CONSTRAINT token_metadata_subcategories_pkey DO NOTHING
	`
	for _, subcategory := range metadata.Subcategories {
		_, err := tx.Exec(ctx, subcategoriesQuery, metadataId, subcategory)
		if err != nil {
			return err
		}
	}

	return nil
}
