package service

import (
	"context"
	"log"
	"math/big"

	"github.com/ethereum/go-ethereum/common"
	"github.com/jackc/pgx/v4"
	"github.com/mark3d-xyz/mark3d/indexer/internal/domain"
	"github.com/mark3d-xyz/mark3d/indexer/models"
)

func (s *service) GetToken(ctx context.Context, address common.Address,
	tokenId *big.Int) (*models.Token, *models.ErrorResponse) {
	tx, err := s.repository.BeginTransaction(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("begin tx failed: ", err)
		return nil, internalError
	}
	defer s.repository.RollbackTransaction(ctx, tx)
	token, err := s.repository.GetToken(ctx, tx, address, tokenId)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		log.Println("get token failed: ", err)
		return nil, internalError
	}
	return domain.TokenToModel(token), nil
}

func (s *service) GetTokenEncryptedPassword(
	ctx context.Context,
	address common.Address,
	tokenId *big.Int,
) (*models.EncryptedPasswordResponse, *models.ErrorResponse) {
	tx, err := s.repository.BeginTransaction(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("begin tx failed: ", err)
		return nil, internalError
	}
	defer s.repository.RollbackTransaction(ctx, tx)

	pwd, number, err := s.repository.GetTokenEncryptedPassword(ctx, tx, address, tokenId)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		log.Println("get token password failed: ", err)
		return nil, internalError
	}

	res := models.EncryptedPasswordResponse{
		EncryptedPassword: pwd,
		DealNumber:        number,
	}

	return &res, nil
}

func (s *service) GetCollectionTokens(ctx context.Context,
	address common.Address) ([]*models.Token, *models.ErrorResponse) {
	tx, err := s.repository.BeginTransaction(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("begin tx failed: ", err)
		return nil, internalError
	}
	defer s.repository.RollbackTransaction(ctx, tx)
	tokens, err := s.repository.GetCollectionTokens(ctx, tx, address)
	if err != nil {
		log.Println("get collection tokens failed: ", err)
		return nil, internalError
	}
	return domain.MapSlice(tokens, domain.TokenToModel), nil
}

func (s *service) GetTokensByAddress(ctx context.Context,
	address common.Address) (*models.TokensResponse, *models.ErrorResponse) {
	tx, err := s.repository.BeginTransaction(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("begin tx failed: ", err)
		return nil, internalError
	}
	defer s.repository.RollbackTransaction(ctx, tx)
	collections, err := s.repository.GetCollectionsByAddress(ctx, tx, address)
	if err != nil {
		log.Println("get collections by address failed: ", err)
		return nil, internalError
	}
	tokens, err := s.repository.GetTokensByAddress(ctx, tx, address)
	if err != nil {
		log.Println("get tokens by address failed: ", err)
		return nil, internalError
	}
	tokensRes := domain.MapSlice(tokens, domain.TokenToModel)
	for i, t := range tokens {
		transfer, err := s.repository.GetActiveTransfer(ctx, tx, t.CollectionAddress, t.TokenId)
		if err != nil {
			if err == pgx.ErrNoRows {
				continue
			}
			log.Println("get token active transfer failed: ", err)
			return nil, internalError
		}
		tokensRes[i].PendingTransferID, tokensRes[i].PendingOrderID = transfer.Id, transfer.OrderId
	}
	return &models.TokensResponse{
		Collections: domain.MapSlice(collections, domain.CollectionToModel),
		Tokens:      tokensRes,
	}, nil
}
