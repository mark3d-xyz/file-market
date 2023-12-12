package repository

import (
	"context"
	"math/big"

	"github.com/ethereum/go-ethereum/common"
	"github.com/jackc/pgx/v4"
	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/mark3d-xyz/mark3d/indexer/internal/domain"
	. "github.com/mark3d-xyz/mark3d/indexer/pkg/types"
)

type Postgres interface {
	Transactions
	Collections
	Tokens
	Transfers
	Orders
	Whitelist
	Moderation
	CollectionProfile
}

type Transactions interface {
	BeginTransaction(ctx context.Context, opts pgx.TxOptions) (pgx.Tx, error)
	CommitTransaction(ctx context.Context, tx pgx.Tx) error
	RollbackTransaction(ctx context.Context, tx pgx.Tx) error
}

type Collections interface {
	GetCollectionsByOwnerAddress(ctx context.Context, tx pgx.Tx, address common.Address, lastCollectionAddress *common.Address, limit int) ([]*domain.Collection, error)
	GetCollectionsByOwnerAddressTotal(ctx context.Context, tx pgx.Tx, address common.Address) (uint64, error)
	GetCollection(ctx context.Context, tx pgx.Tx, contractAddress common.Address) (*domain.Collection, error)
	GetCollections(ctx context.Context, tx pgx.Tx, lastCollectionAddress *common.Address, limit int) ([]*domain.Collection, error)
	GetCollectionsTotal(ctx context.Context, tx pgx.Tx) (uint64, error)
	GetCollectionByTokenId(ctx context.Context, tx pgx.Tx, tokenId *big.Int) (*domain.Collection, error)
	GetFileBunniesStats(ctx context.Context, tx pgx.Tx) ([]*domain.CollectionStats, error)
	InsertCollection(ctx context.Context, tx pgx.Tx, collection *domain.Collection) error
	UpdateCollection(ctx context.Context, tx pgx.Tx, collection *domain.Collection) error
	InsertCollectionTransfer(ctx context.Context, tx pgx.Tx, collectionAddress common.Address, transfer *domain.CollectionTransfer) error
	CollectionTransferExists(ctx context.Context, tx pgx.Tx, txId string) (bool, error)
	IsCollectionOwner(ctx context.Context, tx pgx.Tx, owner common.Address, collectionAddress common.Address) (bool, error)
}

type Tokens interface {
	GetCollectionTokens(ctx context.Context, tx pgx.Tx, address common.Address, lastTokenId *big.Int, limit int) ([]*domain.Token, error)
	GetCollectionTokensTotal(ctx context.Context, tx pgx.Tx, address common.Address) (uint64, error)
	GetTokensByAddress(ctx context.Context, tx pgx.Tx, address common.Address, lastCollectionAddress *common.Address, lastTokenId *big.Int, limit int) ([]*domain.Token, error)
	GetTokensByAddressTotal(ctx context.Context, tx pgx.Tx, address common.Address) (uint64, error)
	GetToken(ctx context.Context, tx pgx.Tx, contractAddress common.Address, tokenId *big.Int) (*domain.Token, error)
	GetTokensContentTypeByCollection(ctx context.Context, tx pgx.Tx, address common.Address) ([]string, []string, []string, error)
	InsertToken(ctx context.Context, tx pgx.Tx, token *domain.Token) error
	UpdateToken(ctx context.Context, tx pgx.Tx, token *domain.Token) error
	GetMetadata(ctx context.Context, tx pgx.Tx, address common.Address, tokenId *big.Int) (*domain.TokenMetadata, error)
	InsertMetadata(ctx context.Context, tx pgx.Tx, metadata *domain.TokenMetadata, contractAddress common.Address, tokenId *big.Int) error
	GetTokensForAutosell(ctx context.Context, tx pgx.Tx, collectionAddress common.Address, owner common.Address) ([]AutosellTokenInfo, error)
	UpdateTokenTxData(ctx context.Context, tx pgx.Tx, tokenId *big.Int, collectionAddress common.Address, txTimestamp uint64, hash common.Hash, blockNumber *big.Int) error
	IncrementLike(ctx context.Context, tx pgx.Tx, collectionAddress common.Address, tokenId *big.Int) error
	GetAccountLikeCount(ctx context.Context, tx pgx.Tx, address common.Address) (int64, error)
	IncrementAccountLike(ctx context.Context, tx pgx.Tx, from common.Address) error
}

type Transfers interface {
	GetIncomingTransfersByAddress(ctx context.Context, tx pgx.Tx, address common.Address, lastTransferId *int64, limit int) ([]*domain.Transfer, error)
	GetIncomingTransfersByAddressTotal(ctx context.Context, tx pgx.Tx, address common.Address) (uint64, error)
	GetOutgoingTransfersByAddress(ctx context.Context, tx pgx.Tx, address common.Address, lastTransferId *int64, limit int) ([]*domain.Transfer, error)
	GetOutgoingTransfersByAddressTotal(ctx context.Context, tx pgx.Tx, address common.Address) (uint64, error)
	GetActiveIncomingTransfersByAddress(ctx context.Context, tx pgx.Tx, address common.Address, lastTransferId *int64, limit int) ([]*domain.Transfer, error)
	GetActiveIncomingTransfersByAddressTotal(ctx context.Context, tx pgx.Tx, address common.Address) (uint64, error)
	GetActiveOutgoingTransfersByAddress(ctx context.Context, tx pgx.Tx, address common.Address, lastTransferId *int64, limit int) ([]*domain.Transfer, error)
	GetActiveOutgoingTransfersByAddressTotal(ctx context.Context, tx pgx.Tx, address common.Address) (uint64, error)
	GetTransfer(ctx context.Context, tx pgx.Tx, id int64) (*domain.Transfer, error)
	GetActiveTransfer(ctx context.Context, tx pgx.Tx, contractAddress common.Address, tokenId *big.Int) (*domain.Transfer, error)
	GetTokenEncryptedPassword(ctx context.Context, tx pgx.Tx, contractAddress common.Address, tokenId *big.Int) (string, string, error)
	InsertTransfer(ctx context.Context, tx pgx.Tx, transfer *domain.Transfer) (int64, error)
	UpdateTransfer(ctx context.Context, tx pgx.Tx, transfer *domain.Transfer) error
	InsertTransferStatus(ctx context.Context, tx pgx.Tx, transferId int64, status *domain.TransferStatus) error
	TransferTxExists(ctx context.Context, tx pgx.Tx, tokenId *big.Int, txId common.Hash, status string) (bool, error)
}

type Orders interface {
	GetAllActiveOrders(ctx context.Context, tx pgx.Tx, lastOrderId *int64, limit int) ([]*domain.Order, error)
	GetAllActiveOrdersTotal(ctx context.Context, tx pgx.Tx) (uint64, error)
	GetActiveOrdersByTokenIds(ctx context.Context, tx pgx.Tx, contractAddress common.Address, tokenIds []string) (map[string]*domain.Order, error)
	GetActiveOrdersByTokenIdsAndCollectionAddresses(ctx context.Context, tx pgx.Tx, collectionAddresses []string, tokenIds []string) (map[string]map[string]*domain.Order, error)
	GetIncomingOrdersByAddress(ctx context.Context, tx pgx.Tx, address common.Address) ([]*domain.Order, error)
	GetOutgoingOrdersByAddress(ctx context.Context, tx pgx.Tx, address common.Address) ([]*domain.Order, error)
	GetActiveIncomingOrdersByAddress(ctx context.Context, tx pgx.Tx, address common.Address) ([]*domain.Order, error)
	GetActiveOutgoingOrdersByAddress(ctx context.Context, tx pgx.Tx, address common.Address) ([]*domain.Order, error)
	GetOrder(ctx context.Context, tx pgx.Tx, id int64) (*domain.Order, error)
	GetActiveOrder(ctx context.Context, tx pgx.Tx, contractAddress common.Address, tokenId *big.Int) (*domain.Order, error)
	InsertOrder(ctx context.Context, tx pgx.Tx, order *domain.Order) (int64, error)
	InsertOrderStatus(ctx context.Context, tx pgx.Tx, orderId int64, status *domain.OrderStatus) error
}

type Moderation interface {
	ReportCollection(ctx context.Context, tx pgx.Tx, collectionAddress common.Address, userAddress common.Address) error
	ReportToken(ctx context.Context, tx pgx.Tx, collectionAddress common.Address, tokenId *big.Int, userAddress common.Address) error
}

type Whitelist interface {
	AddressInWhitelist(ctx context.Context, tx pgx.Tx, address common.Address) (string, error)
}

type CollectionProfile interface {
	GetCollectionProfile(ctx context.Context, tx pgx.Tx, address common.Address) (*domain.CollectionProfile, error)
	CollectionProfileExists(ctx context.Context, tx pgx.Tx, address common.Address) (bool, error)
	InsertCollectionProfile(ctx context.Context, tx pgx.Tx, profile *domain.CollectionProfile) error
	UpdateCollectionProfile(ctx context.Context, tx pgx.Tx, profile *domain.CollectionProfile) (*domain.CollectionProfile, error)
}

type postgresConfig struct {
	publicCollectionAddress      common.Address
	fileBunniesCollectionAddress common.Address
}

type postgres struct {
	pg  *pgxpool.Pool
	cfg *postgresConfig
}

func NewPostgres(pg *pgxpool.Pool, cfg *postgresConfig) Postgres {
	return &postgres{
		pg:  pg,
		cfg: cfg,
	}
}
