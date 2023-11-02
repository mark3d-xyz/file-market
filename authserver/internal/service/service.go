package service

import (
	"context"
	"github.com/ethereum/go-ethereum/common"
	"github.com/mark3d-xyz/mark3d/authserver/internal/config"
	"github.com/mark3d-xyz/mark3d/authserver/internal/domain"
	"github.com/mark3d-xyz/mark3d/authserver/internal/repository"
	"github.com/mark3d-xyz/mark3d/authserver/pkg/jwt"
)

type Service interface {
	Auth
	UserProfile
}

type Auth interface {
	GetAuthMessage(ctx context.Context, address common.Address) (*domain.AuthMessageResponse, *domain.APIError)
	AuthBySignature(ctx context.Context, address common.Address, signature string) (*domain.AuthResponse, *domain.APIError)
	RefreshJwtTokens(ctx context.Context, address common.Address, number int64) (*domain.AuthResponse, *domain.APIError)
	GetUserByJwtToken(ctx context.Context, purpose jwt.Purpose, token string) (*domain.Principal, *domain.APIError)
	Logout(ctx context.Context, address common.Address, number int64) *domain.APIError
	FullLogout(ctx context.Context, address common.Address) *domain.APIError
}

type UserProfile interface {
	GetUserProfileByAddress(ctx context.Context, address common.Address, isPrincipal bool) (*domain.UserProfile, *domain.APIError)
	GetUserProfileByUsername(ctx context.Context, username string, isPrincipal bool) (*domain.UserProfile, *domain.APIError)
	GetProfileBulk(ctx context.Context, addresses []string) ([]*domain.UserProfile, *domain.APIError)
	UsernameExist(ctx context.Context, username string) (bool, *domain.APIError)
	EmailExist(ctx context.Context, email string) (bool, *domain.APIError)
	NameExist(ctx context.Context, name string) (bool, *domain.APIError)
	UpdateUserProfile(ctx context.Context, profile *domain.UserProfile) (*domain.UserProfile, *domain.APIError)
	GetProfileByIdentification(ctx context.Context, identification string, isPrincipal bool) (*domain.UserProfile, *domain.APIError)
	SetEmail(ctx context.Context, address common.Address, email string) (*domain.SetEmailResponse, *domain.APIError)
	VerifyEmail(ctx context.Context, secretToken string) (string, *domain.APIError)
}

type service struct {
	cfg        *config.ServiceConfig
	repository repository.Repository
	jwtManager jwt.TokenManager
}

func New(
	cfg *config.ServiceConfig,
	repo repository.Repository,
	jwtManager jwt.TokenManager,
) Service {
	return &service{
		repository: repo,
		cfg:        cfg,
		jwtManager: jwtManager,
	}
}
