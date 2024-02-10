package handler

import (
	"math/big"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/mark3d-xyz/mark3d/indexer/models"
)

func (h *handler) subscribeToBlockNumber(w http.ResponseWriter, r *http.Request) {
	h.service.AddBlockNumberSubscription(w, r)
}

func (h *handler) subscribeToEFT(w http.ResponseWriter, r *http.Request) {
	address := mux.Vars(r)["address"]
	id, ok := big.NewInt(0).SetString(mux.Vars(r)["id"], 10)
	if !ok {
		sendResponse(w, http.StatusBadRequest, &models.ErrorResponse{
			Code:    http.StatusBadRequest,
			Message: "parse id failed",
		})
		return
	}

	req := models.EFTSubscriptionRequest{
		CollectionAddress: address,
		TokenID:           id.String(),
	}

	h.service.AddEFTSubscription(r.Context(), w, r, &req)
}
