package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"strings"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"github.com/mark3d-xyz/mark3d/indexer/internal/domain"
	"github.com/mark3d-xyz/mark3d/indexer/models"
	"github.com/mark3d-xyz/mark3d/indexer/pkg/currencyconversion"
	"github.com/mark3d-xyz/mark3d/indexer/pkg/utils"
)

func (s *service) AddEFTSubscription(ctx context.Context, w http.ResponseWriter, r *http.Request, req *models.EFTSubscriptionRequest) {
	collectionAddress := common.HexToAddress(req.CollectionAddress)
	tokenId, ok := big.NewInt(0).SetString(req.TokenID, 10)
	if !ok {
		log.Println("failed to parse token id in AddEFTSubscription")
	}

	topic := fmt.Sprintf("%s:%s", strings.ToLower(collectionAddress.String()), tokenId.String())
	resp := s.wsPool.GetOnConnectResponse()(ctx, req)
	if err := s.wsPool.AddConnection(w, r, topic, resp); err != nil {
		logger.Error("failed to add connection", err, nil)
		return
	}
}

func (s *service) EFTSubOnConnectionResponse(ctx context.Context, req any) any {
	r, ok := req.(models.EFTSubscriptionRequest)
	if !ok {
		return errors.New("failed to parse EFTSubscriptionRequest")
	}

	collectionAddress := common.HexToAddress(r.CollectionAddress)
	tokenId, ok := big.NewInt(0).SetString(r.TokenID, 10)
	if !ok {
		log.Println("failed to parse token id in AddEFTSubscription")
		return errors.New("failed to parse EFTSubscriptionRequest")
	}

	token, transfer, order, err := s.getTokenCurrentState(ctx, collectionAddress, tokenId)
	if err != nil {
		logger.Error("failed to get token current state", err, nil)
	}

	var msg *models.EFTSubscriptionMessage
	if token != nil {
		m := &domain.EFTSubMessage{
			Event:    "",
			Token:    token,
			Transfer: transfer,
			Order:    order,
		}

		if m.Order != nil {
			currency := "FIL"
			if strings.Contains(s.cfg.Mode, "era") {
				currency = "ETH"
			}
			rate, err := s.currencyConverter.GetExchangeRate(context.Background(), currency, "USD")
			if err != nil {
				log.Println("failed to get conversion rate: ", err)
				rate = 0
			}

			m.Order.PriceUsd = currencyconversion.Convert(rate, m.Order.Price)
		}

		msg = domain.EFTSubMessageToModel(m)
		s.fillUserProfilesForEftSubMessage(msg)
	}

	return msg
}

func (s *service) SendEFTSubscriptionUpdate(collectionAddress common.Address, tokenId *big.Int, msg *models.EFTSubscriptionMessage) {
	topic := fmt.Sprintf("%s:%s", strings.ToLower(collectionAddress.String()), tokenId.String())
	s.wsPool.SendTopicSub(topic, msg)
}

func (s *service) SendBlockNumberSubscriptionUpdate(number *big.Int) {
	go func() {
		lastBlockMessage, err := json.Marshal(map[string]any{"last_block_number": number.Uint64()})
		if err != nil {
			logger.Error("failed to marshal last block number for broadcast: %v", err, nil)
			return
		}

		s.wsPool.SendTopicSub("last_block", lastBlockMessage)
	}()
}

func (s *service) AddBlockNumberSubscription(w http.ResponseWriter, r *http.Request) {
	if err := s.wsPool.AddConnection(w, r, "last_block", nil); err != nil {
		logger.Error("failed to add connection", err, nil)
		return
	}
}

func (s *service) fillUserProfilesForEftSubMessage(msg *models.EFTSubscriptionMessage) {
	if msg == nil {
		return
	}
	addresses := make(map[string]struct{})
	if msg.Token != nil {
		addresses[strings.ToLower(msg.Token.Owner)] = struct{}{}
		addresses[strings.ToLower(msg.Token.Creator)] = struct{}{}
	}
	if msg.Transfer != nil {
		addresses[strings.ToLower(msg.Transfer.To)] = struct{}{}
		addresses[strings.ToLower(msg.Transfer.From)] = struct{}{}
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	profilesMap, e := s.getProfilesMap(ctx, utils.SetToSlice(addresses))
	if e != nil {
		logger.Error("failed to get profiles", fmt.Errorf(e.Message), nil)
	}

	if msg.Token != nil {
		fillTokenUserProfiles(msg.Token, profilesMap)
	}
	if msg.Transfer != nil {
		fillTransferUserProfiles(msg.Transfer, profilesMap)
	}
}
