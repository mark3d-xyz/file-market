package service

import (
	"context"
	"errors"
	"log"
	"math/big"
	"strings"

	"github.com/ethereum/go-ethereum/common"
	"github.com/jackc/pgx/v4"
	"github.com/mark3d-xyz/mark3d/indexer/internal/domain"
	"github.com/mark3d-xyz/mark3d/indexer/models"
	"github.com/mark3d-xyz/mark3d/indexer/pkg/currencyconversion"
	"github.com/mark3d-xyz/mark3d/indexer/pkg/utils"
	authserver_pb "github.com/mark3d-xyz/mark3d/indexer/proto"
)

func (s *service) GetCollection(
	ctx context.Context,
	address common.Address,
) (*models.CollectionResponse, *models.ErrorResponse) {
	tx, err := s.repository.BeginTransaction(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("begin tx failed: ", err)
		return nil, internalError
	}
	defer s.repository.RollbackTransaction(ctx, tx)

	collection, err := s.repository.GetCollection(ctx, tx, address)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		log.Println("get collection failed: ", err)
		return nil, internalError
	}

	c := domain.CollectionToModel(collection)
	fileTypes, categories, subcategories, err := s.repository.GetTokensContentTypeByCollection(ctx, tx, address)
	if err != nil {
		logger.Errorf("failed to get collection content types", err, nil)
		return nil, internalError
	}

	c.ContentTypes = &models.CollectionContentTypes{
		Categories:     categories,
		FileExtensions: fileTypes,
		Subcategories:  subcategories,
	}

	if collection.Address == s.cfg.FileBunniesCollectionAddress {
		stats, err := s.repository.GetFileBunniesStats(ctx, tx)
		if err != nil {
			logger.Errorf("failed to get stats", err, nil)
			return nil, internalError
		}
		for _, s := range stats {
			c.Stats = append(c.Stats, &models.CollectionStat{Name: s.Name, Value: s.Value})
		}
	}

	profilesMap, e := s.getProfilesMap(ctx, []string{
		strings.ToLower(collection.Owner.String()),
		strings.ToLower(collection.Creator.String()),
	})
	if e != nil {
		logger.Error("failed to call GetUserProfile", errors.New(e.Message), nil)
		return nil, e
	}
	fillCollectionUserProfiles(c, profilesMap)

	res := models.CollectionResponse{
		Collection: c,
	}

	collectionProfile, err := s.repository.GetCollectionProfile(ctx, tx, address)
	if err != nil {
		if !errors.Is(err, pgx.ErrNoRows) {
			logger.Error("failed to get collection profile", err, nil)
		}
	} else {
		res.Slug = collectionProfile.Slug
		res.WebsiteURL = collectionProfile.WebsiteURL
		res.Twitter = collectionProfile.Twitter
		res.Discord = collectionProfile.Discord
		res.BannerURL = collectionProfile.BannerUrl
	}

	return &res, nil
}

func (s *service) GetCollections(
	ctx context.Context,
	lastCollectionAddress *common.Address,
	limit int,
) (*models.CollectionsResponse, *models.ErrorResponse) {
	tx, err := s.repository.BeginTransaction(ctx, pgx.TxOptions{})
	if err != nil {
		logger.Errorf("begin tx failed", err)
		return nil, internalError
	}
	defer s.repository.RollbackTransaction(ctx, tx)

	collections, err := s.repository.GetCollections(ctx, tx, lastCollectionAddress, limit)
	if err != nil {
		logger.Errorf("get collections failed", err)
		return nil, internalError
	}
	total, err := s.repository.GetCollectionsTotal(ctx, tx)
	if err != nil {
		logger.Errorf("get collections total failed", err)
		return nil, internalError
	}

	addresses := make(map[string]struct{})
	for _, c := range collections {
		addresses[strings.ToLower(c.Owner.String())] = struct{}{}
		addresses[strings.ToLower(c.Creator.String())] = struct{}{}
	}
	profilesMap, e := s.getProfilesMap(ctx, utils.SetToSlice(addresses))
	if e != nil {
		return nil, e
	}

	modelsCollections := make([]*models.Collection, len(collections))
	for i, collection := range collections {
		c := domain.CollectionToModel(collection)
		fileTypes, categories, subcategories, err := s.repository.GetTokensContentTypeByCollection(ctx, tx, collection.Address)
		if err != nil {
			logger.Error("failed to get collection content types", err, nil)
			return nil, internalError
		}
		c.ContentTypes = &models.CollectionContentTypes{
			Categories:     categories,
			FileExtensions: fileTypes,
			Subcategories:  subcategories,
		}
		fillCollectionUserProfiles(c, profilesMap)

		if collection.Address == s.cfg.FileBunniesCollectionAddress {
			stats, err := s.repository.GetFileBunniesStats(ctx, tx)
			if err != nil {
				logger.Errorf("failed to get stats", err, nil)
				return nil, internalError
			}
			for _, s := range stats {
				c.Stats = append(c.Stats, &models.CollectionStat{Name: s.Name, Value: s.Value})
			}
		}
		modelsCollections[i] = c
	}

	return &models.CollectionsResponse{
		Collections: modelsCollections,
		Total:       total,
	}, nil
}

func (s *service) getProfilesMap(ctx context.Context, addresses []string) (map[string]*authserver_pb.UserProfileShort, *models.ErrorResponse) {
	ownersProfile, err := s.authClient.GetUserProfileBulk(ctx, &authserver_pb.GetUserProfileBulkRequest{
		Addresses: addresses,
	})
	if err != nil {
		logger.Errorf("failed to call GetUserProfileBulk", err, nil)
		return nil, grpcErrToHTTP(err)
	}

	profilesMap := make(map[string]*authserver_pb.UserProfileShort)
	for _, p := range ownersProfile.Profiles {
		profilesMap[strings.ToLower(p.Address)] = p
	}
	return profilesMap, nil
}

func (s *service) GetCollectionWithTokens(
	ctx context.Context,
	address common.Address,
	lastTokenId *big.Int,
	limit int,
) (*models.CollectionData, *models.ErrorResponse) {
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
	tokens, err := s.repository.GetCollectionTokens(ctx, tx, address, lastTokenId, limit)
	if err != nil {
		log.Println("get collection tokens failed: ", err)
		return nil, internalError
	}
	total, err := s.repository.GetCollectionTokensTotal(ctx, tx, address)
	if err != nil {
		log.Println("get collection tokens total failed: ", err)
		return nil, internalError
	}

	var (
		addresses = make(map[string]struct{})
		tokenIds  = make([]string, 0, len(tokens))
	)
	for _, t := range tokens {
		addresses[strings.ToLower(t.Owner.String())] = struct{}{}
		addresses[strings.ToLower(t.Creator.String())] = struct{}{}
		tokenIds = append(tokenIds, t.TokenId.String())
	}
	addresses[strings.ToLower(collection.Owner.String())] = struct{}{}
	addresses[strings.ToLower(collection.Creator.String())] = struct{}{}

	profilesMap, e := s.getProfilesMap(ctx, utils.SetToSlice(addresses))
	if e != nil {
		return nil, e
	}
	orders, err := s.repository.GetActiveOrdersByTokenIds(ctx, tx, address, tokenIds)
	if err != nil {
		logger.Errorf("failed to get orders", err, nil)
		return nil, internalError
	}

	c := domain.CollectionToModel(collection)
	fileTypes, categories, subcategories, err := s.repository.GetTokensContentTypeByCollection(ctx, tx, address)
	if err != nil {
		logger.Errorf("failed to get collection content types", err, nil)
		return nil, internalError
	}
	c.ContentTypes = &models.CollectionContentTypes{
		Categories:     categories,
		FileExtensions: fileTypes,
		Subcategories:  subcategories,
	}
	fillCollectionUserProfiles(c, profilesMap)

	if collection.Address == s.cfg.FileBunniesCollectionAddress {
		stats, err := s.repository.GetFileBunniesStats(ctx, tx)
		if err != nil {
			logger.Errorf("failed to get stats", err, nil)
			return nil, internalError
		}
		for _, s := range stats {
			c.Stats = append(c.Stats, &models.CollectionStat{Name: s.Name, Value: s.Value})
		}
	}

	currency := s.cfg.Currency
	rate, err := s.currencyConverter.GetExchangeRate(ctx, currency, "USD")
	if err != nil {
		log.Println("failed to get conversion rate: ", err)
		rate = 0
	}

	tokensWithOrders := make([]*models.TokenWithOrder, len(tokens))
	for i, t := range tokens {
		order, ok := orders[t.TokenId.String()]
		if ok {
			order.PriceUsd = currencyconversion.Convert(rate, order.Price)
		}
		orderModel := domain.OrderToModel(order)
		tokenModel := domain.TokenToModel(t)
		fillTokenUserProfiles(tokenModel, profilesMap)
		tokensWithOrders[i] = &models.TokenWithOrder{
			Token: tokenModel,
			Order: orderModel,
		}
	}

	return &models.CollectionData{
		Collection: c,
		Tokens:     tokensWithOrders,
		Total:      total,
	}, nil
}

func (s *service) GetPublicCollectionWithTokens(
	ctx context.Context,
	lastTokenId *big.Int,
	limit int,
) (*models.CollectionData, *models.ErrorResponse) {
	return s.GetCollectionWithTokens(ctx, s.cfg.PublicCollectionAddress, lastTokenId, limit)
}

func (s *service) GetFileBunniesCollectionWithTokens(
	ctx context.Context,
	lastTokenId *big.Int,
	limit int,
) (*models.CollectionData, *models.ErrorResponse) {
	return s.GetCollectionWithTokens(ctx, s.cfg.FileBunniesCollectionAddress, lastTokenId, limit)
}
