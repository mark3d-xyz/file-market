package service

import (
	"context"
	"errors"
	"fmt"
	"github.com/ethereum/go-ethereum/common"
	eth_types "github.com/ethereum/go-ethereum/core/types"
	"github.com/jackc/pgx/v4"
	"github.com/mark3d-xyz/mark3d/indexer/internal/domain"
	"github.com/mark3d-xyz/mark3d/indexer/models"
	"github.com/mark3d-xyz/mark3d/indexer/pkg/now"
	"github.com/mark3d-xyz/mark3d/indexer/pkg/retry"
	"github.com/mark3d-xyz/mark3d/indexer/pkg/types"
	"github.com/mark3d-xyz/mark3d/indexer/pkg/utils"
	"log"
	"math/big"
	"strings"
	"time"
)

func (s *service) onCollectionTransferEvent(
	ctx context.Context,
	tx pgx.Tx,
	t types.Transaction,
	block types.Block,
	tokenId *big.Int,
	to common.Address,
) error {
	collectionAddress := *t.To()
	token := &domain.Token{
		CollectionAddress: collectionAddress,
		TokenId:           tokenId,
		Owner:             to,
		Creator:           to,
		MintTxTimestamp:   block.Time(),
		MintTxHash:        t.Hash(),
	}
	if _, err := s.repository.GetToken(ctx, tx, collectionAddress, tokenId); err == nil {
		return nil
	}

	// Get token metadata
	meta, metaUri, err := s.processMetadata(ctx, token)
	if err != nil {
		return err
	}
	royalty, err := processRoyalty(ctx, s, block, token)
	if err != nil {
		return err
	}
	token.Metadata = meta
	token.MetaUri = metaUri
	token.Royalty = royalty.Uint64()
	token.BlockNumber = block.Number().Int64()

	if err := s.repository.InsertToken(ctx, tx, token); err != nil {
		return err
	}
	log.Println("token inserted", token.CollectionAddress.String(), token.TokenId.String(), token.Owner.String(),
		token.MetaUri, token.Metadata)

	// Deleting token from sequencer
	// NOTE: file bunnies tokens got deleted from sequencer only after TransferDraftCompletion
	if token.CollectionAddress == s.cfg.PublicCollectionAddress {
		if err := s.sequencer.DeleteTokenID(ctx, token.CollectionAddress, "", token.TokenId.Int64()); err != nil {
			log.Printf("failed deleting token from sequencer. Address: %s. TokendId: %s. Error: %v", token.CollectionAddress.String(), token.TokenId.String(), err)
		}
	}

	msg := &models.EFTSubscriptionMessage{
		Event:    "Transfer",
		Token:    domain.TokenToModel(token),
		Transfer: nil,
		Order:    nil,
	}
	s.fillUserProfilesForEftSubMessage(msg)
	s.SendEFTSubscriptionUpdate(token.CollectionAddress, token.TokenId, msg)

	return nil
}

func (s *service) onFileBunniesCollectionTransferEvent(
	ctx context.Context,
	tx pgx.Tx,
	t types.Transaction,
	block types.Block,
	tokenId *big.Int,
) error {
	collectionAddress := *t.To()
	if err := s.repository.UpdateTokenTxData(ctx, tx, tokenId, collectionAddress, block.Time(), t.Hash(), block.Number()); err != nil {
		return err
	}

	log.Println("fb token updated")

	token, err := s.repository.GetToken(ctx, tx, collectionAddress, tokenId)
	if err != nil {
		return err
	}

	msg := &models.EFTSubscriptionMessage{
		Event:    "Transfer",
		Token:    domain.TokenToModel(token),
		Transfer: nil,
		Order:    nil,
	}
	s.fillUserProfilesForEftSubMessage(msg)
	s.SendEFTSubscriptionUpdate(token.CollectionAddress, token.TokenId, msg)

	return nil
}

func processRoyalty(ctx context.Context, s *service, block types.Block, token *domain.Token) (*big.Int, error) {
	royaltyRetryOpts := retry.Options{
		Fn: func(ctx context.Context, args ...any) (any, error) {
			collectionAddress, caOk := args[0].(common.Address)
			tokenId, tiOk := args[1].(*big.Int)
			blockNumber, bOk := args[2].(*big.Int)

			if !caOk || !tiOk || !bOk {
				return "", fmt.Errorf("wrong Fn arguments: %w", retry.UnretryableErr)
			}
			return s.getRoyalty(ctx, collectionAddress, tokenId, blockNumber)
		},
		FnArgs:          []any{token.CollectionAddress, token.TokenId, block.Number()},
		RetryOnAnyError: true,
		Backoff: &retry.ExponentialBackoff{
			InitialInterval: 3 * time.Second,
			RandFactor:      0.5,
			Multiplier:      1.5,
			MaxInterval:     10 * time.Second,
		},
		MaxElapsedTime: 60 * time.Second,
	}

	royaltyAny, err := retry.OnErrors(ctx, royaltyRetryOpts)
	if err != nil {
		var failedErr *retry.FailedErr
		if errors.As(err, &failedErr) {
			log.Printf("failed to load royalty: %v", failedErr)
		} else {
			return nil, fmt.Errorf("failed to getRoyalty: %w", err)
		}
	}

	royalty, ok := royaltyAny.(*big.Int)
	if !ok {
		return nil, errors.New("failed to cast royalty to *big.Int")
	}
	return royalty, nil
}

func (s *service) processMetadata(ctx context.Context, token *domain.Token) (*domain.TokenMetadata, string, error) {
	metaUriRetryOpts := retry.Options{
		Fn: func(ctx context.Context, args ...any) (any, error) {
			collectionAddress, caOk := args[0].(common.Address)
			tokenId, tiOk := args[1].(*big.Int)

			if !caOk || !tiOk {
				return "", fmt.Errorf("wrong Fn arguments: %w", retry.UnretryableErr)
			}
			return s.collectionTokenURI(ctx, collectionAddress, tokenId)
		},
		FnArgs:          []any{token.CollectionAddress, token.TokenId},
		RetryOnAnyError: true,
		Backoff: &retry.ExponentialBackoff{
			InitialInterval: 3 * time.Second,
			RandFactor:      0.5,
			Multiplier:      1.5,
			MaxInterval:     10 * time.Second,
		},
		MaxElapsedTime: 60 * time.Second,
	}

	metaUriAny, err := retry.OnErrors(ctx, metaUriRetryOpts)
	if err != nil {
		var failedErr *retry.FailedErr
		if errors.As(err, &failedErr) {
			log.Printf("failed to get metadataUri: %v", failedErr)
			return domain.NewPlaceholderMetadata(), "", nil
		} else {
			return nil, "", err
		}
	}

	metaUri, ok := metaUriAny.(string)
	if !ok {
		return nil, "", errors.New("failed to cast metaUri to string")
	}

	if token.CollectionAddress == s.cfg.FileBunniesCollectionAddress && metaUri == "" {
		// file bunnies do not have metaUri til TransferDraftCompleted
		return nil, "", nil
	}

	loadMetaRetryOpts := retry.Options{
		Fn: func(ctx context.Context, args ...any) (any, error) {
			uri, ok := args[0].(string)
			if !ok {
				return "", fmt.Errorf("wrong Fn arguments: %w", retry.UnretryableErr)
			}
			return s.loadTokenParams(ctx, uri)
		},
		FnArgs:          []any{metaUri},
		RetryOnAnyError: true,
		Backoff: &retry.ExponentialBackoff{
			InitialInterval: 3 * time.Second,
			RandFactor:      0.5,
			Multiplier:      1.5,
			MaxInterval:     10 * time.Second,
		},
		MaxElapsedTime: 60 * time.Second,
	}

	metaAny, err := retry.OnErrors(ctx, loadMetaRetryOpts)
	if err != nil {
		var failedErr *retry.FailedErr
		if errors.As(err, &failedErr) {
			log.Printf("failed to load metadata: %v", failedErr)
			return domain.NewPlaceholderMetadata(), metaUri, nil
		} else {
			return nil, metaUri, fmt.Errorf("failed to loadTokenParams: %w", err)
		}
	}

	meta, ok := metaAny.(domain.TokenMetadata)
	if !ok {
		return nil, metaUri, errors.New("failed to cast to Metadata")
	}

	return &meta, metaUri, nil
}

func (s *service) onCollectionTransferInitEvent(
	ctx context.Context,
	tx pgx.Tx,
	t types.Transaction,
	l *eth_types.Log,
	tokenId *big.Int,
	from common.Address,
	to common.Address,
	transferNumber *big.Int,
	blockNumber *big.Int,
) error {
	exists, err := s.repository.TransferTxExists(ctx, tx, tokenId, t.Hash(), string(models.TransferStatusCreated))
	if err != nil {
		return err
	}
	if exists {
		return nil
	}
	token, err := s.repository.GetToken(ctx, tx, l.Address, tokenId)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil
		}
		return err
	}
	transfer := &domain.Transfer{
		CollectionAddress: *t.To(),
		TokenId:           tokenId,
		FromAddress:       from,
		ToAddress:         to,
		Number:            transferNumber,
		BlockNumber:       blockNumber.Int64(),
	}
	id, err := s.repository.InsertTransfer(ctx, tx, transfer)
	if err != nil {
		return err
	}
	transfer.Id = id

	status := domain.TransferStatus{
		Timestamp: now.Now().UnixMilli(),
		Status:    string(models.TransferStatusCreated),
		TxId:      t.Hash(),
	}
	if err := s.repository.InsertTransferStatus(ctx, tx, id, &status); err != nil {
		return err
	}
	transfer.Statuses = append([]*domain.TransferStatus{&status}, transfer.Statuses...)
	msg := &models.EFTSubscriptionMessage{
		Event:    "TransferInit",
		Token:    domain.TokenToModel(token),
		Transfer: domain.TransferToModel(transfer),
		Order:    nil,
	}
	s.fillUserProfilesForEftSubMessage(msg)
	s.SendEFTSubscriptionUpdate(token.CollectionAddress, token.TokenId, msg)

	return nil
}

func (s *service) onTransferDraftEvent(
	ctx context.Context,
	tx pgx.Tx,
	t types.Transaction,
	l *eth_types.Log,
	tokenId *big.Int,
	from common.Address,
	transferNumber *big.Int,
	blockNumber *big.Int,
) error {
	exists, err := s.repository.TransferTxExists(ctx, tx, tokenId, t.Hash(), string(models.TransferStatusDrafted))
	if err != nil {
		return err
	}
	if exists {
		return nil
	}
	token, err := s.repository.GetToken(ctx, tx, l.Address, tokenId)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil
		}
		return err
	}

	getOrderRetryOpts := retry.Options{
		Fn: func(ctx context.Context, args ...any) (any, error) {
			blockNum, bnOk := args[0].(*big.Int)
			address, aOk := args[1].(common.Address)
			tokenId, tiOk := args[2].(*big.Int)

			if !bnOk || !aOk || !tiOk {
				return "", fmt.Errorf("wrong Fn arguments: %w", retry.UnretryableErr)
			}

			var order struct {
				Token           common.Address
				TokenId         *big.Int
				Price           *big.Int
				Currency        common.Address
				Initiator       common.Address
				Receiver        common.Address
				Fulfilled       bool
				ExchangeAddress common.Address
			}

			orderV1, err := s.getExchangeOrder(ctx, blockNum, address, tokenId)
			if err != nil {
				return nil, err
			}

			order.Token = orderV1.Token
			order.TokenId = orderV1.TokenId
			order.Price = orderV1.Price
			order.Currency = orderV1.Currency
			order.Initiator = orderV1.Initiator
			order.Receiver = orderV1.Receiver
			order.Fulfilled = orderV1.Fulfilled
			order.ExchangeAddress = s.cfg.ExchangeAddress

			return order, nil
		},
		FnArgs: []any{
			big.NewInt(0).SetUint64(l.BlockNumber),
			l.Address,
			tokenId,
		},
		RetryOnAnyError: true,
		Backoff: &retry.ExponentialBackoff{
			InitialInterval: 3 * time.Second,
			RandFactor:      0.5,
			Multiplier:      1.5,
			MaxInterval:     10 * time.Second,
		},
		MaxElapsedTime: 60 * time.Second,
	}

	orderAny, err := retry.OnErrors(ctx, getOrderRetryOpts)
	if err != nil {
		return err
	}

	order, ok := orderAny.(struct {
		Token           common.Address
		TokenId         *big.Int
		Price           *big.Int
		Currency        common.Address
		Initiator       common.Address
		Receiver        common.Address
		Fulfilled       bool
		ExchangeAddress common.Address
	})
	if !ok {
		return errors.New("failed to cast order")
	}

	transfer := &domain.Transfer{
		CollectionAddress: l.Address,
		TokenId:           tokenId,
		FromAddress:       from,
		Number:            transferNumber,
		BlockNumber:       blockNumber.Int64(),
	}
	id, err := s.repository.InsertTransfer(ctx, tx, transfer)
	if err != nil {
		return err
	}
	transfer.Id = id
	timestamp := now.Now().UnixMilli()
	transferStatus := domain.TransferStatus{
		Timestamp: now.Now().UnixMilli(),
		Status:    string(models.TransferStatusDrafted),
		TxId:      t.Hash(),
	}

	if err := s.repository.InsertTransferStatus(ctx, tx, id, &transferStatus); err != nil {
		return err
	}
	transfer.Statuses = append([]*domain.TransferStatus{&transferStatus}, transfer.Statuses...)
	o := &domain.Order{
		TransferId:      id,
		Price:           order.Price,
		Currency:        order.Currency,
		ExchangeAddress: order.ExchangeAddress,
		BlockNumber:     blockNumber.Int64(),
	}
	orderId, err := s.repository.InsertOrder(ctx, tx, o)
	if err != nil {
		return err
	}
	o.Id = orderId

	orderStatus := domain.OrderStatus{
		Timestamp: timestamp,
		Status:    string(models.OrderStatusCreated),
		TxId:      t.Hash(),
	}
	if err := s.repository.InsertOrderStatus(ctx, tx, orderId, &orderStatus); err != nil {
		return err
	}
	o.Statuses = append([]*domain.OrderStatus{&orderStatus}, o.Statuses...)

	s.fillOrderUsdPrice(o)

	msg := &models.EFTSubscriptionMessage{
		Event:    "TransferDraft",
		Token:    domain.TokenToModel(token),
		Transfer: domain.TransferToModel(transfer),
		Order:    domain.OrderToModel(o),
	}
	s.fillUserProfilesForEftSubMessage(msg)
	s.SendEFTSubscriptionUpdate(token.CollectionAddress, token.TokenId, msg)

	return nil
}

func (s *service) onTransferDraftCompletionEvent(
	ctx context.Context,
	tx pgx.Tx,
	t types.Transaction,
	l *eth_types.Log,
	tokenId *big.Int,
	to common.Address,
	blockNumber *big.Int,
) error {
	exists, err := s.repository.TransferTxExists(ctx, tx, tokenId, t.Hash(), string(models.TransferStatusCreated))
	if err != nil {
		return err
	}
	if exists {
		return nil
	}
	token, err := s.repository.GetToken(ctx, tx, l.Address, tokenId)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil
		}
		return err
	}

	token.BlockNumber = blockNumber.Int64()

	if token.CollectionAddress == s.cfg.FileBunniesCollectionAddress && token.MetaUri == "" {
		metadata, metaUri, err := s.processMetadata(ctx, token)
		if err != nil {
			return fmt.Errorf("failed to process metadata for FileBunnies in TransferFinish: %w", err)
		}
		if err := s.repository.InsertMetadata(ctx, tx, metadata, token.CollectionAddress, token.TokenId); err != nil {
			return fmt.Errorf("failed to insert metadata: %w", err)
		}
		token.MetaUri = metaUri
	}

	if err := s.repository.UpdateToken(ctx, tx, token); err != nil {
		return fmt.Errorf("failed to update token: %w", err)
	}

	transfer, err := s.repository.GetActiveTransfer(ctx, tx, l.Address, tokenId)
	if err != nil {
		return fmt.Errorf("failed to get active transfer: %w", err)
	}
	order, err := s.repository.GetOrder(ctx, tx, transfer.OrderId)
	if err != nil {
		return fmt.Errorf("failed to order: %w", err)
	}
	timestamp := now.Now().UnixMilli()
	transfer.ToAddress = to
	transfer.BlockNumber = blockNumber.Int64()
	if err := s.repository.UpdateTransfer(ctx, tx, transfer); err != nil {
		return err
	}
	transferStatus := domain.TransferStatus{
		Timestamp: timestamp,
		Status:    string(models.TransferStatusCreated),
		TxId:      t.Hash(),
	}
	if err := s.repository.InsertTransferStatus(ctx, tx, transfer.Id, &transferStatus); err != nil {
		return err
	}
	transfer.Statuses = append([]*domain.TransferStatus{&transferStatus}, transfer.Statuses...)

	orderStatus := domain.OrderStatus{
		Timestamp: timestamp,
		Status:    string(models.OrderStatusFulfilled),
		TxId:      t.Hash(),
	}
	if err := s.repository.InsertOrderStatus(ctx, tx, order.Id, &orderStatus); err != nil {
		return err
	}
	order.Statuses = append([]*domain.OrderStatus{&orderStatus}, order.Statuses...)
	s.fillOrderUsdPrice(order)

	if token.CollectionAddress == s.cfg.FileBunniesCollectionAddress {
		var suffix string
		if token.TokenId.Cmp(big.NewInt(6000)) == -1 {
			suffix = "common"
		} else if token.TokenId.Cmp(big.NewInt(7000)) == -1 {
			suffix = "uncommon"
		} else {
			suffix = "payed"
		}
		if err := s.sequencer.DeleteTokenID(ctx, token.CollectionAddress, suffix, token.TokenId.Int64()); err != nil {
			log.Printf("failed deleting token from sequencer. Address: %s. Suffix:%s. TokendId: %s. Error: %v", token.CollectionAddress.String(), suffix, token.TokenId.String(), err)
		}
	}

	msg := &models.EFTSubscriptionMessage{
		Event:    "TransferDraftCompletion",
		Token:    domain.TokenToModel(token),
		Transfer: domain.TransferToModel(transfer),
		Order:    domain.OrderToModel(order),
	}
	s.fillUserProfilesForEftSubMessage(msg)
	s.SendEFTSubscriptionUpdate(token.CollectionAddress, token.TokenId, msg)

	// Send email notification to owner
	buyer, e := s.GetUserProfile(ctx, transfer.ToAddress.String(), true)
	if e != nil {
		return errors.New(e.Message)
	}
	owner, e := s.GetUserProfile(ctx, token.Owner.String(), true)
	if e != nil {
		return errors.New(e.Message)
	}

	if owner.IsEmailNotificationEnabled && owner.Email != "" && owner.IsEmailConfirmed {
		network := "Filecoin"
		currency := "FIL"
		if strings.Contains(s.cfg.Mode, "era") {
			network = "ZkSync"
			currency = "ETH"
		}
		tokenUrl := fmt.Sprintf("%s/collection/%s/%s/%s", s.cfg.Host, network, strings.ToLower(token.CollectionAddress.String()), token.TokenId.String())
		ownerName := owner.Name
		if ownerName == "" {
			ownerName = "FileMarketer"
		}
		buyerName := buyer.Name
		if buyerName == "" {
			buyerName = buyer.Address
		}
		data := emailBuyNotificationTemplateParams{
			OwnerName:          ownerName,
			BuyerName:          buyerName,
			TokenName:          token.Metadata.Name,
			TokenUrl:           tokenUrl,
			Price:              utils.ParseEth(order.Price).String(),
			Currency:           currency,
			ProfileSettingsUrl: fmt.Sprintf("%s/profile/%s", s.cfg.Host, buyer.Address),
			BottomFilename:     "bottompng",
			LogoFilename:       "logopng",
		}

		if err := s.sendEmail("email_buy_notification", owner.Email, "Your order was fulfilled", "owner notification", data); err != nil {
			logger.Error("failed to send fulfill notification email", err, nil)
		}
	}

	return nil
}

func (s *service) onPublicKeySetEvent(
	ctx context.Context,
	tx pgx.Tx,
	t types.Transaction,
	l *eth_types.Log,
	tokenId *big.Int,
	publicKey string,
	blockNumber *big.Int,
) error {
	exists, err := s.repository.TransferTxExists(ctx, tx, tokenId, t.Hash(), string(models.TransferStatusPublicKeySet))
	if err != nil {
		return err
	}
	if exists {
		return nil
	}

	token, err := s.repository.GetToken(ctx, tx, l.Address, tokenId)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil
		}
		return err
	}
	transfer, err := s.repository.GetActiveTransfer(ctx, tx, l.Address, tokenId)
	if err != nil {
		return err
	}

	transferStatus := domain.TransferStatus{
		Timestamp: now.Now().UnixMilli(),
		Status:    string(models.TransferStatusPublicKeySet),
		TxId:      t.Hash(),
	}
	if err := s.repository.InsertTransferStatus(ctx, tx, transfer.Id, &transferStatus); err != nil {
		return err
	}
	transfer.PublicKey = publicKey
	transfer.BlockNumber = blockNumber.Int64()
	transfer.Statuses = append([]*domain.TransferStatus{&transferStatus}, transfer.Statuses...)

	if err := s.repository.UpdateTransfer(ctx, tx, transfer); err != nil {
		return err
	}

	// only for ws
	order, err := s.repository.GetActiveOrder(ctx, tx, token.CollectionAddress, token.TokenId)
	if err != nil {
		if !errors.Is(err, pgx.ErrNoRows) {
			return fmt.Errorf("failed to get active order: %w", err)
		}
	}
	s.fillOrderUsdPrice(order)

	msg := &models.EFTSubscriptionMessage{
		Event:    "TransferPublicKeySet",
		Token:    domain.TokenToModel(token),
		Transfer: domain.TransferToModel(transfer),
		Order:    domain.OrderToModel(order),
	}
	s.fillUserProfilesForEftSubMessage(msg)
	s.SendEFTSubscriptionUpdate(token.CollectionAddress, token.TokenId, msg)

	return nil
}

func (s *service) onPasswordSetEvent(
	ctx context.Context,
	tx pgx.Tx,
	t types.Transaction,
	l *eth_types.Log,
	tokenId *big.Int,
	encryptedPassword string,
	blockNumber *big.Int,
) error {
	exists, err := s.repository.TransferTxExists(ctx, tx, tokenId, t.Hash(), string(models.TransferStatusPasswordSet))
	if err != nil {
		return err
	}
	if exists {
		return nil
	}

	token, err := s.repository.GetToken(ctx, tx, l.Address, tokenId)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil
		}
		return err
	}

	transfer, err := s.repository.GetActiveTransfer(ctx, tx, l.Address, tokenId)
	if err != nil {
		return err
	}

	transferStatus := domain.TransferStatus{
		Timestamp: now.Now().UnixMilli(),
		Status:    string(models.TransferStatusPasswordSet),
		TxId:      t.Hash(),
	}
	if err := s.repository.InsertTransferStatus(ctx, tx, transfer.Id, &transferStatus); err != nil {
		return err
	}
	transfer.EncryptedPassword = encryptedPassword
	transfer.BlockNumber = blockNumber.Int64()
	transfer.Statuses = append([]*domain.TransferStatus{&transferStatus}, transfer.Statuses...)
	if err := s.repository.UpdateTransfer(ctx, tx, transfer); err != nil {
		return err
	}

	// only for ws
	order, err := s.repository.GetActiveOrder(ctx, tx, token.CollectionAddress, token.TokenId)
	if err != nil {
		if !errors.Is(err, pgx.ErrNoRows) {
			return fmt.Errorf("failed to get active order: %w", err)
		}
	}
	s.fillOrderUsdPrice(order)

	msg := &models.EFTSubscriptionMessage{
		Event:    "TransferPasswordSet",
		Token:    domain.TokenToModel(token),
		Transfer: domain.TransferToModel(transfer),
		Order:    domain.OrderToModel(order),
	}
	s.fillUserProfilesForEftSubMessage(msg)
	s.SendEFTSubscriptionUpdate(token.CollectionAddress, token.TokenId, msg)

	// Send email notification
	owner, e := s.GetUserProfile(ctx, transfer.FromAddress.String(), true)
	if e != nil {
		return errors.New(e.Message)
	}
	buyer, e := s.GetUserProfile(ctx, transfer.ToAddress.String(), true)
	if e != nil {
		return errors.New(e.Message)
	}

	if buyer.IsEmailNotificationEnabled && buyer.Email != "" {
		network := "Filecoin"
		if strings.Contains(s.cfg.Mode, "era") {
			network = "ZkSync"
		}
		tokenUrl := fmt.Sprintf("%s/collection/%s/%s/%s", s.cfg.Host, network, strings.ToLower(token.CollectionAddress.String()), token.TokenId.String())
		ownerName := owner.Name
		if ownerName == "" {
			ownerName = owner.Address
		}
		buyerName := buyer.Name
		if buyerName == "" {
			buyerName = "FileMarketer"
		}
		data := emailTransferNotificationTemplateParams{
			BuyerName:          buyerName,
			OwnerName:          ownerName,
			TokenName:          token.Metadata.Name,
			TokenUrl:           tokenUrl,
			ProfileSettingsUrl: fmt.Sprintf("%s/profile/%s", s.cfg.Host, buyer.Address),
			BottomFilename:     "bottompng",
			LogoFilename:       "logopng",
		}

		if err := s.sendEmail("email_transfer_notification", buyer.Email, "Hidden file was transferred", "buyer notification", data); err != nil {
			logger.Error("failed to send file transfer notification email", err, nil)
		}
	}

	return nil
}

func (s *service) onTransferFinishEvent(
	ctx context.Context,
	tx pgx.Tx,
	t types.Transaction,
	l *eth_types.Log,
	tokenId *big.Int,
	blockNumber *big.Int,
) error {
	exists, err := s.repository.TransferTxExists(ctx, tx, tokenId, t.Hash(), string(models.TransferStatusFinished))
	if err != nil {
		return err
	}
	if exists {
		return nil
	}

	token, err := s.repository.GetToken(ctx, tx, l.Address, tokenId)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil
		}
		return err
	}
	transfer, err := s.repository.GetActiveTransfer(ctx, tx, l.Address, tokenId)
	if err != nil {
		return err
	}
	timestamp := now.Now().UnixMilli()
	// only for ws
	order, err := s.repository.GetActiveOrder(ctx, tx, token.CollectionAddress, token.TokenId)
	if err != nil {
		if !errors.Is(err, pgx.ErrNoRows) {
			return fmt.Errorf("failed to get active order: %w", err)
		}
	}
	transferStatus := domain.TransferStatus{
		Timestamp: timestamp,
		Status:    string(models.TransferStatusFinished),
		TxId:      t.Hash(),
	}

	if err := s.repository.InsertTransferStatus(ctx, tx, transfer.Id, &transferStatus); err != nil {
		return err
	}
	transfer.Statuses = append([]*domain.TransferStatus{&transferStatus}, transfer.Statuses...)

	orderStatus := domain.OrderStatus{
		Timestamp: timestamp,
		Status:    string(models.OrderStatusFinished),
		TxId:      t.Hash(),
	}
	if transfer.OrderId != 0 && order != nil {
		if err := s.repository.InsertOrderStatus(ctx, tx, transfer.OrderId, &orderStatus); err != nil {
			return err
		}

		order.Statuses = append([]*domain.OrderStatus{&orderStatus}, order.Statuses...)
		s.fillOrderUsdPrice(order)
	}

	token, err = s.repository.GetToken(ctx, tx, l.Address, tokenId)
	if err != nil {
		return err
	}
	token.Owner = transfer.ToAddress
	token.BlockNumber = blockNumber.Int64()
	if err := s.repository.UpdateToken(ctx, tx, token); err != nil {
		return err
	}

	msg := &models.EFTSubscriptionMessage{
		Event:    "TransferFinished",
		Token:    domain.TokenToModel(token),
		Transfer: nil,
		Order:    domain.OrderToModel(order),
	}
	s.fillUserProfilesForEftSubMessage(msg)
	s.SendEFTSubscriptionUpdate(token.CollectionAddress, token.TokenId, msg)

	return nil
}

func (s *service) onTransferFraudReportedEvent(
	ctx context.Context,
	tx pgx.Tx,
	t types.Transaction,
	l *eth_types.Log,
	tokenId *big.Int,
) error {
	exists, err := s.repository.TransferTxExists(ctx, tx, tokenId, t.Hash(), string(models.TransferStatusFraudReported))
	if err != nil {
		return err
	}
	if exists {
		return nil
	}
	token, err := s.repository.GetToken(ctx, tx, l.Address, tokenId)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil
		}
		return err
	}
	transfer, err := s.repository.GetActiveTransfer(ctx, tx, l.Address, tokenId)
	if err != nil {
		return err
	}
	timestamp := now.Now().UnixMilli()
	transferStatus := domain.TransferStatus{
		Timestamp: timestamp,
		Status:    string(models.TransferStatusFraudReported),
		TxId:      t.Hash(),
	}
	// only for ws
	order, err := s.repository.GetActiveOrder(ctx, tx, token.CollectionAddress, token.TokenId)
	if err != nil {
		if !errors.Is(err, pgx.ErrNoRows) {
			return fmt.Errorf("failed to get active order: %w", err)
		}
	}
	s.fillOrderUsdPrice(order)
	if err := s.repository.InsertTransferStatus(ctx, tx, transfer.Id, &transferStatus); err != nil {
		return err
	}
	transfer.Statuses = append([]*domain.TransferStatus{&transferStatus}, transfer.Statuses...)

	msg := &models.EFTSubscriptionMessage{
		Event:    "TransferFraudReported",
		Token:    domain.TokenToModel(token),
		Transfer: domain.TransferToModel(transfer),
		Order:    domain.OrderToModel(order),
	}
	s.fillUserProfilesForEftSubMessage(msg)
	s.SendEFTSubscriptionUpdate(token.CollectionAddress, token.TokenId, msg)

	return nil
}

func (s *service) onTransferFraudDecidedEvent(
	ctx context.Context,
	tx pgx.Tx,
	t types.Transaction,
	l *eth_types.Log,
	tokenId *big.Int,
	approved bool,
	blockNumber *big.Int,
) error {
	exists, err := s.repository.TransferTxExists(ctx, tx, tokenId, t.Hash(), string(models.TransferStatusFinished))
	if err != nil {
		return err
	}
	if exists {
		return nil
	}
	token, err := s.repository.GetToken(ctx, tx, l.Address, tokenId)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil
		}
		return err
	}
	transfer, err := s.repository.GetActiveTransfer(ctx, tx, l.Address, tokenId)
	if err != nil {
		return err
	}
	timestamp := now.Now().UnixMilli()
	// only for ws
	order, err := s.repository.GetActiveOrder(ctx, tx, token.CollectionAddress, token.TokenId)
	if err != nil {
		if !errors.Is(err, pgx.ErrNoRows) {
			return fmt.Errorf("failed to get active order: %w", err)
		}
	}
	transferStatus := domain.TransferStatus{
		Timestamp: timestamp,
		Status:    string(models.TransferStatusFinished),
		TxId:      t.Hash(),
	}
	if err := s.repository.InsertTransferStatus(ctx, tx, transfer.Id, &transferStatus); err != nil {
		return err
	}
	transfer.Statuses = append([]*domain.TransferStatus{&transferStatus}, transfer.Statuses...)
	if transfer.OrderId != 0 && order != nil {
		var orderStatus string
		if approved {
			orderStatus = string(models.OrderStatusFraudApproved)
		} else {
			orderStatus = string(models.OrderStatusFinished)
		}
		status := domain.OrderStatus{
			Timestamp: timestamp,
			Status:    orderStatus,
			TxId:      t.Hash(),
		}
		if err := s.repository.InsertOrderStatus(ctx, tx, transfer.OrderId, &status); err != nil {
			return err
		}

		order.Statuses = append([]*domain.OrderStatus{&status}, order.Statuses...)
		s.fillOrderUsdPrice(order)
	}
	if approved {
		transfer.FraudApproved = true
		transfer.BlockNumber = blockNumber.Int64()
		if err := s.repository.UpdateTransfer(ctx, tx, transfer); err != nil {
			return err
		}
	} else {
		token, err = s.repository.GetToken(ctx, tx, l.Address, tokenId)
		if err != nil {
			return err
		}
		token.Owner = transfer.ToAddress
		token.BlockNumber = blockNumber.Int64()
		if err := s.repository.UpdateToken(ctx, tx, token); err != nil {
			return err
		}
	}

	msg := &models.EFTSubscriptionMessage{
		Event:    "TransferFraudDecided",
		Token:    domain.TokenToModel(token),
		Transfer: domain.TransferToModel(transfer),
		Order:    domain.OrderToModel(order),
	}
	s.fillUserProfilesForEftSubMessage(msg)
	s.SendEFTSubscriptionUpdate(token.CollectionAddress, token.TokenId, msg)

	return nil
}

func (s *service) onTransferCancel(
	ctx context.Context,
	tx pgx.Tx,
	t types.Transaction,
	l *eth_types.Log,
	tokenId *big.Int,
) error {
	exists, err := s.repository.TransferTxExists(ctx, tx, tokenId, t.Hash(), string(models.TransferStatusCancelled))
	if err != nil {
		return err
	}
	if exists {
		return nil
	}
	token, err := s.repository.GetToken(ctx, tx, l.Address, tokenId)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil
		}
		return err
	}
	transfer, err := s.repository.GetActiveTransfer(ctx, tx, l.Address, tokenId)
	if err != nil {
		return err
	}
	timestamp := now.Now().UnixMilli()
	// only for ws
	order, err := s.repository.GetActiveOrder(ctx, tx, token.CollectionAddress, token.TokenId)
	if err != nil {
		if !errors.Is(err, pgx.ErrNoRows) {
			return fmt.Errorf("failed to get active order: %w", err)
		}
	}
	transferStatus := domain.TransferStatus{
		Timestamp: timestamp,
		Status:    string(models.TransferStatusCancelled),
		TxId:      t.Hash(),
	}
	if err := s.repository.InsertTransferStatus(ctx, tx, transfer.Id, &transferStatus); err != nil {
		return err
	}
	transfer.Statuses = append([]*domain.TransferStatus{&transferStatus}, transfer.Statuses...)

	if transfer.OrderId != 0 && order != nil {
		status := domain.OrderStatus{
			Timestamp: timestamp,
			Status:    string(models.OrderStatusCancelled),
			TxId:      t.Hash(),
		}
		if err := s.repository.InsertOrderStatus(ctx, tx, transfer.OrderId, &status); err != nil {
			return err
		}

		order.Statuses = append([]*domain.OrderStatus{&status}, order.Statuses...)
		s.fillOrderUsdPrice(order)
	}

	msg := &models.EFTSubscriptionMessage{
		Event:    "TransferCancellation",
		Token:    domain.TokenToModel(token),
		Transfer: nil,
		Order:    domain.OrderToModel(order),
	}
	s.fillUserProfilesForEftSubMessage(msg)
	s.SendEFTSubscriptionUpdate(token.CollectionAddress, token.TokenId, msg)

	return nil
}

func (s *service) onLikeEvent(ctx context.Context, tx pgx.Tx, collectionAddress common.Address, tokenId *big.Int) error {
	return s.repository.IncrementLike(ctx, tx, collectionAddress, tokenId)
}
