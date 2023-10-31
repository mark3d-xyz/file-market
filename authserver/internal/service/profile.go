package service

import (
	"context"
	"errors"
	"github.com/ethereum/go-ethereum/common"
	"github.com/jackc/pgx/v4"
	"github.com/mark3d-xyz/mark3d/authserver/internal/domain"
	"github.com/mark3d-xyz/mark3d/authserver/internal/repository"
	"github.com/mark3d-xyz/mark3d/authserver/internal/utils"
	"github.com/mark3d-xyz/mark3d/authserver/pkg/validator"
	"log"
	"net/http"
	"strings"
	"time"
)

var banwords = []string{"Protocol Labs", "Protocollabs", "Filecoin", "FIL", "FVM", "EVM", "FileMarket", "FileWallet", "EFT", "EncryptedFileToken", "FileBunnies", "ZKsync", "Ethereum", "Polygon", "Linea", "BNB", "Binance", "Optimism", "Eth", "Fmrt", "Web3", "Web3Jedis", "Jedis", "Jedi", "DAO", "DeFi", "FileFuel"}

func (s *service) GetUserProfileByUsername(
	ctx context.Context,
	username string,
	isPrincipal bool,
) (*domain.UserProfile, *domain.APIError) {
	tx, err := s.repository.BeginTransaction(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("begin tx failed: ", err)
		return nil, domain.InternalError
	}
	defer s.repository.RollbackTransaction(ctx, tx)

	profile, err := s.repository.GetUserProfileByUsername(ctx, tx, username)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, &domain.APIError{
				Code:    http.StatusNotFound,
				Message: "user was not found",
			}
		}
		log.Printf("failed to GetUserProfileByUsername: %s", err.Error())
		return nil, domain.InternalError
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, domain.InternalError
	}

	if !isPrincipal {
		profile.HidePrivateFields()
	}

	return profile, nil
}

func (s *service) GetUserProfileByAddress(
	ctx context.Context,
	address common.Address,
	isPrincipal bool,
) (*domain.UserProfile, *domain.APIError) {
	tx, err := s.repository.BeginTransaction(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("begin tx failed: ", err)
		return nil, domain.InternalError
	}
	defer s.repository.RollbackTransaction(ctx, tx)

	profile, err := s.repository.GetUserProfile(ctx, tx, address)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return &domain.UserProfile{Address: address}, nil
		}

		log.Printf("failed to GetUserProfile: %s", err.Error())
		return nil, domain.InternalError
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, domain.InternalError
	}

	if !isPrincipal {
		profile.HidePrivateFields()
	}

	return profile, nil
}

func (s *service) GetProfileByIdentification(ctx context.Context, identification string, isPrincipal bool) (*domain.UserProfile, *domain.APIError) {
	if identification == "" {
		return nil, &domain.APIError{
			Code:    http.StatusBadRequest,
			Message: "user's address or username is missing",
		}
	}

	identificationType := ""
	if validator.ValidateAddress(&identification) == nil {
		identificationType = "address"
	} else if validator.ValidateUsername(&identification) == nil {
		identificationType = "username"
	} else {
		return nil, &domain.APIError{
			Code:    http.StatusBadRequest,
			Message: "wrong identification",
		}
	}

	// NOTE: exposes private fields
	switch identificationType {
	case "address":
		profile, err := s.GetUserProfileByAddress(ctx, common.HexToAddress(identification), isPrincipal)
		if err != nil {
			return nil, err
		}
		return profile, nil
	case "username":
		profile, err := s.GetUserProfileByUsername(ctx, strings.ToLower(identification), isPrincipal)
		if err != nil {
			return nil, err
		}

		return profile, nil
	default:
		return nil, &domain.APIError{
			Code:    http.StatusBadRequest,
			Message: "user's address or username is wrong",
		}
	}
}

func (s *service) GetProfileBulk(ctx context.Context, addresses []string) ([]*domain.UserProfile, *domain.APIError) {
	tx, err := s.repository.BeginTransaction(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("begin tx failed: ", err)
		return nil, domain.InternalError
	}
	defer s.repository.RollbackTransaction(ctx, tx)

	profiles, err := s.repository.GetUserProfileBulk(ctx, tx, addresses)
	if err != nil {
		log.Printf("failed to GetUserProfile: %s", err.Error())
		return nil, domain.InternalError
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, domain.InternalError
	}

	return profiles, nil
}

func (s *service) EmailExist(ctx context.Context, email string) (bool, *domain.APIError) {
	tx, err := s.repository.BeginTransaction(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("begin tx failed: ", err)
		return false, domain.InternalError
	}
	defer s.repository.RollbackTransaction(ctx, tx)

	exist, err := s.repository.EmailExists(ctx, tx, email)
	if err != nil {
		log.Println("failed to get email exist: ", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return false, domain.InternalError
	}

	return exist, nil
}

func (s *service) NameExist(ctx context.Context, name string) (bool, *domain.APIError) {
	if isForbiddenWord(name, false) {
		return true, nil
	}

	tx, err := s.repository.BeginTransaction(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("begin tx failed: ", err)
		return false, domain.InternalError
	}
	defer s.repository.RollbackTransaction(ctx, tx)

	exist, err := s.repository.NameExists(ctx, tx, name)
	if err != nil {
		log.Println("failed to get name exist: ", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return false, domain.InternalError
	}

	return exist, nil
}

func (s *service) UsernameExist(ctx context.Context, username string) (bool, *domain.APIError) {
	if isForbiddenWord(username, false) {
		return true, nil
	}

	tx, err := s.repository.BeginTransaction(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("begin tx failed: ", err)
		return false, domain.InternalError
	}
	defer s.repository.RollbackTransaction(ctx, tx)

	exist, err := s.repository.UsernameExists(ctx, tx, username)
	if err != nil {
		log.Println("failed to get username exist: ", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return false, domain.InternalError
	}

	return exist, nil
}

func (s *service) UpdateUserProfile(
	ctx context.Context,
	profile *domain.UserProfile,
) (*domain.UserProfile, *domain.APIError) {
	tx, err := s.repository.BeginTransaction(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("begin tx failed: ", err)
		return nil, domain.InternalError
	}
	defer s.repository.RollbackTransaction(ctx, tx)

	oldProfile, err := s.repository.GetUserProfile(ctx, tx, profile.Address)
	if err != nil {
		log.Printf("failed to update profile: %v", err)
		return nil, domain.InternalError
	}

	// check banwords
	if err := checkBanwords(profile, oldProfile); err != nil {
		return nil, err
	}
	updateUserProfileFields(profile, oldProfile)

	if err := s.repository.UpdateUserProfile(ctx, tx, profile); err != nil {
		if errors.As(err, &repository.Error{}) {
			return nil, &domain.APIError{
				Code:    http.StatusBadRequest,
				Message: err.Error(),
			}
		}

		log.Printf("failed to update user profile: %v", err)
		return nil, domain.InternalError
	}

	res, err := s.repository.GetUserProfile(ctx, tx, profile.Address)
	if err != nil {
		log.Printf("failed to get profile: %v", err)
		return nil, domain.InternalError
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, domain.InternalError
	}

	return res, nil
}

func checkBanwords(profile *domain.UserProfile, oldProfile *domain.UserProfile) *domain.APIError {
	if profile.Username != oldProfile.Username && isForbiddenWord(profile.Username, false) {
		return &domain.APIError{
			Code:    http.StatusBadRequest,
			Message: "forbidden username",
		}
	}
	if profile.Name != oldProfile.Name && isForbiddenWord(profile.Name, false) {
		return &domain.APIError{
			Code:    http.StatusBadRequest,
			Message: "forbidden name",
		}
	}
	return nil
}

func isForbiddenWord(word string, caseSensitive bool) bool {
	for _, w := range banwords {
		if caseSensitive {
			if w == word {
				return true
			}
		} else {
			if strings.ToLower(w) == strings.ToLower(word) {
				return true
			}
		}
	}
	return false
}

func (s *service) SetEmail(
	ctx context.Context,
	address common.Address,
	email string,
) (*domain.SetEmailResponse, *domain.APIError) {
	tx, err := s.repository.BeginTransaction(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("begin tx failed: ", err)
		return nil, domain.InternalError
	}
	defer s.repository.RollbackTransaction(ctx, tx)

	exists, err := s.repository.EmailExists(ctx, tx, email)
	if err != nil {
		log.Println("failed to get email exists", err)
		return nil, domain.InternalError
	}

	if exists {
		return nil, &domain.APIError{
			Code:    http.StatusBadRequest,
			Message: "email already taken",
		}
	}

	verificationToken := utils.RandomString(32)
	if err := s.repository.InsertEmailVerificationToken(ctx, tx, &domain.EmailVerificationToken{
		Address:   address,
		Email:     email,
		Token:     verificationToken,
		CreatedAt: time.Now(),
	}); err != nil {
		log.Printf("failed to insert email verification token: %v", err)
		return nil, domain.InternalError
	}

	if err := s.repository.UpdateUserProfileEmail(ctx, tx, email, false, address); err != nil {
		log.Printf("failed to update profile email: %v", err)
		return nil, domain.InternalError
	}

	profile, err := s.repository.GetUserProfile(ctx, tx, address)
	if err != nil {
		log.Printf("failed to get user profile: %v", err)
		return nil, domain.InternalError
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, domain.InternalError
	}

	return &domain.SetEmailResponse{
		Token:   verificationToken,
		Email:   email,
		Profile: profile,
	}, nil
}

func (s *service) VerifyEmail(
	ctx context.Context,
	secretToken string,
) (string, *domain.APIError) {
	tx, err := s.repository.BeginTransaction(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("begin tx failed: ", err)
		return "", domain.InternalError
	}
	defer s.repository.RollbackTransaction(ctx, tx)

	token, err := s.repository.GetEmailVerificationToken(ctx, tx, secretToken)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return "", &domain.APIError{
				Code:    http.StatusNotFound,
				Message: "Token not found",
			}
		}
		log.Printf("failed to get verification token: %v", err)
		return "", domain.InternalError
	}

	if time.Since(token.CreatedAt) > s.cfg.EmailVerificationTokenTTL {
		return "", &domain.APIError{
			Code:    http.StatusBadRequest,
			Message: "Token is expired",
		}
	}

	exists, err := s.repository.EmailExists(ctx, tx, token.Email)
	if err != nil {
		log.Println("failed to get email exists", err)
		return "", domain.InternalError
	}

	if exists {
		return "", &domain.APIError{
			Code:    http.StatusBadRequest,
			Message: "email already taken",
		}
	}

	if err := s.repository.UpdateUserProfileEmail(ctx, tx, token.Email, true, token.Address); err != nil {
		log.Printf("failed to update profile email: %v", err)
		return "", domain.InternalError
	}

	if err := s.repository.DeleteAllEmailVerificationTokens(ctx, tx, token.Address); err != nil {
		log.Printf("failed to delete all verification tokens: %v", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return "", domain.InternalError
	}

	return strings.ToLower(token.Address.String()), nil
}

// updateUserProfileFields updates `new` profile fields except email
func updateUserProfileFields(new *domain.UserProfile, old *domain.UserProfile) {
	if new.Name == "" {
		new.Name = old.Name
	}
	if new.Username == "" {
		new.Username = old.Username
	}
	if new.Bio == "" {
		new.Bio = old.Bio
	}
	if new.WebsiteURL == "" {
		new.WebsiteURL = old.WebsiteURL
	}
	if new.AvatarURL == "" {
		new.AvatarURL = old.AvatarURL
	}
	if new.BannerURL == "" {
		new.BannerURL = old.BannerURL
	}
	if new.Telegram == nil || (new.Telegram != nil && *new.Telegram == "") {
		new.Telegram = old.Telegram
	}
	if new.Twitter == nil || (new.Twitter != nil && *new.Twitter == "") {
		new.Twitter = old.Twitter
	}
	if new.Instagram == nil || (new.Instagram != nil && *new.Instagram == "") {
		new.Instagram = old.Instagram
	}
	if new.Discord == nil || (new.Discord != nil && *new.Discord == "") {
		new.Discord = old.Discord
	}
}
