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

func (p *postgres) GetIncomingTransfersByAddress(
	ctx context.Context,
	tx pgx.Tx,
	address common.Address,
) ([]*domain.Transfer, error) {
	// language=PostgreSQL
	query := `
		SELECT 
			t.id,
			t.collection_address,
			t.token_id,
			t.from_address,
			t.to_address,
			t.fraud_approved,
			COALESCE(o.id, 0),
			t.public_key,
			t.encrypted_password,
			t.number
		FROM transfers AS t 
        LEFT JOIN orders o on t.id = o.transfer_id
        WHERE t.to_address=$1 
		ORDER BY id DESC
	`
	rows, err := tx.Query(ctx, query, strings.ToLower(address.String()))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var (
		res []*domain.Transfer
		ids []int64
	)
	for rows.Next() {
		var collectionAddress, tokenId, from, to, number string
		t := &domain.Transfer{}

		err := rows.Scan(
			&t.Id,
			&collectionAddress,
			&tokenId,
			&from,
			&to,
			&t.FraudApproved,
			&t.OrderId,
			&t.PublicKey,
			&t.EncryptedPassword,
			&number,
		)
		if err != nil {
			return nil, err
		}

		t.CollectionAddress = common.HexToAddress(collectionAddress)
		t.FromAddress = common.HexToAddress(from)
		t.ToAddress = common.HexToAddress(to)

		var ok bool
		t.TokenId, ok = big.NewInt(0).SetString(tokenId, 10)
		if !ok {
			return nil, fmt.Errorf("failed to parse big int: %s", tokenId)
		}

		t.Number, ok = big.NewInt(0).SetString(number, 10)
		if !ok {
			return nil, fmt.Errorf("failed to parse big int: %s", number)
		}

		res, ids = append(res, t), append(ids, t.Id)
	}
	statuses, err := p.getTransferStatuses(ctx, tx, ids)
	if err != nil {
		return nil, err
	}
	for _, t := range res {
		t.Statuses = statuses[t.Id]
	}
	return res, nil
}

func (p *postgres) GetOutgoingTransfersByAddress(
	ctx context.Context,
	tx pgx.Tx,
	address common.Address,
) ([]*domain.Transfer, error) {
	// language=PostgreSQL
	query := `
		SELECT 
			t.id,
			t.collection_address,
			t.token_id,
			t.from_address,
			t.to_address,
			t.fraud_approved,
			COALESCE(o.id, 0),
			t.public_key,
			t.encrypted_password,
			t.number
		FROM transfers AS t 
        LEFT JOIN orders o on t.id = o.transfer_id 
		WHERE t.from_address=$1 
		ORDER BY id DESC
	`

	rows, err := tx.Query(ctx, query, strings.ToLower(address.String()))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var (
		res []*domain.Transfer
		ids []int64
	)
	for rows.Next() {
		var collectionAddress, tokenId, from, to, number string
		t := &domain.Transfer{}

		err := rows.Scan(
			&t.Id,
			&collectionAddress,
			&tokenId,
			&from,
			&to,
			&t.FraudApproved,
			&t.OrderId,
			&t.PublicKey,
			&t.EncryptedPassword,
			&number,
		)
		if err != nil {
			return nil, err
		}

		t.CollectionAddress = common.HexToAddress(collectionAddress)
		t.FromAddress = common.HexToAddress(from)
		t.ToAddress = common.HexToAddress(to)

		var ok bool
		t.TokenId, ok = big.NewInt(0).SetString(tokenId, 10)
		if !ok {
			return nil, fmt.Errorf("failed to parse big int: %s", tokenId)
		}

		t.Number, ok = big.NewInt(0).SetString(number, 10)
		if !ok {
			return nil, fmt.Errorf("failed to parse big int: %s", number)
		}

		res, ids = append(res, t), append(ids, t.Id)
	}
	statuses, err := p.getTransferStatuses(ctx, tx, ids)
	if err != nil {
		return nil, err
	}

	for _, t := range res {
		t.Statuses = statuses[t.Id]
	}

	return res, nil
}

func (p *postgres) GetActiveIncomingTransfersByAddress(
	ctx context.Context,
	tx pgx.Tx,
	address common.Address,
) ([]*domain.Transfer, error) {
	// language=PostgreSQL
	query := `
		SELECT 
			t.id, 
			t.collection_address, 
			t.token_id, 
			t.from_address, 
			t.to_address, 
			t.fraud_approved, 
			COALESCE(o.id, 0), 
			t.public_key, 
			t.encrypted_password,
			t.number
		FROM transfers AS t 
		LEFT JOIN orders o on t.id = o.transfer_id 
		WHERE 
			t.to_address = $1 
			AND NOT (
				SELECT 
					ts.status 
				FROM 
					transfer_statuses AS ts 
				WHERE 
					ts.transfer_id = t.id 
				AND ts.timestamp =(
					SELECT 
						MAX(ts2.timestamp) 
					FROM 
						transfer_statuses AS ts2 
					WHERE 
						ts2.transfer_id = t.id
				)
			)= ANY('{Finished,Cancelled}') 
		ORDER BY 
			t.id DESC
	`

	rows, err := tx.Query(ctx, query, strings.ToLower(address.String()))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var (
		res []*domain.Transfer
		ids []int64
	)
	for rows.Next() {
		var collectionAddress, tokenId, from, to, number string
		t := &domain.Transfer{}

		err := rows.Scan(
			&t.Id,
			&collectionAddress,
			&tokenId,
			&from,
			&to,
			&t.FraudApproved,
			&t.OrderId,
			&t.PublicKey,
			&t.EncryptedPassword,
			&number,
		)
		if err != nil {
			return nil, err
		}

		t.CollectionAddress = common.HexToAddress(collectionAddress)
		t.FromAddress = common.HexToAddress(from)
		t.ToAddress = common.HexToAddress(to)

		var ok bool
		t.TokenId, ok = big.NewInt(0).SetString(tokenId, 10)
		if !ok {
			return nil, fmt.Errorf("failed to parse big int: %s", tokenId)
		}

		t.Number, ok = big.NewInt(0).SetString(number, 10)
		if !ok {
			return nil, fmt.Errorf("failed to parse big int: %s", number)
		}

		res, ids = append(res, t), append(ids, t.Id)
	}
	statuses, err := p.getTransferStatuses(ctx, tx, ids)
	if err != nil {
		return nil, err
	}
	for _, t := range res {
		t.Statuses = statuses[t.Id]
	}
	return res, nil
}

func (p *postgres) GetActiveOutgoingTransfersByAddress(
	ctx context.Context,
	tx pgx.Tx,
	address common.Address,
) ([]*domain.Transfer, error) {
	// language=PostgreSQL
	query := `
		SELECT 
			t.id, 
			t.collection_address, 
			t.token_id, 
			t.from_address, 
			t.to_address, 
			t.fraud_approved, 
			COALESCE(o.id, 0), 
			t.public_key, 
			t.encrypted_password,
			t.number
		FROM 
			transfers AS t 
		LEFT JOIN orders o on t.id = o.transfer_id 
		WHERE 
			t.from_address = $1 
			AND NOT (
				SELECT 
					ts.status 
				FROM 
					transfer_statuses AS ts 
				WHERE 
					ts.transfer_id = t.id 
				AND ts.timestamp =(
					SELECT 
						MAX(ts2.timestamp) 
					FROM 
						transfer_statuses AS ts2 
					WHERE 
						ts2.transfer_id = t.id
				)
			)= ANY('{Finished,Cancelled}') 
		ORDER BY 
			t.id DESC
	`

	rows, err := tx.Query(ctx, query, strings.ToLower(address.String()))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var (
		res []*domain.Transfer
		ids []int64
	)
	for rows.Next() {
		var collectionAddress, tokenId, from, to, number string
		t := &domain.Transfer{}

		err := rows.Scan(
			&t.Id,
			&collectionAddress,
			&tokenId,
			&from,
			&to,
			&t.FraudApproved,
			&t.OrderId,
			&t.PublicKey,
			&t.EncryptedPassword,
			&number,
		)
		if err != nil {
			return nil, err
		}

		t.CollectionAddress = common.HexToAddress(collectionAddress)
		t.FromAddress = common.HexToAddress(from)
		t.ToAddress = common.HexToAddress(to)

		var ok bool
		t.TokenId, ok = big.NewInt(0).SetString(tokenId, 10)
		if !ok {
			return nil, fmt.Errorf("failed to parse big int: %s", tokenId)
		}

		t.Number, ok = big.NewInt(0).SetString(number, 10)
		if !ok {
			return nil, fmt.Errorf("failed to parse big int: %s", number)
		}

		res, ids = append(res, t), append(ids, t.Id)
	}
	statuses, err := p.getTransferStatuses(ctx, tx, ids)
	if err != nil {
		return nil, err
	}
	for _, t := range res {
		t.Statuses = statuses[t.Id]
	}
	return res, nil
}

func (p *postgres) getTransferStatuses(
	ctx context.Context,
	tx pgx.Tx,
	ids []int64,
) (map[int64][]*domain.TransferStatus, error) {
	// language=PostgreSQL
	query := `
		SELECT 
			transfer_id,
			timestamp,
			status,
			tx_id
		FROM transfer_statuses 
		WHERE transfer_id=ANY($1) 
		ORDER BY transfer_id,timestamp DESC
	`
	rows, err := tx.Query(ctx, query, ids)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	res := make(map[int64][]*domain.TransferStatus, len(ids))
	for rows.Next() {
		var (
			transferId int64
			txId       string
		)
		s := &domain.TransferStatus{}

		err := rows.Scan(
			&transferId,
			&s.Timestamp,
			&s.Status,
			&txId,
		)
		if err != nil {
			return nil, err
		}
		s.TxId = common.HexToHash(txId)
		res[transferId] = append(res[transferId], s)
	}
	return res, nil
}

func (p *postgres) GetTransfer(ctx context.Context, tx pgx.Tx, id int64) (*domain.Transfer, error) {
	// language=PostgreSQL
	query := `
		SELECT 
			t.id, 
			t.collection_address, 
			t.token_id, 
			t.from_address, 
			t.to_address, 
			t.fraud_approved, 
			COALESCE(o.id, 0), 
			t.public_key, 
			t.encrypted_password,
			t.number
		FROM transfers AS t 
		LEFT JOIN orders o on t.id = o.transfer_id 
		WHERE t.id = $1
	`
	row := tx.QueryRow(ctx, query, id)

	var collectionAddress, tokenId, from, to, number string
	t := &domain.Transfer{}

	err := row.Scan(
		&t.Id,
		&collectionAddress,
		&tokenId,
		&from,
		&to,
		&t.FraudApproved,
		&t.OrderId,
		&t.PublicKey,
		&t.EncryptedPassword,
		&number,
	)
	if err != nil {
		return nil, err
	}

	t.CollectionAddress = common.HexToAddress(collectionAddress)
	t.FromAddress = common.HexToAddress(from)
	t.ToAddress = common.HexToAddress(to)

	var ok bool
	t.TokenId, ok = big.NewInt(0).SetString(tokenId, 10)
	if !ok {
		return nil, fmt.Errorf("failed to parse big int: %s", tokenId)
	}

	t.Number, ok = big.NewInt(0).SetString(number, 10)
	if !ok {
		return nil, fmt.Errorf("failed to parse big int: %s", number)
	}

	statuses, err := p.getTransferStatuses(ctx, tx, []int64{t.Id})
	if err != nil {
		return nil, err
	}
	t.Statuses = statuses[t.Id]
	return t, nil
}

func (p *postgres) GetActiveTransfer(
	ctx context.Context,
	tx pgx.Tx,
	contractAddress common.Address,
	tokenId *big.Int,
) (*domain.Transfer, error) {
	// language=PostgreSQL
	query := `
		SELECT 
			t.id, t.from_address, t.to_address, t.fraud_approved, t.public_key, 
			t.encrypted_password, t.number,
			COALESCE(o.id, 0)
		FROM transfers AS t 
		LEFT JOIN orders o on t.id = o.transfer_id 
		WHERE collection_address = $1 
			AND token_id = $2 
			AND NOT (
				SELECT ts.status 
				FROM transfer_statuses AS ts 
				WHERE ts.transfer_id = t.id 
					AND ts.timestamp =(
						SELECT MAX(ts2.timestamp) 
						FROM transfer_statuses AS ts2 
						WHERE ts2.transfer_id = t.id
					)
			)= ANY('{Finished,Cancelled}')
	`
	row := tx.QueryRow(ctx, query, strings.ToLower(contractAddress.String()), tokenId.String())

	var from, to, number string
	t := &domain.Transfer{
		CollectionAddress: contractAddress,
		TokenId:           tokenId,
	}

	err := row.Scan(
		&t.Id,
		&from,
		&to,
		&t.FraudApproved,
		&t.PublicKey,
		&t.EncryptedPassword,
		&number,
		&t.OrderId,
	)
	if err != nil {
		return nil, err
	}

	t.FromAddress = common.HexToAddress(from)
	t.ToAddress = common.HexToAddress(to)

	var ok bool
	t.Number, ok = big.NewInt(0).SetString(number, 10)
	if !ok {
		return nil, fmt.Errorf("failed to parse big int: %s", number)
	}

	statuses, err := p.getTransferStatuses(ctx, tx, []int64{t.Id})
	if err != nil {
		return nil, err
	}
	t.Statuses = statuses[t.Id]
	return t, nil
}

func (p *postgres) InsertTransfer(ctx context.Context, tx pgx.Tx, transfer *domain.Transfer) (int64, error) {
	// language=PostgreSQL
	row := tx.QueryRow(ctx, `INSERT INTO transfers VALUES (DEFAULT,$1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
		strings.ToLower(transfer.CollectionAddress.String()),
		transfer.TokenId.String(),
		strings.ToLower(transfer.FromAddress.String()),
		strings.ToLower(transfer.ToAddress.String()),
		transfer.FraudApproved,
		transfer.PublicKey,
		transfer.EncryptedPassword,
		transfer.Number.String(),
	)
	var id int64
	if err := row.Scan(&id); err != nil {
		return 0, err
	}
	return id, nil
}

func (p *postgres) UpdateTransfer(ctx context.Context, tx pgx.Tx, transfer *domain.Transfer) error {
	// language=PostgreSQL
	query := `
		UPDATE transfers 
		SET 
			to_address=$1,
			fraud_approved=$2,
            public_key=$3,
			encrypted_password=$4,
			number=$5
		WHERE id=$6
	`
	_, err := tx.Exec(
		ctx,
		query,
		strings.ToLower(transfer.ToAddress.String()),
		transfer.FraudApproved,
		transfer.PublicKey,
		transfer.EncryptedPassword,
		transfer.Number.String(),
		transfer.Id,
	)
	if err != nil {
		return err
	}
	return nil
}

func (p *postgres) InsertTransferStatus(ctx context.Context, tx pgx.Tx, transferId int64,
	status *domain.TransferStatus) error {
	// language=PostgreSQL
	if _, err := tx.Exec(ctx, `INSERT INTO transfer_statuses VALUES ($1,$2,$3,$4)`,
		transferId, status.Timestamp, status.Status, strings.ToLower(status.TxId.String())); err != nil {
		return err
	}
	return nil
}

func (p *postgres) TransferTxExists(ctx context.Context, tx pgx.Tx, txId common.Hash, status string) (bool, error) {
	// language=PostgreSQL
	row := tx.QueryRow(
		ctx,
		`SELECT COUNT(*) FROM transfer_statuses WHERE lower(tx_id)=$1 AND status=$2`,
		strings.ToLower(txId.Hex()),
		status,
	)

	var count int64
	if err := row.Scan(&count); err != nil {
		return false, err
	}
	return count > 0, nil
}

func (p *postgres) GetTokenEncryptedPassword(
	ctx context.Context,
	tx pgx.Tx,
	contractAddress common.Address,
	tokenId *big.Int,
) (string, string, error) {
	// language=PostgreSQL
	query := `
		WITH latest_transfer_statuses AS (
			SELECT transfer_id, status, timestamp
			FROM transfer_statuses
			WHERE status = ANY('{Finished,PasswordSet}')
				AND transfer_id IN (
					SELECT id
					FROM transfers
					WHERE collection_address = $1
						AND token_id = $2
				)
			ORDER BY timestamp DESC
			LIMIT 1
		)
		SELECT t.number, t.encrypted_password
		FROM transfers t
		JOIN latest_transfer_statuses lts ON t.id = lts.transfer_id;
	`

	row := tx.QueryRow(
		ctx,
		query,
		strings.ToLower(contractAddress.String()),
		tokenId.String(),
	)

	var pwd, number string

	err := row.Scan(&number, &pwd)

	if err != nil {
		return "", "", err
	}

	return pwd, number, nil
}
