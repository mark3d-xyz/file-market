package repository

import (
	"context"
	"math/big"

	"github.com/ethereum/go-ethereum/common"
	"github.com/jackc/pgx/v4"
	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/mark3d-xyz/mark3d/indexer/internal/domain"
)

type Postgres interface {
	Transactions
	Collections
	Tokens
	Transfers
	Orders
}

type Transactions interface {
	BeginTransaction(ctx context.Context, opts pgx.TxOptions) (pgx.Tx, error)
	CommitTransaction(ctx context.Context, tx pgx.Tx) error
	RollbackTransaction(ctx context.Context, tx pgx.Tx) error
}

type Collections interface {
	GetCollectionsByAddress(ctx context.Context, tx pgx.Tx, address common.Address) ([]*domain.Collection, error)
	GetCollection(ctx context.Context, tx pgx.Tx, contractAddress common.Address) (*domain.Collection, error)
	GetCollectionsByTokenId(ctx context.Context, tx pgx.Tx, tokenId *big.Int) (*domain.Collection, error)
	InsertCollection(ctx context.Context, tx pgx.Tx, collection *domain.Collection) error
	UpdateCollection(ctx context.Context, tx pgx.Tx, collection *domain.Collection) error
	InsertCollectionTransfer(ctx context.Context, tx pgx.Tx, collectionAddress common.Address, transfer *domain.CollectionTransfer) error
	CollectionTransferExists(ctx context.Context, tx pgx.Tx, txId string) (bool, error)
}

type Tokens interface {
	GetCollectionTokens(ctx context.Context, tx pgx.Tx, address common.Address) ([]*domain.Token, error)
	GetTokensByAddress(ctx context.Context, tx pgx.Tx, address common.Address) ([]*domain.Token, error)
	GetToken(ctx context.Context, tx pgx.Tx, contractAddress common.Address, tokenId *big.Int) (*domain.Token, error)
	InsertToken(ctx context.Context, tx pgx.Tx, token *domain.Token) error
	UpdateToken(ctx context.Context, tx pgx.Tx, token *domain.Token) error
	GetMetadata(ctx context.Context, tx pgx.Tx, address common.Address, tokenId *big.Int) (*domain.TokenMetadata, error)
	InsertMetadata(ctx context.Context, tx pgx.Tx, metadata *domain.TokenMetadata, contractAddress common.Address, tokenId *big.Int) error
}

type Transfers interface {
	GetIncomingTransfersByAddress(ctx context.Context, tx pgx.Tx, address common.Address) ([]*domain.Transfer, error)
	GetOutgoingTransfersByAddress(ctx context.Context, tx pgx.Tx, address common.Address) ([]*domain.Transfer, error)
	GetActiveIncomingTransfersByAddress(ctx context.Context, tx pgx.Tx, address common.Address) ([]*domain.Transfer, error)
	GetActiveOutgoingTransfersByAddress(ctx context.Context, tx pgx.Tx, address common.Address) ([]*domain.Transfer, error)
	GetTransfer(ctx context.Context, tx pgx.Tx, id int64) (*domain.Transfer, error)
	GetActiveTransfer(ctx context.Context, tx pgx.Tx, contractAddress common.Address, tokenId *big.Int) (*domain.Transfer, error)
	GetTokenEncryptedPassword(ctx context.Context, tx pgx.Tx, contractAddress common.Address, tokenId *big.Int) (string, string, error)
	InsertTransfer(ctx context.Context, tx pgx.Tx, transfer *domain.Transfer) (int64, error)
	UpdateTransfer(ctx context.Context, tx pgx.Tx, transfer *domain.Transfer) error
	InsertTransferStatus(ctx context.Context, tx pgx.Tx, transferId int64, status *domain.TransferStatus) error
	TransferTxExists(ctx context.Context, tx pgx.Tx, txId common.Hash, status string) (bool, error)
}

type Orders interface {
	GetAllActiveOrders(ctx context.Context, tx pgx.Tx) ([]*domain.Order, error)
	GetIncomingOrdersByAddress(ctx context.Context, tx pgx.Tx, address common.Address) ([]*domain.Order, error)
	GetOutgoingOrdersByAddress(ctx context.Context, tx pgx.Tx, address common.Address) ([]*domain.Order, error)
	GetActiveIncomingOrdersByAddress(ctx context.Context, tx pgx.Tx, address common.Address) ([]*domain.Order, error)
	GetActiveOutgoingOrdersByAddress(ctx context.Context, tx pgx.Tx, address common.Address) ([]*domain.Order, error)
	GetOrder(ctx context.Context, tx pgx.Tx, id int64) (*domain.Order, error)
	GetActiveOrder(ctx context.Context, tx pgx.Tx, contractAddress common.Address, tokenId *big.Int) (*domain.Order, error)
	InsertOrder(ctx context.Context, tx pgx.Tx, order *domain.Order) (int64, error)
	InsertOrderStatus(ctx context.Context, tx pgx.Tx, orderId int64, status *domain.OrderStatus) error
}

type postgres struct {
	pg *pgxpool.Pool
}

func NewPostgres(pg *pgxpool.Pool) Postgres {
	return &postgres{
		pg: pg,
	}
}
