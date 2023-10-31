package domain

import (
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"net/http"
)

type APIError struct {
	Code    int64
	Message string
	Detail  string
}

type GRPCError struct {
	Code    codes.Code
	Message string
	Detail  string
}

var (
	InternalError = &APIError{
		Code:    http.StatusInternalServerError,
		Message: "Internal server error",
	}
)

func (e *APIError) ToGRPC() error {
	var code = codes.Internal

	switch e.Code {
	case http.StatusBadRequest:
		code = codes.InvalidArgument
	case http.StatusUnauthorized:
		code = codes.Unauthenticated
	case http.StatusNotFound:
		code = codes.NotFound
	default:
		code = codes.Internal
	}

	return status.Errorf(code, e.Message)
}

func MapSlice[T1, T2 any](input []T1, f func(T1) T2) (output []T2) {
	output = make([]T2, 0, len(input))
	for _, v := range input {
		output = append(output, f(v))
	}
	return output
}
