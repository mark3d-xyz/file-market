package handler

import (
	"fmt"
	"github.com/ethereum/go-ethereum/common"
	"github.com/mark3d-xyz/mark3d/indexer/models"
	"net/http"
	"strconv"
)

func parseCommonAddressParam(r *http.Request, key string) *common.Address {
	param := r.URL.Query().Get(key)

	var address = new(common.Address)
	if param != "" {
		*address = common.HexToAddress(param)
	} else {
		return nil
	}

	return address
}

func parseLimitParam(r *http.Request, key string, defaultValue, maxValue int) (int, *models.ErrorResponse) {
	limitStr := r.URL.Query().Get(key)

	limit := defaultValue
	if limitStr != "" {
		var err error
		limit, err = strconv.Atoi(limitStr)
		if err != nil {
			return 0, &models.ErrorResponse{
				Code:    http.StatusBadRequest,
				Detail:  "",
				Message: fmt.Sprintf("'%s' must be an integer", key),
			}
		}
	}

	if limit < 1 {
		return 0, &models.ErrorResponse{
			Code:    http.StatusBadRequest,
			Detail:  "",
			Message: fmt.Sprintf("'%s' must be greater then 0", key),
		}
	}

	if limit > maxValue {
		limit = maxValue
	}

	return limit, nil
}
