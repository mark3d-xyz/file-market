package domain

import (
	"math/big"

	"github.com/ethereum/go-ethereum/common"
	"github.com/mark3d-xyz/mark3d/indexer/models"
)

type Token struct {
	CollectionAddress common.Address
	CollectionName    string
	TokenId           *big.Int
	Owner             common.Address
	Creator           common.Address
	Royalty           uint64
	MintTxTimestamp   uint64
	MintTxHash        common.Hash
	MetaUri           string
	Metadata          *TokenMetadata
	BlockNumber       int64
	LikeCount         int64
}

func TokenToModel(t *Token) *models.Token {
	return &models.Token{
		Categories:        t.Metadata.Categories,
		CollectionAddress: t.CollectionAddress.String(),
		CollectionName:    t.CollectionName,
		Creator:           t.Creator.String(),
		CreatorProfile: &models.UserProfileShort{
			Address: t.Creator.String(),
		},
		Description:  t.Metadata.Description,
		ExternalLink: t.Metadata.ExternalLink,
		HiddenFile:   t.Metadata.HiddenFile,
		HiddenFileMeta: &models.HiddenFileMetaData{
			Name: t.Metadata.HiddenFileMeta.Name,
			Size: t.Metadata.HiddenFileMeta.Size,
			Type: t.Metadata.HiddenFileMeta.Type,
		},
		Image:           t.Metadata.Image,
		License:         t.Metadata.License,
		LicenseURL:      t.Metadata.LicenseUrl,
		Royalty:         t.Royalty,
		MintTxTimestamp: t.MintTxTimestamp,
		MintTxHash:      t.MintTxHash.String(),
		MetaURI:         t.MetaUri,
		Name:            t.Metadata.Name,
		Owner:           t.Owner.String(),
		LikeCount:       t.LikeCount,
		OwnerProfile: &models.UserProfileShort{
			Address: t.Owner.String(),
		},
		Properties:    MapSlice(t.Metadata.Properties, MetadataPropertyToModel),
		Rankings:      MapSlice(t.Metadata.Rankings, MetadataPropertyToModel),
		Stats:         MapSlice(t.Metadata.Stats, MetadataPropertyToModel),
		Subcategories: t.Metadata.Subcategories,
		Tags:          t.Metadata.Tags,
		TokenID:       t.TokenId.String(),
		Block: &models.TokenBlock{
			ConfirmationsCount: 1,
			Number:             t.BlockNumber,
		},
	}
}
