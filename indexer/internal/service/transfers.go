package service

import (
	"context"
	"errors"
	"github.com/ethereum/go-ethereum/common"
	"github.com/jackc/pgx/v4"
	"github.com/mark3d-xyz/mark3d/indexer/internal/domain"
	"github.com/mark3d-xyz/mark3d/indexer/models"
	"github.com/mark3d-xyz/mark3d/indexer/pkg/currencyconversion"
	"github.com/mark3d-xyz/mark3d/indexer/pkg/utils"
	"log"
	"math/big"
	"strings"
)

func (s *service) GetTransfers(
	ctx context.Context,
	address common.Address,
	lastIncomingTransferId *int64,
	incomingLimit int,
	lastOutgoingTransferId *int64,
	outgoingLimit int,
) (*models.TransfersResponse, *models.ErrorResponse) {
	tx, err := s.repository.BeginTransaction(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("begin tx failed: ", err)
		return nil, internalError
	}
	defer s.repository.RollbackTransaction(ctx, tx)

	incomingTransfers, err := s.repository.GetActiveIncomingTransfersByAddress(ctx, tx, address, lastIncomingTransferId, incomingLimit)
	if err != nil {
		log.Println("get active incoming transfers failed: ", err)
		return nil, internalError
	}
	incomingTotal, err := s.repository.GetActiveIncomingTransfersByAddressTotal(ctx, tx, address)
	if err != nil {
		log.Println("get active incoming transfers total failed: ", err)
		return nil, internalError
	}
	outgoingTransfers, err := s.repository.GetActiveOutgoingTransfersByAddress(ctx, tx, address, lastOutgoingTransferId, outgoingLimit)
	if err != nil {
		log.Println("get active outgoing transfers failed: ", err)
		return nil, internalError
	}
	outgoingTotal, err := s.repository.GetActiveOutgoingTransfersByAddressTotal(ctx, tx, address)
	if err != nil {
		log.Println("get active outgoing transfers total failed: ", err)
		return nil, internalError
	}

	addresses := make(map[string]struct{})
	for _, t := range incomingTransfers {
		addresses[strings.ToLower(t.FromAddress.String())] = struct{}{}
		addresses[strings.ToLower(t.ToAddress.String())] = struct{}{}
	}
	for _, t := range outgoingTransfers {
		addresses[strings.ToLower(t.FromAddress.String())] = struct{}{}
		addresses[strings.ToLower(t.ToAddress.String())] = struct{}{}
	}
	profilesMap, e := s.getProfilesMap(ctx, utils.SetToSlice(addresses))
	if e != nil {
		return nil, e
	}

	incomingRes := domain.MapSlice(incomingTransfers, domain.TransferToModel)
	outgoingRes := domain.MapSlice(outgoingTransfers, domain.TransferToModel)
	for _, t := range incomingRes {
		fillTransferUserProfiles(t, profilesMap)
	}
	for _, t := range outgoingRes {
		fillTransferUserProfiles(t, profilesMap)
	}

	return &models.TransfersResponse{
		Incoming:      incomingRes,
		IncomingTotal: incomingTotal,
		Outgoing:      outgoingRes,
		OutgoingTotal: outgoingTotal,
	}, nil
}

func (s *service) GetTransfersHistory(
	ctx context.Context,
	address common.Address,
	lastIncomingTransferId *int64,
	incomingLimit int,
	lastOutgoingTransferId *int64,
	outgoingLimit int,
) (*models.TransfersResponse, *models.ErrorResponse) {
	tx, err := s.repository.BeginTransaction(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("begin tx failed: ", err)
		return nil, internalError
	}
	defer s.repository.RollbackTransaction(ctx, tx)

	incomingTransfers, err := s.repository.GetIncomingTransfersByAddress(ctx, tx, address, lastIncomingTransferId, incomingLimit)
	if err != nil {
		log.Println("get incoming transfers failed: ", err)
		return nil, internalError
	}
	incomingTotal, err := s.repository.GetIncomingTransfersByAddressTotal(ctx, tx, address)
	if err != nil {
		log.Println("get incoming transfers failed: ", err)
		return nil, internalError
	}
	outgoingTransfers, err := s.repository.GetOutgoingTransfersByAddress(ctx, tx, address, lastOutgoingTransferId, outgoingLimit)
	if err != nil {
		log.Println("get outgoing transfers failed: ", err)
		return nil, internalError
	}
	outgoingTotal, err := s.repository.GetOutgoingTransfersByAddressTotal(ctx, tx, address)
	if err != nil {
		log.Println("get outgoing transfers failed: ", err)
		return nil, internalError
	}

	addresses := make(map[string]struct{})
	for _, t := range incomingTransfers {
		addresses[strings.ToLower(t.FromAddress.String())] = struct{}{}
		addresses[strings.ToLower(t.ToAddress.String())] = struct{}{}
	}
	for _, t := range outgoingTransfers {
		addresses[strings.ToLower(t.FromAddress.String())] = struct{}{}
		addresses[strings.ToLower(t.ToAddress.String())] = struct{}{}
	}
	profilesMap, e := s.getProfilesMap(ctx, utils.SetToSlice(addresses))
	if e != nil {
		return nil, e
	}

	incomingRes := domain.MapSlice(incomingTransfers, domain.TransferToModel)
	outgoingRes := domain.MapSlice(outgoingTransfers, domain.TransferToModel)
	for _, t := range incomingRes {
		fillTransferUserProfiles(t, profilesMap)
	}
	for _, t := range outgoingRes {
		fillTransferUserProfiles(t, profilesMap)
	}

	return &models.TransfersResponse{
		Incoming:      incomingRes,
		IncomingTotal: incomingTotal,
		Outgoing:      outgoingRes,
		OutgoingTotal: outgoingTotal,
	}, nil
}

func (s *service) GetTransfer(ctx context.Context, address common.Address,
	tokenId *big.Int) (*models.Transfer, *models.ErrorResponse) {
	tx, err := s.repository.BeginTransaction(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("begin tx failed: ", err)
		return nil, internalError
	}
	defer s.repository.RollbackTransaction(ctx, tx)
	transfer, err := s.repository.GetActiveTransfer(ctx, tx, address, tokenId)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}

		logger.Error("failed to get active transfer", err, nil)
		return nil, internalError
	}

	profilesMap, e := s.getProfilesMap(ctx, []string{transfer.ToAddress.String(), transfer.FromAddress.String()})
	if e != nil {
		return nil, e
	}

	res := domain.TransferToModel(transfer)
	fillTransferUserProfiles(res, profilesMap)

	return res, nil
}

func (s *service) GetTransfersV2(
	ctx context.Context,
	address common.Address,
	lastIncomingTransferId *int64,
	incomingLimit int,
	lastOutgoingTransferId *int64,
	outgoingLimit int,
) (*models.TransfersResponseV2, *models.ErrorResponse) {
	tx, err := s.repository.BeginTransaction(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("begin tx failed: ", err)
		return nil, internalError
	}
	defer s.repository.RollbackTransaction(ctx, tx)
	incomingTransfers, err := s.repository.GetActiveIncomingTransfersByAddress(ctx, tx, address, lastIncomingTransferId, incomingLimit)
	if err != nil {
		log.Println("get active incoming transfers failed: ", err)
		return nil, internalError
	}
	incomingTotal, err := s.repository.GetActiveIncomingTransfersByAddressTotal(ctx, tx, address)
	if err != nil {
		log.Println("get active incoming transfers total failed: ", err)
		return nil, internalError
	}
	outgoingTransfers, err := s.repository.GetActiveOutgoingTransfersByAddress(ctx, tx, address, lastOutgoingTransferId, outgoingLimit)
	if err != nil {
		log.Println("get active outgoing transfers failed: ", err)
		return nil, internalError
	}
	outgoingTotal, err := s.repository.GetActiveOutgoingTransfersByAddressTotal(ctx, tx, address)
	if err != nil {
		log.Println("get active outgoing transfers total failed: ", err)
		return nil, internalError
	}

	currency := "FIL"
	if strings.Contains(s.cfg.Mode, "era") {
		currency = "ETH"
	}
	rate, err := s.currencyConverter.GetExchangeRate(ctx, currency, "USD")
	if err != nil {
		log.Println("failed to get conversion rate: ", err)
		rate = 0
	}

	addresses := make(map[string]struct{})
	incoming, outgoing := make([]*models.TransferWithData, len(incomingTransfers)), make([]*models.TransferWithData, len(outgoingTransfers))
	for i, t := range incomingTransfers {
		token, err := s.repository.GetToken(ctx, tx, t.CollectionAddress, t.TokenId)
		if err != nil {
			logger.Error("failed to get token", err, nil)
			return nil, internalError
		}
		if token.CollectionAddress == s.cfg.FileBunniesCollectionAddress && token.MetaUri == "" {
			token.Metadata = domain.NewFileBunniesPlaceholder()
		}

		collection, err := s.repository.GetCollection(ctx, tx, t.CollectionAddress)
		if err != nil {
			logger.Error("failed to get collection", err, nil)
			return nil, internalError
		}

		var order *domain.Order
		if t.OrderId != 0 {
			order, err = s.repository.GetOrder(ctx, tx, t.OrderId)
			if err != nil {
				logger.Error("failed to get order", err, nil)
				return nil, internalError
			}
			order.PriceUsd = currencyconversion.Convert(rate, order.Price)
		}

		addresses[token.Owner.String()] = struct{}{}
		addresses[token.Creator.String()] = struct{}{}
		addresses[collection.Owner.String()] = struct{}{}
		addresses[collection.Creator.String()] = struct{}{}
		addresses[t.FromAddress.String()] = struct{}{}
		addresses[t.ToAddress.String()] = struct{}{}

		incoming[i] = &models.TransferWithData{
			Collection: domain.CollectionToModel(collection),
			Order:      domain.OrderToModel(order),
			Token:      domain.TokenToModel(token),
			Transfer:   domain.TransferToModel(t),
		}
	}
	for i, t := range outgoingTransfers {
		token, err := s.repository.GetToken(ctx, tx, t.CollectionAddress, t.TokenId)
		if err != nil {
			logger.Error("failed to get token", err, nil)
			return nil, internalError
		}
		if token.CollectionAddress == s.cfg.FileBunniesCollectionAddress && token.MetaUri == "" {
			token.Metadata = domain.NewFileBunniesPlaceholder()
		}

		collection, err := s.repository.GetCollection(ctx, tx, t.CollectionAddress)
		if err != nil {
			logger.Error("failed to get collection", err, nil)
			return nil, internalError
		}
		var order *domain.Order
		if t.OrderId != 0 {
			order, err = s.repository.GetOrder(ctx, tx, t.OrderId)
			if err != nil {
				logger.Error("failed to get order", err, nil)
				return nil, internalError
			}
			order.PriceUsd = currencyconversion.Convert(rate, order.Price)
		}

		addresses[token.Owner.String()] = struct{}{}
		addresses[token.Creator.String()] = struct{}{}
		addresses[collection.Owner.String()] = struct{}{}
		addresses[collection.Creator.String()] = struct{}{}
		addresses[t.FromAddress.String()] = struct{}{}
		addresses[t.ToAddress.String()] = struct{}{}

		outgoing[i] = &models.TransferWithData{
			Collection: domain.CollectionToModel(collection),
			Order:      domain.OrderToModel(order),
			Token:      domain.TokenToModel(token),
			Transfer:   domain.TransferToModel(t),
		}
	}

	profilesMap, e := s.getProfilesMap(ctx, utils.SetToSlice(addresses))
	if e != nil {
		return nil, e
	}
	for _, d := range incoming {
		fillTransferUserProfiles(d.Transfer, profilesMap)
		fillCollectionUserProfiles(d.Collection, profilesMap)
		fillTokenUserProfiles(d.Token, profilesMap)
	}

	return &models.TransfersResponseV2{
		Incoming:      incoming,
		IncomingTotal: incomingTotal,
		Outgoing:      outgoing,
		OutgoingTotal: outgoingTotal,
	}, nil
}

func (s *service) GetTransfersHistoryV2(
	ctx context.Context,
	address common.Address,
	lastIncomingTransferId *int64,
	incomingLimit int,
	lastOutgoingTransferId *int64,
	outgoingLimit int,
) (*models.TransfersResponseV2, *models.ErrorResponse) {
	tx, err := s.repository.BeginTransaction(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("begin tx failed: ", err)
		return nil, internalError
	}
	defer s.repository.RollbackTransaction(ctx, tx)
	incomingTransfers, err := s.repository.GetIncomingTransfersByAddress(ctx, tx, address, lastIncomingTransferId, incomingLimit)
	if err != nil {
		log.Println("get incoming transfers failed: ", err)
		return nil, internalError
	}
	incomingTotal, err := s.repository.GetIncomingTransfersByAddressTotal(ctx, tx, address)
	if err != nil {
		log.Println("get incoming transfers failed: ", err)
		return nil, internalError
	}
	outgoingTransfers, err := s.repository.GetOutgoingTransfersByAddress(ctx, tx, address, lastOutgoingTransferId, outgoingLimit)
	if err != nil {
		log.Println("get outgoing transfers failed: ", err)
		return nil, internalError
	}
	outgoingTotal, err := s.repository.GetOutgoingTransfersByAddressTotal(ctx, tx, address)
	if err != nil {
		log.Println("get outgoing transfers failed: ", err)
		return nil, internalError
	}

	currency := "FIL"
	if strings.Contains(s.cfg.Mode, "era") {
		currency = "ETH"
	}
	rate, err := s.currencyConverter.GetExchangeRate(ctx, currency, "USD")
	if err != nil {
		log.Println("failed to get conversion rate: ", err)
		rate = 0
	}

	addresses := make(map[string]struct{})
	incoming, outgoing := make([]*models.TransferWithData, len(incomingTransfers)), make([]*models.TransferWithData, len(outgoingTransfers))
	for i, t := range incomingTransfers {
		token, err := s.repository.GetToken(ctx, tx, t.CollectionAddress, t.TokenId)
		if err != nil {
			return nil, internalError
		}
		collection, err := s.repository.GetCollection(ctx, tx, t.CollectionAddress)
		if err != nil {
			return nil, internalError
		}
		var order *domain.Order
		if t.OrderId != 0 {
			order, err = s.repository.GetOrder(ctx, tx, t.OrderId)
			if err != nil {
				return nil, internalError
			}

			order.PriceUsd = currencyconversion.Convert(rate, order.Price)
		}

		addresses[token.Owner.String()] = struct{}{}
		addresses[token.Creator.String()] = struct{}{}
		addresses[collection.Owner.String()] = struct{}{}
		addresses[collection.Creator.String()] = struct{}{}
		addresses[t.FromAddress.String()] = struct{}{}
		addresses[t.ToAddress.String()] = struct{}{}

		incoming[i] = &models.TransferWithData{
			Collection: domain.CollectionToModel(collection),
			Order:      domain.OrderToModel(order),
			Token:      domain.TokenToModel(token),
			Transfer:   domain.TransferToModel(t),
		}
	}
	for i, t := range outgoingTransfers {
		token, err := s.repository.GetToken(ctx, tx, t.CollectionAddress, t.TokenId)
		if err != nil {
			return nil, internalError
		}
		collection, err := s.repository.GetCollection(ctx, tx, t.CollectionAddress)
		if err != nil {
			return nil, internalError
		}
		var order *domain.Order
		if t.OrderId != 0 {
			order, err = s.repository.GetOrder(ctx, tx, t.OrderId)
			if err != nil {
				return nil, internalError
			}

			order.PriceUsd = currencyconversion.Convert(rate, order.Price)
		}

		addresses[token.Owner.String()] = struct{}{}
		addresses[token.Creator.String()] = struct{}{}
		addresses[collection.Owner.String()] = struct{}{}
		addresses[collection.Creator.String()] = struct{}{}
		addresses[t.FromAddress.String()] = struct{}{}
		addresses[t.ToAddress.String()] = struct{}{}

		outgoing[i] = &models.TransferWithData{
			Collection: domain.CollectionToModel(collection),
			Order:      domain.OrderToModel(order),
			Token:      domain.TokenToModel(token),
			Transfer:   domain.TransferToModel(t),
		}
	}

	profilesMap, e := s.getProfilesMap(ctx, utils.SetToSlice(addresses))
	if e != nil {
		return nil, e
	}
	for _, d := range incoming {
		fillTransferUserProfiles(d.Transfer, profilesMap)
		fillCollectionUserProfiles(d.Collection, profilesMap)
		fillTokenUserProfiles(d.Token, profilesMap)
	}
	for _, d := range outgoing {
		fillTransferUserProfiles(d.Transfer, profilesMap)
		fillCollectionUserProfiles(d.Collection, profilesMap)
		fillTokenUserProfiles(d.Token, profilesMap)
	}

	return &models.TransfersResponseV2{
		Incoming:      incoming,
		IncomingTotal: incomingTotal,
		Outgoing:      outgoing,
		OutgoingTotal: outgoingTotal,
	}, nil
}

func (s *service) GetTransferV2(
	ctx context.Context,
	address common.Address,
	tokenId *big.Int,
) (*models.TransferWithData, *models.ErrorResponse) {
	tx, err := s.repository.BeginTransaction(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("begin tx failed: ", err)
		return nil, internalError
	}
	defer s.repository.RollbackTransaction(ctx, tx)
	transfer, err := s.repository.GetActiveTransfer(ctx, tx, address, tokenId)
	if err != nil {
		return nil, internalError
	}
	token, err := s.repository.GetToken(ctx, tx, address, tokenId)
	if err != nil {
		return nil, internalError
	}
	collection, err := s.repository.GetCollection(ctx, tx, address)
	if err != nil {
		return nil, internalError
	}

	currency := "FIL"
	if strings.Contains(s.cfg.Mode, "era") {
		currency = "ETH"
	}
	rate, err := s.currencyConverter.GetExchangeRate(ctx, currency, "USD")
	if err != nil {
		log.Println("failed to get conversion rate: ", err)
		rate = 0
	}
	var order *domain.Order
	if transfer.OrderId != 0 {
		order, err = s.repository.GetOrder(ctx, tx, transfer.OrderId)
		if err != nil {
			return nil, internalError
		}
		order.PriceUsd = currencyconversion.Convert(rate, order.Price)
	}

	addresses := make(map[string]struct{})
	addresses[token.Owner.String()] = struct{}{}
	addresses[token.Creator.String()] = struct{}{}
	addresses[collection.Owner.String()] = struct{}{}
	addresses[collection.Creator.String()] = struct{}{}
	addresses[transfer.FromAddress.String()] = struct{}{}
	addresses[transfer.ToAddress.String()] = struct{}{}

	profilesMap, e := s.getProfilesMap(ctx, utils.SetToSlice(addresses))
	if e != nil {
		return nil, e
	}

	collectionRes := domain.CollectionToModel(collection)
	tokenRes := domain.TokenToModel(token)
	transferRes := domain.TransferToModel(transfer)

	fillTransferUserProfiles(transferRes, profilesMap)
	fillCollectionUserProfiles(collectionRes, profilesMap)
	fillTokenUserProfiles(tokenRes, profilesMap)

	return &models.TransferWithData{
		Collection: collectionRes,
		Order:      domain.OrderToModel(order),
		Token:      tokenRes,
		Transfer:   transferRes,
	}, nil
}
