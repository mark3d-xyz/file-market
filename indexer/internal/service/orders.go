package service

import (
	"context"
	"github.com/mark3d-xyz/mark3d/indexer/pkg/currencyconversion"
	"github.com/mark3d-xyz/mark3d/indexer/pkg/utils"
	"log"
	"math/big"
	"strings"

	"github.com/ethereum/go-ethereum/common"
	"github.com/jackc/pgx/v4"
	"github.com/mark3d-xyz/mark3d/indexer/internal/domain"
	"github.com/mark3d-xyz/mark3d/indexer/models"
)

func (s *service) GetOrders(
	ctx context.Context,
	address common.Address,
) (*models.OrdersResponse, *models.ErrorResponse) {
	tx, err := s.repository.BeginTransaction(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("begin tx failed: ", err)
		return nil, internalError
	}
	defer s.repository.RollbackTransaction(ctx, tx)

	currency := "FIL"
	if strings.Contains(s.cfg.Mode, "era") {
		currency = "ETH"
	}

	rate, err := s.currencyConverter.GetExchangeRate(ctx, currency, "USD")
	if err != nil {
		log.Println("failed to get conversion rate: ", err)
		rate = 0
	}

	incomingOrders, err := s.repository.GetActiveIncomingOrdersByAddress(ctx, tx, address)
	if err != nil {
		log.Println("get active incoming orders failed: ", err)
		return nil, internalError
	}
	for _, o := range incomingOrders {
		o.PriceUsd = currencyconversion.Convert(rate, o.Price)
	}

	outgoingOrders, err := s.repository.GetActiveOutgoingOrdersByAddress(ctx, tx, address)
	if err != nil {
		log.Println("get active outgoing orders failed: ", err)
		return nil, internalError
	}

	for _, o := range outgoingOrders {
		o.PriceUsd = currencyconversion.Convert(rate, o.Price)
	}

	return &models.OrdersResponse{
		Incoming: domain.MapSlice(incomingOrders, domain.OrderToModel),
		Outgoing: domain.MapSlice(outgoingOrders, domain.OrderToModel),
	}, nil
}

func (s *service) GetOrdersHistory(
	ctx context.Context,
	address common.Address,
) (*models.OrdersResponse, *models.ErrorResponse) {
	tx, err := s.repository.BeginTransaction(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("begin tx failed: ", err)
		return nil, internalError
	}
	defer s.repository.RollbackTransaction(ctx, tx)

	currency := "FIL"
	if strings.Contains(s.cfg.Mode, "era") {
		currency = "ETH"
	}
	rate, err := s.currencyConverter.GetExchangeRate(ctx, currency, "USD")
	if err != nil {
		log.Println("failed to get conversion rate: ", err)
		rate = 0
	}

	incomingOrders, err := s.repository.GetIncomingOrdersByAddress(ctx, tx, address)
	if err != nil {
		log.Println("get incoming orders failed: ", err)
		return nil, internalError
	}
	for _, o := range incomingOrders {
		o.PriceUsd = currencyconversion.Convert(rate, o.Price)
	}

	outgoingOrders, err := s.repository.GetOutgoingOrdersByAddress(ctx, tx, address)
	if err != nil {
		log.Println("get outgoing orders failed: ", err)
		return nil, internalError
	}
	for _, o := range outgoingOrders {
		o.PriceUsd = currencyconversion.Convert(rate, o.Price)
	}

	return &models.OrdersResponse{
		Incoming: domain.MapSlice(incomingOrders, domain.OrderToModel),
		Outgoing: domain.MapSlice(outgoingOrders, domain.OrderToModel),
	}, nil
}

func (s *service) GetOrder(
	ctx context.Context,
	address common.Address,
	tokenId *big.Int,
) (*models.Order, *models.ErrorResponse) {
	tx, err := s.repository.BeginTransaction(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("begin tx failed: ", err)
		return nil, internalError
	}
	defer s.repository.RollbackTransaction(ctx, tx)

	currency := "FIL"
	if strings.Contains(s.cfg.Mode, "era") {
		currency = "ETH"
	}
	rate, err := s.currencyConverter.GetExchangeRate(ctx, currency, "USD")
	if err != nil {
		log.Println("failed to get conversion rate: ", err)
		rate = 0
	}

	res, err := s.repository.GetActiveOrder(ctx, tx, address, tokenId)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		logger.Error("failed to get active order", err, nil)
		return nil, internalError
	}
	res.PriceUsd = currencyconversion.Convert(rate, res.Price)

	return domain.OrderToModel(res), nil
}

func (s *service) GetAllActiveOrders(
	ctx context.Context,
	lastOrderId *int64,
	limit int,
) (*models.OrdersAllActiveResponse, *models.ErrorResponse) {
	tx, err := s.repository.BeginTransaction(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("begin tx failed: ", err)
		return nil, internalError
	}
	defer s.repository.RollbackTransaction(ctx, tx)

	currency := "FIL"
	if strings.Contains(s.cfg.Mode, "era") {
		currency = "ETH"
	}
	rate, err := s.currencyConverter.GetExchangeRate(ctx, currency, "USD")
	if err != nil {
		log.Println("failed to get conversion rate: ", err)
		rate = 0
	}

	orders, err := s.repository.GetAllActiveOrders(ctx, tx, lastOrderId, limit)
	if err != nil {
		log.Println("get all active orders failed", err)
		return nil, internalError
	}
	total, err := s.repository.GetAllActiveOrdersTotal(ctx, tx)
	if err != nil {
		log.Println("get all active orders total failed", err)
		return nil, internalError
	}

	for _, o := range orders {
		o.PriceUsd = currencyconversion.Convert(rate, o.Price)
	}

	addresses := make(map[string]struct{})
	ordersWithToken := make([]*models.OrderWithToken, 0, len(orders))
	for _, o := range orders {
		transfer, err := s.repository.GetTransfer(ctx, tx, o.TransferId)
		if err != nil {
			log.Println("get transfer for order failed", err)
			return nil, internalError
		}
		token, err := s.repository.GetToken(ctx, tx, transfer.CollectionAddress, transfer.TokenId)
		if err != nil {
			log.Println("get token for order failed", err)
			return nil, internalError
		}

		addresses[transfer.ToAddress.String()] = struct{}{}
		addresses[transfer.FromAddress.String()] = struct{}{}
		addresses[token.Creator.String()] = struct{}{}
		addresses[token.Owner.String()] = struct{}{}

		ordersWithToken = append(ordersWithToken, &models.OrderWithToken{
			Order:    domain.OrderToModel(o),
			Token:    domain.TokenToModel(token),
			Transfer: domain.TransferToModel(transfer),
		})
	}

	profilesMap, e := s.getProfilesMap(ctx, utils.SetToSlice(addresses))
	if e != nil {
		return nil, e
	}

	for _, o := range ordersWithToken {
		fillTransferUserProfiles(o.Transfer, profilesMap)
		fillTokenUserProfiles(o.Token, profilesMap)
	}

	return &models.OrdersAllActiveResponse{
		Items: ordersWithToken,
		Total: total,
	}, nil
}
