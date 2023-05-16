package handler

import (
	"context"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/mark3d-xyz/mark3d/indexer/internal/config"
	"github.com/mark3d-xyz/mark3d/indexer/internal/service"
)

type Handler interface {
	Init() http.Handler
}

type handler struct {
	cfg     *config.HandlerConfig
	service service.Service
}

func NewHandler(cfg *config.HandlerConfig, service service.Service) Handler {
	return &handler{
		cfg:     cfg,
		service: service,
	}
}

func (h *handler) Init() http.Handler {
	router := mux.NewRouter()

	router.HandleFunc("/collections/{address:0x[0-9a-f-A-F]{40}}", h.handleGetCollection)
	router.HandleFunc("/collections/full/{address:0x[0-9a-f-A-F]{40}}", h.handleGetFullCollection)
	router.HandleFunc("/collections/by_creator/{address:0x[0-9a-f-A-F]{40}}", h.handleGetCollectionsByCreator)
	router.HandleFunc("/tokens/{address:0x[0-9a-f-A-F]{40}}/{id:[0-9]+}", h.handleGetToken)
	router.HandleFunc("/tokens/{address:0x[0-9a-f-A-F]{40}}/{id:[0-9]+}/encrypted_password", h.handleGetTokenEncryptedPassword)
	router.HandleFunc("/tokens/by_collection/{address:0x[0-9a-f-A-F]{40}}", h.handleGetCollectionTokens)
	router.HandleFunc("/tokens/{address:0x[0-9a-f-A-F]{40}}", h.handleGetTokens)
	router.HandleFunc("/transfers/{address:0x[0-9a-f-A-F]{40}}", h.handleGetActiveTransfers)
	router.HandleFunc("/transfers_history/{address:0x[0-9a-f-A-F]{40}}", h.handleGetTransfersHistory)
	router.HandleFunc("/transfers/{address:0x[0-9a-f-A-F]{40}}/{id:[0-9]+}", h.handleGetTransfer)
	router.HandleFunc("/v2/transfers/{address:0x[0-9a-f-A-F]{40}}", h.handleGetActiveTransfersV2)
	router.HandleFunc("/v2/transfers_history/{address:0x[0-9a-f-A-F]{40}}", h.handleGetTransfersHistoryV2)
	router.HandleFunc("/v2/transfers/{address:0x[0-9a-f-A-F]{40}}/{id:[0-9]+}", h.handleGetTransferV2)
	router.HandleFunc("/orders/{address:0x[0-9a-f-A-F]{40}}", h.handleGetActiveOrders)
	router.HandleFunc("/orders_history/{address:0x[0-9a-f-A-F]{40}}", h.handleGetOrdersHistory)
	router.HandleFunc("/orders/{address:0x[0-9a-f-A-F]{40}}/{id:[0-9]+}", h.handleGetOrder)
	router.HandleFunc("/orders/all_active", h.handleGetAllActiveOrders)
	router.HandleFunc("/healthcheck", h.handleHealthCheck)
	router.Use(h.corsMiddleware)

	return router
}

func (h *handler) corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", h.cfg.SwaggerHost)
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Allow-Headers", "*")
		w.Header().Set("Access-Control-Allow-Methods", "*")
		next.ServeHTTP(w, r)
	})
}

func (h *handler) handleHealthCheck(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), h.cfg.RequestTimeout)
	defer cancel()
	response, err := h.service.HealthCheck(ctx)
	if err != nil {
		sendResponse(w, err.Code, err)
		return
	}
	sendResponse(w, 200, *response)
}
