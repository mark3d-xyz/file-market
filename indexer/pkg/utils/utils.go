package utils

import (
	"github.com/ethereum/go-ethereum/params"
	"math/big"
)

func ParseEth(wei *big.Int) *big.Float {
	return new(big.Float).Quo(new(big.Float).SetInt(wei), big.NewFloat(params.Ether))
}

func SetToSlice[T comparable](set map[T]struct{}) []T {
	s := make([]T, 0, len(set))
	for k := range set {
		s = append(s, k)
	}
	return s
}
