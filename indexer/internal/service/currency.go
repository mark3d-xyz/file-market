package service

import (
	"context"
	"log"

	"github.com/mark3d-xyz/mark3d/indexer/models"
)

func (s *service) GetCurrencyConversionRate(ctx context.Context, to string) (*models.ConversionRateResponse, *models.ErrorResponse) {
	from := s.cfg.Currency
	rate, err := s.currencyConverter.GetExchangeRate(ctx, from, to)
	if err != nil {
		log.Println("failed to get conversion rate: ", err)
		return nil, internalError
	}

	return &models.ConversionRateResponse{
		From: from,
		To:   to,
		Rate: rate,
	}, nil
}
