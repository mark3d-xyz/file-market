package repository

import (
	"context"
	"github.com/ethereum/go-ethereum/common"
	"github.com/jackc/pgx/v4"
	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/mark3d-xyz/mark3d/authserver/internal/domain"
	"github.com/mark3d-xyz/mark3d/authserver/pkg/jwt"
)

type Repository interface {
	Transactions
	Auth
	User
	UserProfile
}

type Transactions interface {
	BeginTransaction(ctx context.Context, opts pgx.TxOptions) (pgx.Tx, error)
	CommitTransaction(ctx context.Context, tx pgx.Tx) error
	RollbackTransaction(ctx context.Context, tx pgx.Tx) error
}

type Auth interface {
	GetAuthMessage(ctx context.Context, tx pgx.Tx, address common.Address) (*domain.AuthMessage, error)
	InsertAuthMessage(ctx context.Context, tx pgx.Tx, msg domain.AuthMessage) error
	DeleteAuthMessage(ctx context.Context, tx pgx.Tx, address common.Address) error
	GetJwtTokenNumber(ctx context.Context, tx pgx.Tx, address common.Address, purpose jwt.Purpose) (int, error)
	InsertJwtToken(ctx context.Context, tx pgx.Tx, tokenData jwt.TokenData) error
	DropJwtTokens(ctx context.Context, tx pgx.Tx, address common.Address, number int) error
	DropAllJwtTokens(ctx context.Context, tx pgx.Tx, address common.Address) error
	GetJwtTokenSecret(ctx context.Context, tx pgx.Tx, address common.Address, number int, purpose jwt.Purpose) (string, error)
}

type UserProfile interface {
	GetUserProfile(ctx context.Context, tx pgx.Tx, address common.Address) (*domain.UserProfile, error)
	GetUserProfileByUsername(ctx context.Context, tx pgx.Tx, username string) (*domain.UserProfile, error)
	GetUserProfileBulk(ctx context.Context, tx pgx.Tx, addresses []string) ([]*domain.UserProfile, error)
	EmailExists(ctx context.Context, tx pgx.Tx, email string) (bool, error)
	NameExists(ctx context.Context, tx pgx.Tx, name string) (bool, error)
	UsernameExists(ctx context.Context, tx pgx.Tx, username string) (bool, error)
	InsertUserProfile(ctx context.Context, tx pgx.Tx, profile *domain.UserProfile) error
	UpdateUserProfile(ctx context.Context, tx pgx.Tx, profile *domain.UserProfile) error
	UpdateUserProfileEmail(ctx context.Context, tx pgx.Tx, email string, isConfirmed bool, address common.Address) error
	GetEmailVerificationToken(ctx context.Context, tx pgx.Tx, token string) (*domain.EmailVerificationToken, error)
	InsertEmailVerificationToken(ctx context.Context, tx pgx.Tx, token *domain.EmailVerificationToken) error
	DeleteAllEmailVerificationTokens(ctx context.Context, tx pgx.Tx, address common.Address) error
}

type User interface {
	GetUserRole(ctx context.Context, tx pgx.Tx, address common.Address) (domain.UserRole, error)
	InsertUser(ctx context.Context, tx pgx.Tx, user *domain.User) error
	UserExists(ctx context.Context, tx pgx.Tx, address common.Address) (bool, error)
}

func New(pg *pgxpool.Pool) Repository {
	return NewPostgres(pg)
}
