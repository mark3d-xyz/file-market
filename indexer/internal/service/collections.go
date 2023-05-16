package service

import (
	"context"
	"github.com/ethereum/go-ethereum/common"
	"github.com/jackc/pgx/v4"
	"github.com/mark3d-xyz/mark3d/indexer/internal/domain"
	"github.com/mark3d-xyz/mark3d/indexer/models"
	"log"
)

func (s *service) GetCollection(ctx context.Context,
	address common.Address) (*models.Collection, *models.ErrorResponse) {
	tx, err := s.repository.BeginTransaction(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("begin tx failed: ", err)
		return nil, internalError
	}
	defer s.repository.RollbackTransaction(ctx, tx)
	collection, err := s.repository.GetCollection(ctx, tx, address)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		log.Println("get collection failed: ", err)
		return nil, internalError
	}
	return domain.CollectionToModel(collection), nil
}

func (s *service) GetCollectionWithTokens(ctx context.Context,
	address common.Address) (*models.CollectionData, *models.ErrorResponse) {
	tx, err := s.repository.BeginTransaction(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("begin tx failed: ", err)
		return nil, internalError
	}
	defer s.repository.RollbackTransaction(ctx, tx)
	collection, err := s.repository.GetCollection(ctx, tx, address)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		log.Println("get collection failed: ", err)
		return nil, internalError
	}
	tokens, err := s.repository.GetCollectionTokens(ctx, tx, address)
	if err != nil {
		log.Println("get collection token failed: ", err)
		return nil, internalError
	}
	return &models.CollectionData{
		Collection: domain.CollectionToModel(collection),
		Tokens:     domain.MapSlice(tokens, domain.TokenToModel),
	}, nil
}

func (s *service) GetCollectionsByCreator(
	ctx context.Context,
	address common.Address,
	lastCollectionAddress *common.Address,
	limit int,
) ([]*models.Collection, *models.ErrorResponse) {
	tx, err := s.repository.BeginTransaction(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("begin tx failed: ", err)
		return nil, internalError
	}
	defer s.repository.RollbackTransaction(ctx, tx)

	collections, err := s.repository.GetCollectionsByCreator(ctx, tx, address, lastCollectionAddress, limit)
	if err != nil {
		log.Println("get collections by creator failed: ", err)
		return nil, internalError
	}

	res := make([]*models.Collection, len(collections))
	for i, c := range collections {
		res[i] = domain.CollectionToModel(c)
	}

	return res, nil
}
