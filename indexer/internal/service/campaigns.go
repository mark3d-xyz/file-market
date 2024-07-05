package service

import (
	"context"
	"log"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"github.com/jackc/pgx/v4"
	"github.com/mark3d-xyz/mark3d/indexer/models"
)

func (s *service) GetAccountLikeCount(ctx context.Context, from common.Address) (*models.CampaignsLikesResponse, *models.ErrorResponse) {
	tx, err := s.repository.BeginTransaction(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("begin tx failed: ", err)
		return nil, internalError
	}
	defer s.repository.RollbackTransaction(ctx, tx)

	count, err := s.repository.GetAccountLikeCount(ctx, tx, from)
	if err != nil {
		logger.Error("failed to get account likes", err, nil)
		return nil, internalError
	}

	if err := tx.Commit(ctx); err != nil {
		logger.Error("failed to commit db tx", err, nil)
		return nil, internalError
	}

	return &models.CampaignsLikesResponse{
		Result: &models.CampaignsLikesResponseResult{
			IsValid: count > 0,
		},
	}, nil
}

func (s *service) GetAccountTokens(ctx context.Context, from common.Address) (*models.CampaignsTokensResponse, *models.ErrorResponse) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	tokens, e := s.GetTokensByAddress(ctx, from, nil, 10, nil, nil, 10)
	if e != nil {
		return nil, e
	}

	return &models.CampaignsTokensResponse{
		Data: &models.CampaignsTokensResponseData{
			Result: len(tokens.Collections) > 1 || len(tokens.Tokens) > 0,
		},
	}, nil
}

func (s *service) GetScrollQuestAccountLikeCount(ctx context.Context, from common.Address) *models.ScrollQuestResponse {
	res := &models.ScrollQuestResponse{
		Data: &models.ScrollQuestResponseData{
			Result: false,
		},
		Error: &models.ScrollQuestResponseError{
			Code:    500,
			Message: "internal error",
		},
	}

	tx, err := s.repository.BeginTransaction(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("begin tx failed: ", err)
		return res
	}
	defer s.repository.RollbackTransaction(ctx, tx)

	count, err := s.repository.GetAccountLikeCount(ctx, tx, from)
	if err != nil {
		logger.Error("failed to get account likes", err, nil)
		return res
	}

	res.Data.Result = count > 0
	res.Error = nil
	return res
}

func (s *service) GetScrollQuestAccountTokens(ctx context.Context, from common.Address) *models.ScrollQuestResponse {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	res := &models.ScrollQuestResponse{
		Data: &models.ScrollQuestResponseData{
			Result: false,
		},
	}

	tokens, e := s.GetTokensByAddress(ctx, from, nil, 10, nil, nil, 10)
	if e != nil {
		res.Error = &models.ScrollQuestResponseError{
			Code:    500,
			Message: "internal error",
		}
		log.Println("GetScrollQuestAccountTokens: GetTokensByAddress: ", e)
		return res
	}

	res.Data.Result = len(tokens.Collections) > 1 || len(tokens.Tokens) > 0
	return res
}
