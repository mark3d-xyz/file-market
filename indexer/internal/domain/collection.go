package domain

import (
	"math/big"

	"github.com/ethereum/go-ethereum/common"
	"github.com/mark3d-xyz/mark3d/indexer/models"
)

type Collection struct {
	Address     common.Address
	Creator     common.Address
	Owner       common.Address
	TokenId     *big.Int
	MetaUri     string
	Name        string
	Description string
	Image       string
	Type        string
	BlockNumber int64
	OrdersCount uint64
	OwnersCount uint64
	TokensCount uint64
	SalesVolume *big.Int
	FloorPrice  *big.Int
}

type CollectionTransfer struct {
	Timestamp int64
	From      common.Address
	To        common.Address
	TxId      common.Hash
}

func CollectionToModel(c *Collection) *models.Collection {
	salesVolume := c.SalesVolume.String()
	if c.SalesVolume == nil {
		salesVolume = ""
	}
	floorPrice := c.FloorPrice.String()
	if c.FloorPrice == nil {
		floorPrice = ""
	}

	return &models.Collection{
		Address: c.Address.String(),
		Block: &models.CollectionBlock{
			ConfirmationsCount: 1,
			Number:             c.BlockNumber,
		},
		Creator: c.Creator.String(),
		CreatorProfile: &models.UserProfileShort{
			Address: c.Address.String(),
		},
		Description: c.Description,
		Image:       c.Image,
		MetaURI:     c.MetaUri,
		Name:        c.Name,
		Owner:       c.Owner.String(),
		OwnerProfile: &models.UserProfileShort{
			Address: c.Address.String(),
		},
		TokenID:     c.TokenId.String(),
		ChainID:     cfg.Service.ChainID,
		OrdersCount: c.OrdersCount,
		OwnersCount: c.OwnersCount,
		TokensCount: c.TokensCount,
		Type:        c.Type,
		SalesVolume: salesVolume,
		FloorPrice:  floorPrice,
	}
}

type CollectionStats struct {
	Name  string
	Value float64
}

type CollectionProfile struct {
	Address    common.Address
	Slug       string // unique name that will be used in url
	WebsiteURL string
	Twitter    string
	Telegram   string
	Discord    string
	BannerUrl  string
}
