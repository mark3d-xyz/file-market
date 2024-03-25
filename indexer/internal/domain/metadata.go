package domain

import (
	"fmt"

	"github.com/mark3d-xyz/mark3d/indexer/models"
)

type HiddenFileMetadata struct {
	Name string
	Type string
	Size int64
}

type TokenMetadata struct {
	Id                   int64
	Name                 string
	Description          string
	Image                string
	ExternalLink         string
	HiddenFile           string
	HiddenFileMeta       *HiddenFileMetadata
	License              string
	LicenseUrl           string
	Properties           []*MetadataProperty
	Rankings             []*MetadataProperty
	Stats                []*MetadataProperty
	Categories           []string
	Subcategories        []string
	Tags                 []string
	IsBackedOnGreenfield bool
}

func NewEmptyTokenMetadata() TokenMetadata {
	return TokenMetadata{
		HiddenFileMeta: &HiddenFileMetadata{},
	}
}

type MetadataProperty struct {
	TraitType       string
	DisplayType     string
	Value           string
	MaxValue        string
	MinValue        string
	TraitValueCount int64
	TraitTotal      int64
}

type HiddenFileMetadataIpfs struct {
	Name string `json:"name"`
	Type string `json:"type"`
	Size int64  `json:"size"`
}

type MetadataPropertyIpfs struct {
	TraitType   string      `json:"traitType"`
	DisplayType string      `json:"displayType"`
	Value       interface{} `json:"value"`
	MaxValue    interface{} `json:"maxValue"`
	MinValue    interface{} `json:"minValue"`
}

type TokenMetadataIpfs struct {
	Id                   int64                   `json:"-"`
	Name                 string                  `json:"name"`
	Description          string                  `json:"description"`
	Image                string                  `json:"image"`
	ExternalLink         string                  `json:"external_link"`
	HiddenFile           string                  `json:"hidden_file"`
	HiddenFileMeta       *HiddenFileMetadataIpfs `json:"hidden_file_meta"`
	License              string                  `json:"license"`
	LicenseUrl           string                  `json:"license_url"`
	Attributes           []*MetadataPropertyIpfs `json:"attributes"`
	Categories           []string                `json:"categories"`
	Subcategories        []string                `json:"subcategories"`
	Tags                 []string                `json:"tags"`
	IsBackedOnGreenfield bool                    `json:"isBackedOnGreenfield"`
}

func IpfsMetadataToDomain(m TokenMetadataIpfs) TokenMetadata {
	res := TokenMetadata{
		Name:                 m.Name,
		Description:          m.Description,
		Image:                m.Image,
		ExternalLink:         m.ExternalLink,
		HiddenFile:           m.HiddenFile,
		HiddenFileMeta:       &HiddenFileMetadata{},
		License:              m.License,
		LicenseUrl:           m.LicenseUrl,
		Properties:           make([]*MetadataProperty, 0),
		Rankings:             make([]*MetadataProperty, 0),
		Stats:                make([]*MetadataProperty, 0),
		Categories:           make([]string, 0),
		Subcategories:        make([]string, 0),
		Tags:                 make([]string, 0),
		IsBackedOnGreenfield: m.IsBackedOnGreenfield,
	}

	if m.HiddenFileMeta != nil {
		res.HiddenFileMeta = &HiddenFileMetadata{
			Name: m.HiddenFileMeta.Name,
			Type: m.HiddenFileMeta.Type,
			Size: m.HiddenFileMeta.Size,
		}
	}
	if m.Categories != nil {
		res.Categories = m.Categories
	}
	if m.Subcategories != nil {
		res.Subcategories = m.Subcategories
	}
	if m.Tags != nil {
		res.Tags = m.Tags
	}

	for _, a := range m.Attributes {
		switch value := a.Value.(type) {
		case string:
			res.Properties = append(res.Properties, NewMetadataProperty(
				a.TraitType,
				a.DisplayType,
				value,
				"",
				"",
			))
		case float64:
			valueStr := fmt.Sprintf("%.6f", value)

			maxValue := ""
			if maxValueF, ok := a.MaxValue.(float64); ok {
				maxValue = fmt.Sprintf("%.6f", maxValueF)
			}

			minValue := ""
			if minValueF, ok := a.MinValue.(float64); ok {
				minValue = fmt.Sprintf("%.6f", minValueF)
			}

			md := NewMetadataProperty(a.TraitType, a.DisplayType, valueStr, maxValue, minValue)
			if a.DisplayType == "number" {
				res.Stats = append(res.Stats, md)
			} else {
				res.Rankings = append(res.Rankings, md)
			}
		default:
			res.Properties = append(res.Properties, NewMetadataProperty(
				a.TraitType,
				a.DisplayType,
				fmt.Sprintf("%v", a.Value),
				"",
				"",
			))
		}
	}
	return res
}

func MetadataPropertyToModel(mp *MetadataProperty) *models.MetadataProperty {
	if mp == nil {
		return nil
	}

	return &models.MetadataProperty{
		DisplayType:     mp.DisplayType,
		TraitType:       mp.TraitType,
		Value:           mp.Value,
		MaxValue:        mp.MaxValue,
		MinValue:        mp.MinValue,
		TraitValueCount: mp.TraitValueCount,
		TraitTotal:      mp.TraitTotal,
	}
}

func NewMetadataProperty(traitType, displayType, value, maxValue, minValue string) *MetadataProperty {
	return &MetadataProperty{
		TraitType:   traitType,
		DisplayType: displayType,
		Value:       value,
		MaxValue:    maxValue,
		MinValue:    minValue,
	}
}

func NewPlaceholderMetadata() *TokenMetadata {
	return &TokenMetadata{
		Name:        "Undefined",
		Description: "Undefined",
		Image:       "",
		HiddenFileMeta: &HiddenFileMetadata{
			Name: "Undefined",
			Type: "Undefined",
			Size: 0,
		},
	}
}
func NewFileBunniesPlaceholder() *TokenMetadata {
	return &TokenMetadata{
		Name:         "Unknown File Bunnie",
		Description:  "Transfer is not finished",
		Image:        "",
		ExternalLink: "",
		HiddenFile:   "",
		HiddenFileMeta: &HiddenFileMetadata{
			Name: "Undefined",
			Type: "Undefined",
			Size: 0,
		},
	}
}
