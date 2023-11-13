package handler

import (
	"context"
	"github.com/ethereum/go-ethereum/common"
	"github.com/gorilla/mux"
	"github.com/mark3d-xyz/mark3d/indexer/models"
	"math/big"
	"net/http"
)

func (h *handler) handleGetActiveTransfers(w http.ResponseWriter, r *http.Request) {
	address := mux.Vars(r)["address"]

	lastIncomingTransferId, err := parseInt64Param(r, "lastIncomingTransferId")
	if err != nil {
		sendResponse(w, err.Code, err)
		return
	}
	incomingLimit, err := parseLimitParam(r, "incomingLimit", 10, 100)
	if err != nil {
		sendResponse(w, err.Code, err)
		return
	}
	lastOutgoingTransferId, err := parseInt64Param(r, "lastOutgoingTransferId")
	if err != nil {
		sendResponse(w, err.Code, err)
		return
	}
	outgoingLimit, err := parseLimitParam(r, "outgoingLimit", 10, 100)
	if err != nil {
		sendResponse(w, err.Code, err)
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), h.cfg.RequestTimeout)
	defer cancel()

	transfers, e := h.service.GetTransfers(
		ctx,
		common.HexToAddress(address),
		lastIncomingTransferId,
		incomingLimit,
		lastOutgoingTransferId,
		outgoingLimit,
	)
	if e != nil {
		sendResponse(w, e.Code, e)
		return
	}
	sendResponse(w, 200, transfers)
}

func (h *handler) handleGetTransfersHistory(w http.ResponseWriter, r *http.Request) {
	address := mux.Vars(r)["address"]

	lastIncomingTransferId, err := parseInt64Param(r, "lastIncomingTransferId")
	if err != nil {
		sendResponse(w, err.Code, err)
		return
	}
	incomingLimit, err := parseLimitParam(r, "incomingLimit", 10, 100)
	if err != nil {
		sendResponse(w, err.Code, err)
		return
	}
	lastOutgoingTransferId, err := parseInt64Param(r, "lastOutgoingTransferId")
	if err != nil {
		sendResponse(w, err.Code, err)
		return
	}
	outgoingLimit, err := parseLimitParam(r, "outgoingLimit", 10, 100)
	if err != nil {
		sendResponse(w, err.Code, err)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), h.cfg.RequestTimeout)
	defer cancel()

	history, e := h.service.GetTransfersHistory(
		ctx,
		common.HexToAddress(address),
		lastIncomingTransferId,
		incomingLimit,
		lastOutgoingTransferId,
		outgoingLimit,
	)
	if e != nil {
		sendResponse(w, e.Code, e)
		return
	}
	sendResponse(w, 200, history)
}

func (h *handler) handleGetTransfer(w http.ResponseWriter, r *http.Request) {
	address := mux.Vars(r)["address"]
	id, ok := big.NewInt(0).SetString(mux.Vars(r)["id"], 10)
	if !ok {
		sendResponse(w, 400, &models.ErrorResponse{
			Code:    400,
			Detail:  "",
			Message: "parse id failed",
		})
		return
	}
	transfer, e := h.service.GetTransfer(r.Context(), common.HexToAddress(address), id)
	if e != nil {
		sendResponse(w, e.Code, e)
		return
	}
	sendResponse(w, 200, transfer)
}

func (h *handler) handleGetActiveTransfersV2(w http.ResponseWriter, r *http.Request) {
	address := mux.Vars(r)["address"]

	lastIncomingTransferId, err := parseInt64Param(r, "lastIncomingTransferId")
	if err != nil {
		sendResponse(w, err.Code, err)
		return
	}
	incomingLimit, err := parseLimitParam(r, "incomingLimit", 10, 100)
	if err != nil {
		sendResponse(w, err.Code, err)
		return
	}
	lastOutgoingTransferId, err := parseInt64Param(r, "lastOutgoingTransferId")
	if err != nil {
		sendResponse(w, err.Code, err)
		return
	}
	outgoingLimit, err := parseLimitParam(r, "outgoingLimit", 10, 100)
	if err != nil {
		sendResponse(w, err.Code, err)
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), h.cfg.RequestTimeout)
	defer cancel()
	tokens, e := h.service.GetTransfersV2(
		ctx,
		common.HexToAddress(address),
		lastIncomingTransferId,
		incomingLimit,
		lastOutgoingTransferId,
		outgoingLimit,
	)
	if e != nil {
		sendResponse(w, e.Code, e)
		return
	}
	sendResponse(w, 200, tokens)
}

func (h *handler) handleGetTransfersHistoryV2(w http.ResponseWriter, r *http.Request) {
	address := mux.Vars(r)["address"]

	lastIncomingTransferId, err := parseInt64Param(r, "lastIncomingTransferId")
	if err != nil {
		sendResponse(w, err.Code, err)
		return
	}
	incomingLimit, err := parseLimitParam(r, "incomingLimit", 10, 100)
	if err != nil {
		sendResponse(w, err.Code, err)
		return
	}
	lastOutgoingTransferId, err := parseInt64Param(r, "lastOutgoingTransferId")
	if err != nil {
		sendResponse(w, err.Code, err)
		return
	}
	outgoingLimit, err := parseLimitParam(r, "outgoingLimit", 10, 100)
	if err != nil {
		sendResponse(w, err.Code, err)
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), h.cfg.RequestTimeout)
	defer cancel()

	res, e := h.service.GetTransfersHistoryV2(
		ctx,
		common.HexToAddress(address),
		lastIncomingTransferId,
		incomingLimit,
		lastOutgoingTransferId,
		outgoingLimit,
	)
	if e != nil {
		sendResponse(w, e.Code, e)
		return
	}
	sendResponse(w, 200, res)
}

func (h *handler) handleGetTransferV2(w http.ResponseWriter, r *http.Request) {
	address := mux.Vars(r)["address"]
	id, ok := big.NewInt(0).SetString(mux.Vars(r)["id"], 10)
	if !ok {
		sendResponse(w, 400, &models.ErrorResponse{
			Code:    400,
			Detail:  "",
			Message: "parse id failed",
		})
		return
	}
	transfer, e := h.service.GetTransferV2(r.Context(), common.HexToAddress(address), id)
	if e != nil {
		sendResponse(w, e.Code, e)
		return
	}
	sendResponse(w, 200, transfer)
}
