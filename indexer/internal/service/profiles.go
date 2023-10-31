package service

import (
	"context"
	"fmt"
	"github.com/mark3d-xyz/mark3d/indexer/models"
	authserver_pb "github.com/mark3d-xyz/mark3d/indexer/proto"
)

func (s *service) GetUserProfile(ctx context.Context, identification string, isPrincipal bool) (*models.UserProfile, *models.ErrorResponse) {
	res, err := s.authClient.GetUserProfile(ctx, &authserver_pb.GetUserProfileRequest{
		Identification: identification,
	})
	if err != nil {
		logger.Error("failed to call GetUserProfile", err, nil)
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
		Twitter:                    res.Twitter,
		Instagram:                  res.Instagram,
		Username:                   res.Username,
		WebsiteURL:                 res.WebsiteURL,
	}

	if !isPrincipal {
		profile.Email = ""
		profile.IsPushNotificationEnabled = false
		profile.IsEmailNotificationEnabled = false
		profile.IsEmailConfirmed = false
	}

	return &profile, nil
}

func (s *service) EmailExists(ctx context.Context, email string) (*models.ProfileEmailExistsResponse, *models.ErrorResponse) {
	res, err := s.authClient.EmailExists(ctx, &authserver_pb.EmailExistsRequest{Email: email})
	if err != nil {
		logger.Error("failed to get email exists", err, nil)
		return nil, grpcErrToHTTP(err)
	}

	return &models.ProfileEmailExistsResponse{
		Exist: res.Exist,
	}, nil
}

func (s *service) NameExists(ctx context.Context, name string) (*models.ProfileNameExistsResponse, *models.ErrorResponse) {
	res, err := s.authClient.NameExists(ctx, &authserver_pb.NameExistsRequest{Name: name})
	if err != nil {
		logger.Error("failed to get name exists", err, nil)
		return nil, grpcErrToHTTP(err)
	}

	return &models.ProfileNameExistsResponse{
		Exist: res.Exist,
	}, nil
}

func (s *service) UsernameExists(ctx context.Context, username string) (*models.ProfileUsernameExistsResponse, *models.ErrorResponse) {
	res, err := s.authClient.UsernameExists(ctx, &authserver_pb.UsernameExistsRequest{Username: username})
	if err != nil {
		logger.Error("failed to get username exists", err, nil)
		return nil, grpcErrToHTTP(err)
	}

	return &models.ProfileUsernameExistsResponse{
		Exist: res.Exist,
	}, nil
}

func (s *service) UpdateUserProfile(ctx context.Context, p *models.UserProfile) (*models.UserProfile, *models.ErrorResponse) {
	arg := authserver_pb.UserProfile{
		AvatarURL:                  p.AvatarURL,
		BannerURL:                  p.BannerURL,
		Bio:                        p.Bio,
		Name:                       p.Name,
		Username:                   p.Username,
		WebsiteURL:                 p.WebsiteURL,
		IsEmailNotificationEnabled: p.IsEmailNotificationEnabled,
		IsPushNotificationEnabled:  p.IsPushNotificationEnabled,
		Twitter:                    p.Twitter,
		Discord:                    p.Discord,
		Telegram:                   p.Telegram,
		Instagram:                  p.Instagram,
	}

	res, err := s.authClient.UpdateUserProfile(ctx, &arg)
	if err != nil {
		logger.Error("failed to call UpdateUserProfile", err, nil)
		return nil, grpcErrToHTTP(err)
	}

	profile := models.UserProfile{
		Address:                    res.Address,
		AvatarURL:                  res.AvatarURL,
		BannerURL:                  res.BannerURL,
		Bio:                        res.Bio,
		Discord:                    res.Discord,
		Email:                      res.Email,
		IsEmailNotificationEnabled: res.IsEmailNotificationEnabled,
		IsPushNotificationEnabled:  res.IsPushNotificationEnabled,
		IsEmailConfirmed:           res.IsEmailConfirmed,
		Name:                       res.Name,
		Telegram:                   res.Telegram,
		Twitter:                    res.Twitter,
		Instagram:                  res.Instagram,
		Username:                   res.Username,
		WebsiteURL:                 res.WebsiteURL,
	}

	return &profile, nil
}

func (s *service) SetEmail(ctx context.Context, email string) *models.ErrorResponse {
	res, err := s.authClient.SetEmail(ctx, &authserver_pb.SetEmailRequest{Email: email})
	if err != nil {
		logger.Error("failed to call SetEmail", err, nil)
		return grpcErrToHTTP(err)
	}

	name := res.Profile.Name
	if name == "" {
		name = "FileMarketer"
	}
	data := emailVerificationTemplateParams{
		Name:               name,
		VerifyUrl:          fmt.Sprintf("%s/api/profile/verify_email?secret_token=%s", s.cfg.Host, res.Token),
		ProfileSettingsUrl: fmt.Sprintf("%s/profile/%s", s.cfg.Host, res.Profile.Address),
		BottomFilename:     "bottompng",
		LogoFilename:       "logopng",
	}
	if err := s.sendEmail(
		"email_verify",
		res.Email,
		"Email Verification",
		"verification",
		data,
	); err != nil {
		logger.Error("failed to send verification email", err, nil)
		return internalError
	}

	return nil
}

func (s *service) VerifyEmail(ctx context.Context, secretToken string) (string, *models.ErrorResponse) {
	res, err := s.authClient.VerifyEmail(ctx, &authserver_pb.VerifyEmailRequest{SecretToken: secretToken})
	if err != nil {
		logger.Error("failed to call VerifyEmail", err, nil)
		return "", grpcErrToHTTP(err)
	}

	link := fmt.Sprintf("%s/profile/%s", s.cfg.Host, res.Address)

	return link, nil
}
