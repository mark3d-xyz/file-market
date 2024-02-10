package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/mark3d-xyz/mark3d/indexer/internal/domain"
	"github.com/mark3d-xyz/mark3d/indexer/internal/infrastructure/clients"
	"github.com/mark3d-xyz/mark3d/indexer/pkg/currencyconversion"
	"github.com/mark3d-xyz/mark3d/indexer/pkg/ethsigner"
	log2 "github.com/mark3d-xyz/mark3d/indexer/pkg/log"
	"github.com/mark3d-xyz/mark3d/indexer/pkg/mail"
	"github.com/mark3d-xyz/mark3d/indexer/pkg/sequencer"
	"github.com/mark3d-xyz/mark3d/indexer/pkg/ws"

	"github.com/go-redis/redis/v8"
	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/mark3d-xyz/mark3d/indexer/internal/config"
	"github.com/mark3d-xyz/mark3d/indexer/internal/handler"
	"github.com/mark3d-xyz/mark3d/indexer/internal/repository"
	"github.com/mark3d-xyz/mark3d/indexer/internal/server"
	"github.com/mark3d-xyz/mark3d/indexer/internal/service"
	"github.com/mark3d-xyz/mark3d/indexer/models"
	"github.com/mark3d-xyz/mark3d/indexer/pkg/ethclient"
	healthnotifier "github.com/mark3d-xyz/mark3d/indexer/pkg/health_notifier"
)

var logger = log2.GetLogger()

func main() {
	log.SetFlags(log.Ldate | log.Ltime | log.Llongfile)
	var cfgPath string
	flag.StringVar(&cfgPath, "cfg", "configs/local", "config path")
	flag.Parse()

	// initializing config, basically sets values from yml configs and env into a struct
	cfg, err := config.Init(cfgPath)
	if err != nil {
		logger.WithFields(log2.Fields{"error": err}).Fatal("failed to init config", nil)
	}

	domain.SetConfig(cfg)

	ctx := context.Background()

	pool, err := pgxpool.Connect(ctx, cfg.Postgres.PgSource())
	if err != nil {
		logger.WithFields(log2.Fields{"error": err}).Fatal("failed to connect to pg", nil)
	}
	if err := pool.Ping(ctx); err != nil {
		logger.WithFields(log2.Fields{"error": err}).Fatal("failed to ping pg", nil)
	}
	rdb := redis.NewClient(&redis.Options{
		Addr:     cfg.Redis.Addr,
		Password: cfg.Redis.Password,
	})

	client, err := ethclient.NewEthClient(cfg.Service.RpcUrls, cfg.Service.Mode)
	if err != nil {
		logger.WithFields(log2.Fields{"error": err}).Fatal("failed to init eth client", nil)
	}

	healthNotifier := &healthnotifier.TelegramHealthNotifier{
		Addr: cfg.Service.TelegramHealthNotifierAddr,
	}

	sequencerCfg := &sequencer.Config{
		KeyPrefix:          cfg.Sequencer.KeyPrefix,
		TokenIdTTL:         cfg.Sequencer.TokenIdTTL,
		CheckInterval:      cfg.Sequencer.CheckInterval,
		SwitchTokenTimeout: cfg.Sequencer.CheckInterval,
	}
	seq := sequencer.New(sequencerCfg, rdb)

	repositoryCfg := &repository.Config{
		PublicCollectionAddress:      cfg.Service.PublicCollectionAddress,
		FileBunniesCollectionAddress: cfg.Service.FileBunniesCollectionAddress,
	}

	currencyConverter := currencyconversion.NewCoinMarketCapProvider(cfg.Service.CoinMarketCapApiKey)
	cacheTTL, err := time.ParseDuration(cfg.Service.CurrencyConversionCacheTTL)
	if err != nil {
		logger.WithFields(log2.Fields{"error": err}).Fatal("failed to parse `CurrencyConversionCacheTTL` to time.Duration", nil)
	}
	currencyConverterCache := currencyconversion.NewRedisExchangeRateCache(currencyConverter, rdb, cacheTTL)

	commonSigner, err := ethsigner.NewEthSigner(cfg.Service.CommonSignerKey)
	if err != nil {
		logger.Fatal("failed to create commonSigner", log2.Fields{"error": err})
	}
	uncommonSigner, err := ethsigner.NewEthSigner(cfg.Service.UncommonSignerKey)
	if err != nil {
		logger.Fatal("failed to create uncommonSigner", log2.Fields{"error": err})
	}

	logger.Info("connecting to auth service", nil)
	authClient, err := clients.NewAuthClient(ctx, cfg.Infrastructure.AuthServerEndpoint)
	if err != nil {
		logger.Fatal("failed to dial auth server", log2.Fields{"error": err.Error()})
	}
	logger.Info("auth service connected", nil)

	mailSender := mail.NewPostmarkSender(cfg.EmailSender)
	wsPool := ws.NewWsPool()
	indexService, err := service.NewService(
		repository.NewRepository(pool, rdb, repositoryCfg),
		wsPool,
		mailSender,
		client,
		seq,
		healthNotifier,
		currencyConverterCache,
		commonSigner,
		uncommonSigner,
		authClient,
		cfg.Service,
	) // service who interact with main dependencies
	if err != nil {
		logger.WithFields(log2.Fields{"error": err}).Fatal("failed to create service", nil)
	}

	indexHandler := handler.NewHandler(cfg.Handler, indexService) // handler who interact with a service and hashManager
	router := indexHandler.Init()                                 // gorilla mux here
	srv := server.NewServer(cfg.Server, router)                   // basically http.Server with config here

	// goroutine in which server running
	go func() {
		if err = srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.WithFields(log2.Fields{"error": err}).Fatal("http server error", nil)
		}
	}()

	logger.Infof("server listening on port %d\n", cfg.Server.Port)

	// graceful shutdown here
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGTERM, syscall.SIGINT)
	go func() {
		if err := indexService.ListenBlockchain(); err != service.ErrSubFailed {
			logger.WithFields(log2.Fields{"error": err}).Fatal("ListenBlockchain failed", nil)
		}
		quit <- syscall.SIGTERM
	}()

	go func() {
		// Healthcheck every `cfg.Service.HealthCheckInterval` Seconds.
		// Send notification only if returns error or status is not Healthy
		ticker := time.NewTicker(time.Duration(cfg.Service.HealthCheckInterval) * time.Second)
	loop:
		for {
			select {
			case <-ticker.C:
				ctx := context.Background()
				resp, err := indexService.HealthCheck(ctx)
				if err != nil {
					err := healthNotifier.Notify(ctx, fmt.Sprintf("%v", err))
					if err != nil {
						logger.WithFields(log2.Fields{"error": err}).Fatal("failed to send healthcheck", nil)
					}
					return
				}
				if resp.Status != models.HealthStatusHealthy {
					err := healthNotifier.Notify(ctx, fmt.Sprintf("%v", *resp))
					if err != nil {
						logger.Error("Failed to send health notification", err, nil)
					}
				}
			case <-quit:
				ticker.Stop()
				break loop
			}
		}
	}()

	<-quit

	if err = srv.Shutdown(ctx); err != nil {
		logger.WithFields(log2.Fields{"error": err}).Fatal("failed to shutdown server", nil)
	}
	indexService.Shutdown()
	wsPool.Shutdown()
	authClient.Close()

	logger.Info("server shutdown", nil)

	if err := logger.Flush(); err != nil {
		logger.WithFields(log2.Fields{"error": err}).Fatal("failed to flush logger", nil)
	}
	pool.Close()
}
