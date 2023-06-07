package service

import (
	"context"
	"github.com/ethereum/go-ethereum/common"
	"github.com/jackc/pgx/v4"
	"github.com/mark3d-xyz/mark3d/indexer/internal/domain"
	"github.com/mark3d-xyz/mark3d/indexer/models"
	"github.com/mark3d-xyz/mark3d/indexer/pkg/currencyconversion"
	"log"
	"math/big"
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
	return &models.TransfersResponse{
		Incoming:      domain.MapSlice(incomingTransfers, domain.TransferToModel),
		IncomingTotal: incomingTotal,
		Outgoing:      domain.MapSlice(outgoingTransfers, domain.TransferToModel),
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
	return &models.TransfersResponse{
		Incoming:      domain.MapSlice(incomingTransfers, domain.TransferToModel),
		IncomingTotal: incomingTotal,
		Outgoing:      domain.MapSlice(outgoingTransfers, domain.TransferToModel),
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
	res, err := s.repository.GetActiveTransfer(ctx, tx, address, tokenId)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, internalError
	}
	return domain.TransferToModel(res), nil
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
	rate, err := s.currencyConverter.GetExchangeRate(ctx, "FIL", "USD")
	if err != nil {
		log.Println("failed to get conversion rate: ", err)
		return nil, internalError
	}

	incoming, outgoing := make([]*models.TransferWithData, len(incomingTransfers)), make([]*models.TransferWithData, len(outgoingTransfers))
	for i, t := range incomingTransfers {
		token, err := s.repository.GetToken(ctx, tx, t.CollectionAddress, t.TokenId)
		if err != nil {
			return nil, internalError
		}
		if token.CollectionAddress == s.cfg.FileBunniesCollectionAddress && token.MetaUri == "" {
			token.Metadata = domain.NewFileBunniesPlaceholder()
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
		if token.CollectionAddress == s.cfg.FileBunniesCollectionAddress && token.MetaUri == "" {
			token.Metadata = domain.NewFileBunniesPlaceholder()
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
		outgoing[i] = &models.TransferWithData{
			Collection: domain.CollectionToModel(collection),
			Order:      domain.OrderToModel(order),
			Token:      domain.TokenToModel(token),
			Transfer:   domain.TransferToModel(t),
		}
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
	rate, err := s.currencyConverter.GetExchangeRate(ctx, "FIL", "USD")
	if err != nil {
		log.Println("failed to get conversion rate: ", err)
		return nil, internalError
	}
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
		outgoing[i] = &models.TransferWithData{
			Collection: domain.CollectionToModel(collection),
			Order:      domain.OrderToModel(order),
			Token:      domain.TokenToModel(token),
			Transfer:   domain.TransferToModel(t),
		}
	}
	return &models.TransfersResponseV2{
		Incoming:      incoming,
		IncomingTotal: incomingTotal,
		Outgoing:      outgoing,
		OutgoingTotal: outgoingTotal,
	}, nil
}

func (s *service) GetTransferV2(ctx context.Context, address common.Address, tokenId *big.Int) (*models.TransferWithData, *models.ErrorResponse) {
	tx, err := s.repository.BeginTransaction(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("begin tx failed: ", err)
		return nil, internalError
	}
	defer s.repository.RollbackTransaction(ctx, tx)
	res, err := s.repository.GetActiveTransfer(ctx, tx, address, tokenId)
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
	rate, err := s.currencyConverter.GetExchangeRate(ctx, "FIL", "USD")
	if err != nil {
		log.Println("failed to get conversion rate: ", err)
		return nil, internalError
	}
	var order *domain.Order
	if res.OrderId != 0 {
		order, err = s.repository.GetOrder(ctx, tx, res.OrderId)
		if err != nil {
			return nil, internalError
		}
		order.PriceUsd = currencyconversion.Convert(rate, order.Price)
	}
	return &models.TransferWithData{
		Collection: domain.CollectionToModel(collection),
		Order:      domain.OrderToModel(order),
		Token:      domain.TokenToModel(token),
		Transfer:   domain.TransferToModel(res),
	}, nil
}
