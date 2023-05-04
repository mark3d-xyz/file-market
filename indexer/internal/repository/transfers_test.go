package repository

import (
	"context"
	"github.com/ethereum/go-ethereum/common"
	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/mark3d-xyz/mark3d/indexer/internal/domain"
	"github.com/stretchr/testify/assert"
	"math/big"
	"testing"
)

func Test_postgres_GetTokenEncryptedPassword(t *testing.T) {
	dbPool, err := pgxpool.Connect(context.Background(), "postgres://indexer:1337@localhost:1338/mark3d_indexer")
	if err != nil {
		t.Fatalf("failed to connect to db: %v", err)
	}
	defer dbPool.Close()

	p := &postgres{pg: dbPool}
	ctx := context.Background()

	collection := domain.Collection{
		Address: common.BigToAddress(big.NewInt(0)),
		TokenId: big.NewInt(0),
	}

	metadata := domain.TokenMetadata{
		HiddenFileMeta: &domain.HiddenFileMetadata{},
		Properties:     []*domain.MetadataProperty{},
		Rankings:       []*domain.MetadataProperty{},
		Stats:          []*domain.MetadataProperty{},
		Categories:     []string{},
		Subcategories:  []string{},
		Tags:           []string{},
	}

	token := domain.Token{
		CollectionAddress: collection.Address,
		TokenId:           big.NewInt(0),
		Owner:             common.Address{},
		Creator:           common.Address{},
		MintTxHash:        common.Hash{},
		Metadata:          &metadata,
	}

	transfer1 := domain.Transfer{
		CollectionAddress: token.CollectionAddress,
		TokenId:           token.TokenId,
		EncryptedPassword: "pass123",
		Number:            big.NewInt(1),
	}

	transfer2 := domain.Transfer{
		CollectionAddress: token.CollectionAddress,
		TokenId:           token.TokenId,
		EncryptedPassword: "WRONG",
		Number:            big.NewInt(2),
	}

	transferStatus1 := domain.TransferStatus{
		Timestamp: 4,
		Status:    "Finished",
		TxId:      common.Hash{},
	}

	transferStatus2 := domain.TransferStatus{
		Timestamp: 5,
		Status:    "Finished",
		TxId:      common.Hash{},
	}

	tx, err := p.pg.Begin(ctx)
	if err != nil {
		t.Fatalf("failed to start transaction: %v", err)
	}
	defer tx.Rollback(ctx)

	err = p.InsertCollection(ctx, tx, &collection)
	if err != nil {
		t.Fatalf("failed to insert collection: %v", err)
	}

	err = p.InsertToken(ctx, tx, &token)
	if err != nil {
		t.Fatalf("failed to insert token: %v", err)
	}

	trId1, err := p.InsertTransfer(ctx, tx, &transfer1)
	if err != nil {
		t.Fatalf("failed to insert transfer 1: %v", err)
	}

	trId2, err := p.InsertTransfer(ctx, tx, &transfer2)
	if err != nil {
		t.Fatalf("failed to insert transfer 1: %v", err)
	}

	err = p.InsertTransferStatus(ctx, tx, trId1, &transferStatus1)
	if err != nil {
		t.Fatalf("failed to insert transfer status 1: %v", err)
	}

	err = p.InsertTransferStatus(ctx, tx, trId2, &transferStatus2)
	if err != nil {
		t.Fatalf("failed to insert transfer status 2: %v", err)
	}

	// Do
	pwd, num, err := p.GetTokenEncryptedPassword(ctx, tx, token.CollectionAddress, token.TokenId)
	if err != nil {
		t.Fatalf("%v", err)
	}

	assert.Equal(t, transfer2.Number.String(), num)
	assert.Equal(t, transfer2.EncryptedPassword, pwd)
}
