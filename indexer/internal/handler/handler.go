package handler

import (
	"context"
	"net/http"
	"time"

	"github.com/mark3d-xyz/mark3d/indexer/models"
	"github.com/mark3d-xyz/mark3d/indexer/pkg/jwt"
	"github.com/mark3d-xyz/mark3d/indexer/pkg/log"

	"github.com/gorilla/mux"
	"github.com/mark3d-xyz/mark3d/indexer/internal/config"
	"github.com/mark3d-xyz/mark3d/indexer/internal/service"
)

var (
	logger         = log.GetLogger()
	allowedOrigins = map[string]struct{}{
		"http://localhost:3000":      {},
		"https://filemarket.xyz":     {},
		"https://dev.filemarket.xyz": {},
		"https://galxe.com":          {},
	}
)

type Handler interface {
	Init() http.Handler
}

type handler struct {
	cfg     *config.HandlerConfig
	service service.Service
}

func NewHandler(
	cfg *config.HandlerConfig,
	service service.Service,
) Handler {
	return &handler{
		cfg:     cfg,
		service: service,
	}
}

func (h *handler) Init() http.Handler {
	router := mux.NewRouter()

	router.HandleFunc("/auth/message", h.handleGetAuthMessage)
	router.HandleFunc("/auth/by_signature", h.handleAuthBySignature)
	router.Handle("/auth/refresh", h.headerAuthCtxMiddleware()(http.HandlerFunc(h.handleRefresh)))
	router.Handle("/auth/logout", h.headerAuthCtxMiddleware()(http.HandlerFunc(h.handleLogout)))
	router.Handle("/auth/full_logout", h.headerAuthCtxMiddleware()(http.HandlerFunc(h.handleFullLogout)))
	router.Handle("/auth/check_auth", h.headerAuthCtxMiddleware()(http.HandlerFunc(h.handleCheckAuth)))

	router.HandleFunc("/collections/file-bunnies/whitelist/{rarity}/sign/{address:0x[0-9a-f-A-F]{40}}", h.handleGetWhitelistSignature)
	router.HandleFunc("/collections/file-bunnies/whitelist/{address:0x[0-9a-f-A-F]{40}}", h.handleGetAddressInWhitelist)
	router.HandleFunc("/collections/full/public", h.handleGetFullPublicCollection)
	router.HandleFunc("/collections/full/file-bunnies", h.handleGetFullFileBunniesCollection)
	router.HandleFunc("/collections/full/{address:0x[0-9a-f-A-F]{40}}", h.handleGetFullCollection)
	router.Handle("/collections/profile/update", h.headerAuthMiddleware(jwt.PurposeAccess)(http.HandlerFunc(h.handleUpdateCollectionProfile)))
	router.HandleFunc("/collections/{address:0x[0-9a-f-A-F]{40}}", h.handleGetCollection)
	router.HandleFunc("/collections", h.handleGetCollections)

	router.HandleFunc("/tokens/file-bunnies/to_autosell", h.handleGetFileBunniesTokensForAutosell)
	router.HandleFunc("/tokens/{address:0x[0-9a-f-A-F]{40}}/{id:[0-9]+}/encrypted_password", h.handleGetTokenEncryptedPassword)
	router.HandleFunc("/tokens/{address:0x[0-9a-f-A-F]{40}}/{id:[0-9]+}", h.handleGetToken)
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

	router.Handle("/report/collection", h.headerAuthMiddleware(jwt.PurposeAccess)(http.HandlerFunc(h.handleReportCollection)))
	router.Handle("/report/token", h.headerAuthMiddleware(jwt.PurposeAccess)(http.HandlerFunc(h.handleReportToken)))

	router.Handle("/profile/update", h.headerAuthCtxMiddleware()(http.HandlerFunc(h.handleUpdateUserProfile)))
	router.Handle("/profile/set_email", h.headerAuthCtxMiddleware()(http.HandlerFunc(h.handleSetEmail)))
	router.HandleFunc("/profile/verify_email", h.handleVerifyEmail)
	router.HandleFunc("/profile/email/exists", h.handleProfileEmailExists)
	router.HandleFunc("/profile/name/exists", h.handleProfileNameExists)
	router.HandleFunc("/profile/username/exists", h.handleProfileUsernameExists)
	router.HandleFunc("/profile/{identification}", h.handleGetUserProfile)

	router.HandleFunc("/sequencer/acquire/{address:0x[0-9a-f-A-F]{40}}", h.handleSequencerAcquire)
	router.HandleFunc("/currency/conversion_rate", h.handleGetCurrencyConversionRate)
	router.HandleFunc("/healthcheck", h.handleHealthCheck)
	router.HandleFunc("/ws/subscribe/block_number", h.subscribeToBlockNumber)
	router.HandleFunc("/ws/subscribe/eft/{address:0x[0-9a-f-A-F]{40}}/{id:[0-9]+}", h.subscribeToEFT)
	router.HandleFunc("/server_time", h.handleServerTime)

	router.HandleFunc("/campaigns/likes", h.handleCampaignsLikes)

	router.Use(h.corsMiddleware)

	return router
}

func (h *handler) corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if _, ok := allowedOrigins[origin]; ok {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			w.Header().Set("Access-Control-Allow-Headers", "Accept, Accept-Language, Content-Language, Content-Type, Authorization, X-Requested-With, X-CSRF-Token, X-API-KEY")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS, CONNECT, TRACE")
			next.ServeHTTP(w, r)
		}
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

func (h *handler) handleGetCurrencyConversionRate(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), h.cfg.RequestTimeout)
	defer cancel()
	response, err := h.service.GetCurrencyConversionRate(ctx, "USD")
	if err != nil {
		sendResponse(w, err.Code, err)
		return
	}
	sendResponse(w, 200, response)
}

func (h *handler) handleServerTime(w http.ResponseWriter, r *http.Request) {
	res := models.ServerTimeResponse{
		ServerTime: time.Now().UnixMilli(),
	}
	sendResponse(w, 200, res)
}
