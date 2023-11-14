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

func Map[T1, T2 any](x []T1, converter func(T1) T2) []T2 {
	res := make([]T2, len(x))
	for i := range x {
		res[i] = converter(x[i])
	}
	return res
}

func Filter[T any](arr []T, predicate func(T) bool) []T {
	var res []T
	for _, el := range arr {
		if !predicate(el) {
			continue
		}

		res = append(res, el)
	}
	return res
}

func Has[T any](arr []T, predicate func(T) bool) bool {
	for _, el := range arr {
		if predicate(el) {
			return true
		}
	}
	return false
}
