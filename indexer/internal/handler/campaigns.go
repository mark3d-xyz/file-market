package handler

import (
	"context"
	"net/http"

	"github.com/ethereum/go-ethereum/common"
)

func (h *handler) handleCampaignsLikes(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), h.cfg.RequestTimeout)
	defer cancel()

	from := r.URL.Query().Get("address")
	if from == "" {
		sendResponse(w, http.StatusBadRequest, struct{}{})
		return
	}
	res, err := h.service.GetAccountLikeCount(ctx, common.HexToAddress(from))
	if err != nil {
		sendResponse(w, err.Code, err)
		return
	}
	sendResponse(w, 200, res)
}

func (h *handler) handleCampaignsTokens(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), h.cfg.RequestTimeout)
	defer cancel()

	from := r.URL.Query().Get("address")
	if from == "" {
		sendResponse(w, http.StatusBadRequest, struct{}{})
		return
	}
	res, err := h.service.GetAccountTokens(ctx, common.HexToAddress(from))
	if err != nil {
		sendResponse(w, err.Code, err)
		return
	}
	sendResponse(w, 200, res)
}

func (h *handler) handleScrollQuestLikes(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), h.cfg.RequestTimeout)
	defer cancel()

	from := r.URL.Query().Get("address")
	if from == "" {
		sendResponse(w, http.StatusBadRequest, struct{}{})
		return
	}
	res := h.service.GetScrollQuestAccountLikeCount(ctx, common.HexToAddress(from))
	sendResponse(w, 200, res)
}

func (h *handler) handleScrollQuestTokens(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), h.cfg.RequestTimeout)
	defer cancel()

	from := r.URL.Query().Get("address")
	if from == "" {
		sendResponse(w, http.StatusBadRequest, struct{}{})
		return
	}
	res := h.service.GetScrollQuestAccountTokens(ctx, common.HexToAddress(from))
	sendResponse(w, 200, res)
}
