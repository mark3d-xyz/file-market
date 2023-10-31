package service

import (
	"context"
	"github.com/ethereum/go-ethereum/common"
	"github.com/golang/protobuf/ptypes/empty"
	"github.com/mark3d-xyz/mark3d/indexer/internal/domain"
	"github.com/mark3d-xyz/mark3d/indexer/models"
	"github.com/mark3d-xyz/mark3d/indexer/pkg/jwt"
	authserver_pb "github.com/mark3d-xyz/mark3d/indexer/proto"
)

func (s *service) AuthBySignature(ctx context.Context, req models.AuthBySignatureRequest) (*models.AuthResponse, *models.ErrorResponse) {
	res, err := s.authClient.AuthBySignature(ctx, &authserver_pb.AuthBySignatureRequest{
		Address:   *req.Address,
		Signature: *req.Signature,
	})
	if err != nil {
		logger.Error("failed to auth by signature", err, nil)
		return nil, grpcErrToHTTP(err)
	}

	accessToken := models.JwtTokenInfo{
		ExpiresAt: &res.AccessToken.ExpiresAt,
		Token:     &res.AccessToken.Token,
	}
	refreshToken := models.JwtTokenInfo{
		ExpiresAt: &res.RefreshToken.ExpiresAt,
		Token:     &res.RefreshToken.Token,
	}
	profile := models.UserProfile{
		Address:                    res.Profile.Address,
		AvatarURL:                  res.Profile.AvatarURL,
		BannerURL:                  res.Profile.BannerURL,
		Bio:                        res.Profile.Bio,
		Discord:                    res.Profile.Discord,
		Email:                      res.Profile.Email,
		IsEmailConfirmed:           res.Profile.IsEmailConfirmed,
		IsEmailNotificationEnabled: res.Profile.IsEmailNotificationEnabled,
		IsPushNotificationEnabled:  res.Profile.IsPushNotificationEnabled,
		Name:                       res.Profile.Name,
		Telegram:                   res.Profile.Telegram,
		Twitter:                    res.Profile.Twitter,
		Instagram:                  res.Profile.Instagram,
		Username:                   res.Profile.Username,
		WebsiteURL:                 res.Profile.WebsiteURL,
	}

	return &models.AuthResponse{
		AccessToken:  &accessToken,
		RefreshToken: &refreshToken,
		Profile:      &profile,
	}, nil
}

func (s *service) GetAuthMessage(ctx context.Context, req models.AuthMessageRequest) (*models.AuthMessageResponse, *models.ErrorResponse) {
	res, err := s.authClient.GetAuthMessage(ctx, &authserver_pb.AuthMessageRequest{
		Address: *req.Address,
	})
	if err != nil {
		logger.Error("failed to get auth message", err, nil)
		return nil, grpcErrToHTTP(err)
	}

	return &models.AuthMessageResponse{Message: &res.Message}, nil
}

func (s *service) RefreshJwtTokens(ctx context.Context) (*models.AuthResponse, *models.ErrorResponse) {
	res, err := s.authClient.RefreshTokens(ctx, &empty.Empty{})
	if err != nil {
		logger.Error("failed to refresh jwt", err, nil)
		return nil, grpcErrToHTTP(err)
	}

	accessToken := models.JwtTokenInfo{
		ExpiresAt: &res.AccessToken.ExpiresAt,
		Token:     &res.AccessToken.Token,
	}
	refreshToken := models.JwtTokenInfo{
		ExpiresAt: &res.RefreshToken.ExpiresAt,
		Token:     &res.RefreshToken.Token,
	}
	profile := models.UserProfile{
		Address:                    res.Profile.Address,
		AvatarURL:                  res.Profile.AvatarURL,
		BannerURL:                  res.Profile.BannerURL,
		Bio:                        res.Profile.Bio,
		Discord:                    res.Profile.Discord,
		Email:                      res.Profile.Email,
		IsEmailNotificationEnabled: res.Profile.IsEmailNotificationEnabled,
		IsPushNotificationEnabled:  res.Profile.IsPushNotificationEnabled,
		Name:                       res.Profile.Name,
		Telegram:                   res.Profile.Telegram,
		Twitter:                    res.Profile.Twitter,
		Instagram:                  res.Profile.Instagram,
		Username:                   res.Profile.Username,
		WebsiteURL:                 res.Profile.WebsiteURL,
	}

	return &models.AuthResponse{
		AccessToken:  &accessToken,
		RefreshToken: &refreshToken,
		Profile:      &profile,
	}, nil

}

func (s *service) GetUserByJwtToken(ctx context.Context, purpose jwt.Purpose, token string) (*domain.User, *models.ErrorResponse) {
	res, err := s.authClient.GetUserByJwtToken(ctx, &authserver_pb.GetUserByJwtTokenRequest{
		Purpose: int32(purpose),
		Token:   token,
	})
	if err != nil {
		logger.Error("failed to get uset by jwt", err, nil)
		return nil, grpcErrToHTTP(err)
	}

	return &domain.User{
		Address: common.HexToAddress(res.Address),
		Role:    domain.UserRole(res.Role),
	}, nil
}

func (s *service) Logout(ctx context.Context) (*models.SuccessResponse, *models.ErrorResponse) {
	res, err := s.authClient.Logout(ctx, &empty.Empty{})
	if err != nil {
		logger.Error("failed to logout", err, nil)
		return nil, grpcErrToHTTP(err)
	}

	return &models.SuccessResponse{Success: &res.Success}, nil
}

func (s *service) FullLogout(ctx context.Context) (*models.SuccessResponse, *models.ErrorResponse) {
	res, err := s.authClient.FullLogout(ctx, &empty.Empty{})
	if err != nil {
		logger.Error("failed to full logout", err, nil)
		return nil, grpcErrToHTTP(err)
	}

	return &models.SuccessResponse{Success: &res.Success}, nil
}

func (s *service) CheckAuth(ctx context.Context) (*models.UserProfile, *models.ErrorResponse) {
	res, err := s.authClient.CheckAuth(ctx, &empty.Empty{})
	if err != nil {
		logger.Error("failed to check auth", err, nil)
		return nil, grpcErrToHTTP(err)
	}

	profile := models.UserProfile{
		Address:                    res.Address,
		AvatarURL:                  res.AvatarURL,
		BannerURL:                  res.BannerURL,
		Bio:                        res.Bio,
		Discord:                    res.Discord,
		Email:                      res.Email,
		IsEmailConfirmed:           res.IsEmailConfirmed,
		IsEmailNotificationEnabled: res.IsEmailNotificationEnabled,
		IsPushNotificationEnabled:  res.IsPushNotificationEnabled,
		Name:                       res.Name,
		Telegram:                   res.Telegram,
		Instagram:                  res.Instagram,
		Twitter:                    res.Twitter,
		Username:                   res.Username,
		WebsiteURL:                 res.WebsiteURL,
	}

	return &profile, nil
}
