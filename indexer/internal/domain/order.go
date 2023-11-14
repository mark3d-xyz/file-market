package domain

import (
	"github.com/ethereum/go-ethereum/common"
	"github.com/mark3d-xyz/mark3d/indexer/models"
	"math/big"
)

type Order struct {
	Id              int64
	TransferId      int64
	Price           *big.Int
	Currency        common.Address
	PriceUsd        *big.Float
	ExchangeAddress common.Address
	Statuses        []*OrderStatus
	BlockNumber     int64
}

type OrderStatus struct {
	Timestamp int64
	Status    string
	TxId      common.Hash
}

func OrderToModel(o *Order) *models.Order {
	if o == nil {
		return nil
	}
	if o.PriceUsd == nil {
		o.PriceUsd = big.NewFloat(0)
	}

	return &models.Order{
		ID:              o.Id,
		Statuses:        MapSlice(o.Statuses, OrderStatusToModel),
		TransferID:      o.TransferId,
		Price:           o.Price.String(),
		Currency:        o.Currency.String(),
		PriceUsd:        o.PriceUsd.Text('f', 6),
		ExchangeAddress: o.ExchangeAddress.String(),
		Block: &models.OrderBlock{
			ConfirmationsCount: 1,
			Number:             o.BlockNumber,
		},
	}
}

func OrderStatusToModel(s *OrderStatus) *models.OrderStatusInfo {
	return &models.OrderStatusInfo{
		Status:    models.OrderStatus(s.Status),
		Timestamp: s.Timestamp,
		TxID:      s.TxId.String(),
	}
}
