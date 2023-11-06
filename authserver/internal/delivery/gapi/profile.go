package gapi

import (
	"context"
	"github.com/mark3d-xyz/mark3d/authserver/internal/domain"
	"github.com/mark3d-xyz/mark3d/authserver/pkg/jwt"
	authserver_pb "github.com/mark3d-xyz/mark3d/authserver/proto"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"log"
	"strings"
)

func (s *GRPCServer) GetUserProfile(ctx context.Context, req *authserver_pb.GetUserProfileRequest) (*authserver_pb.UserProfile, error) {
	ctx, cancel := context.WithTimeout(ctx, s.cfg.RequestTimeout)
	defer cancel()

	profile, e := s.service.GetProfileByIdentification(ctx, req.Identification, true)
	if e != nil {
		return nil, e.ToGRPC()
	}

	return profile.ToGRPC(), nil
}

func (s *GRPCServer) GetUserProfileBulk(ctx context.Context, req *authserver_pb.GetUserProfileBulkRequest) (*authserver_pb.GetUserProfileBulkResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, s.cfg.RequestTimeout)
	defer cancel()

	profiles, e := s.service.GetProfileBulk(ctx, req.Addresses)
	if e != nil {
		return nil, e.ToGRPC()
	}

	grpcProfiles := make([]*authserver_pb.UserProfileShort, 0, len(profiles))
	for _, p := range profiles {
		grpcProfiles = append(grpcProfiles, &authserver_pb.UserProfileShort{
			AvatarURL: p.AvatarURL,
			Name:      p.Name,
			Username:  p.Username,
			Address:   strings.ToLower(p.Address.String()),
		})
	}

	return &authserver_pb.GetUserProfileBulkResponse{Profiles: grpcProfiles}, nil
}

func (s *GRPCServer) EmailExists(ctx context.Context, req *authserver_pb.EmailExistsRequest) (*authserver_pb.EmailExistsResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, s.cfg.RequestTimeout)
	defer cancel()

	exist, err := s.service.EmailExist(ctx, req.Email)
	if err != nil {
		return nil, err.ToGRPC()
	}

	return &authserver_pb.EmailExistsResponse{Exist: exist}, nil
}

func (s *GRPCServer) NameExists(ctx context.Context, req *authserver_pb.NameExistsRequest) (*authserver_pb.NameExistsResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, s.cfg.RequestTimeout)
	defer cancel()

	exist, err := s.service.NameExist(ctx, req.Name)
	if err != nil {
		return nil, err.ToGRPC()
	}

	return &authserver_pb.NameExistsResponse{Exist: exist}, nil
}

func (s *GRPCServer) UsernameExists(ctx context.Context, req *authserver_pb.UsernameExistsRequest) (*authserver_pb.UsernameExistsResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, s.cfg.RequestTimeout)
	defer cancel()

	exist, err := s.service.UsernameExist(ctx, req.Username)
	if err != nil {
		return nil, err.ToGRPC()
	}

	return &authserver_pb.UsernameExistsResponse{Exist: exist}, nil
}

func (s *GRPCServer) UpdateUserProfile(ctx context.Context, req *authserver_pb.UserProfile) (*authserver_pb.UserProfile, error) {
	ctx, err := s.authorizeUser(ctx, jwt.PurposeAccess)
	if err != nil {
		return nil, err
	}

	user, ok := ctx.Value(CtxKeyUser).(*domain.Principal)
	if !ok {
		return nil, status.Errorf(codes.Unauthenticated, "unauthenticated")
	}

	profile := domain.UserProfile{
		Address:                     user.Address,
		AvatarURL:                   req.AvatarURL,
		BannerURL:                   req.BannerURL,
		Bio:                         req.Bio,
		Name:                        req.Name,
		Username:                    req.Username,
		WebsiteURL:                  req.WebsiteURL,
		Twitter:                     &req.Twitter,
		Discord:                     &req.Discord,
		Telegram:                    &req.Telegram,
		Instagram:                   &req.Instagram,
		IsEmailNotificationsEnabled: req.IsEmailNotificationEnabled,
		IsPushNotificationsEnabled:  req.IsPushNotificationEnabled,
	}

	if err := profile.ValidateForUpdate(); err != nil {
		log.Printf("failed to validate auth message reques: %v", err)
		return nil, status.Errorf(codes.InvalidArgument, "failed to validate auth message request: %s", err.Error())
	}

	ctx, cancel := context.WithTimeout(ctx, s.cfg.RequestTimeout)
	defer cancel()

	res, e := s.service.UpdateUserProfile(ctx, &profile)
	if e != nil {
		return nil, e.ToGRPC()
	}

	return res.ToGRPC(), nil
}

func (s *GRPCServer) SetEmail(ctx context.Context, req *authserver_pb.SetEmailRequest) (*authserver_pb.SetEmailResponse, error) {
	ctx, err := s.authorizeUser(ctx, jwt.PurposeAccess)
	if err != nil {
		return nil, err
	}

	user, ok := ctx.Value(CtxKeyUser).(*domain.Principal)
	if !ok {
		return nil, status.Errorf(codes.Unauthenticated, "unauthenticated")
	}

	r := domain.SetEmailRequest{
		Email: req.Email,
	}
	if err := r.Validate(); err != nil {
		log.Printf("failed to validate email verification request: %v", err)
		return nil, status.Errorf(codes.InvalidArgument, "failed to validate email verification request: %s", err.Error())
	}

	ctx, cancel := context.WithTimeout(ctx, s.cfg.RequestTimeout)
	defer cancel()

	res, e := s.service.SetEmail(ctx, user.Address, r.Email)
	if e != nil {
		return nil, e.ToGRPC()
	}

	return &authserver_pb.SetEmailResponse{
		Token:   res.Token,
		Email:   res.Email,
		Profile: res.Profile.ToGRPC(),
	}, nil
}

func (s *GRPCServer) VerifyEmail(ctx context.Context, req *authserver_pb.VerifyEmailRequest) (*authserver_pb.VerifyEmailResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, s.cfg.RequestTimeout)
	defer cancel()

	address, err := s.service.VerifyEmail(ctx, req.SecretToken)
	if err != nil {
		return nil, err.ToGRPC()
	}

	return &authserver_pb.VerifyEmailResponse{Address: address}, nil
}
