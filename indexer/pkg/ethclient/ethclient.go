package ethclient

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"math/big"
	"strings"
	"time"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/common/hexutil"
	eth_types "github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/ethereum/go-ethereum/rpc"
	"github.com/mark3d-xyz/mark3d/indexer/pkg/types"
	"github.com/sony/gobreaker"
	"golang.org/x/exp/slices"
)

type EthClient interface {
	BlockByNumber(ctx context.Context, number *big.Int) (types.Block, error)
	GetLatestBlockNumber(ctx context.Context) (*big.Int, error)
	GetDefaultTransactionByHash(ctx context.Context, hash common.Hash) (*types.DefaultTransaction, error)
	TransactionReceipt(ctx context.Context, txHash common.Hash) (*eth_types.Receipt, error)
	Clients() []*ethclient.Client
	Shutdown()
}

type ethClient struct {
	urls           []string
	rpcClients     []*rpc.Client
	ethClients     []*ethclient.Client
	breakers       []*gobreaker.CircuitBreaker
	latestFetched  *big.Int
	breakThreshold *big.Int
	isZk           bool
}

func NewEthClient(urls []string) (EthClient, error) {
	res := &ethClient{
		urls:           urls,
		breakThreshold: big.NewInt(1),
	}

	if slices.Contains(urls, "https://testnet.era.zksync.dev") ||
		slices.Contains(urls, "https://mainnet.era.zksync.io") ||
		slices.Contains(urls, "https://nd-223-015-392.p2pify.com/80abe9200081e09a2ac7f6c101c9dd1e") {
		res.isZk = true
	}

	res.rpcClients = make([]*rpc.Client, len(urls))
	res.ethClients = make([]*ethclient.Client, len(urls))
	res.breakers = make([]*gobreaker.CircuitBreaker, len(urls))
	var err error
	for i, u := range urls {
		res.rpcClients[i], err = rpc.Dial(u)
		if err != nil {
			return nil, err
		}
		res.ethClients[i], err = ethclient.Dial(u)
		if err != nil {
			return nil, err
		}
		res.breakers[i] = gobreaker.NewCircuitBreaker(gobreaker.Settings{
			Name:     fmt.Sprintf("rpc %d %s", i, u),
			Interval: time.Minute,
			Timeout:  time.Minute,
			ReadyToTrip: func(counts gobreaker.Counts) bool {
				return counts.ConsecutiveFailures > 5
			},
		})
	}
	return res, nil
}

func (e *ethClient) BlockByNumber(ctx context.Context, number *big.Int) (types.Block, error) {
	clients := e.Clients()
	if len(clients) == 0 {
		return nil, fmt.Errorf("rpc broken")
	}

	var err error
	var block types.Block
	if e.isZk {
		for i, c := range e.RpcClients() {
			block, err = getZkBlock(ctx, c, hexutil.EncodeBig(number), true)
			if err != nil {
				log.Println("get pending zk block failed", number.String(), e.urls[i], err)
				if strings.Contains(err.Error(), "want 512 for Bloom") {
					return nil, err
				}
			} else {
				return block, nil
			}
		}
	} else {
		for i, c := range clients {
			var b *eth_types.Block
			b, err = c.BlockByNumber(ctx, number)
			if err != nil {
				log.Println("get pending block failed", number.String(), e.urls[i], err)
				if strings.Contains(err.Error(), "want 512 for Bloom") {
					return nil, err
				}
			} else {
				txs := make([]types.Transaction, len(b.Transactions()))
				for i, t := range b.Transactions() {
					txs[i] = t
				}
				block = types.NewEthBlock(
					b.Hash(),
					b.Number(),
					b.Time(),
					txs,
				)
				return block, nil
			}
		}
	}
	return nil, err
}

func (e *ethClient) GetLatestBlockNumber(ctx context.Context) (*big.Int, error) {
	var (
		err error
		max *big.Int
	)
	for i, c := range e.rpcClients {
		var res interface{}
		res, err = e.breakers[i].Execute(func() (interface{}, error) {
			var raw json.RawMessage
			err = c.CallContext(ctx, &raw, "eth_blockNumber")
			if err != nil {
				// era returns HTML on 502 response
				if strings.HasPrefix(err.Error(), "502 Bad Gateway:") {
					err = errors.New("502 Bad Gateway")
				}
				return nil, fmt.Errorf("get block error %s %w", e.urls[i], err)
			} else if len(raw) != 0 {
				res, err := hexutil.DecodeBig(strings.Trim(string(raw), "\""))
				if err != nil {
					return nil, fmt.Errorf("decode block number failed %s %w", e.urls[i], err)
				}
				if e.latestFetched != nil && big.NewInt(0).Sub(e.latestFetched, res).Cmp(e.breakThreshold) >= 0 {
					return nil, fmt.Errorf("rpc out of sync %s %s %s", e.urls[i], e.latestFetched, res)
				}
				return res, nil
			} else {
				return nil, fmt.Errorf("empty response")
			}
		})
		if err != nil {
			log.Println("get block error", e.urls[i], err)
			continue
		}
		if max == nil || res.(*big.Int).Cmp(max) == 1 {
			max = res.(*big.Int)
		}
	}
	if max != nil {
		e.latestFetched = max
		return max, nil
	}
	return nil, err
}

func (e *ethClient) TransactionReceipt(ctx context.Context, txHash common.Hash) (*eth_types.Receipt, error) {
	var err error
	clients := e.Clients()
	if len(clients) == 0 {
		return nil, fmt.Errorf("rpc broken")
	}
	for i, c := range clients {
		var rec *eth_types.Receipt
		rec, err = c.TransactionReceipt(ctx, txHash)
		if err != nil {
			log.Println("get receipt failed", txHash.String(), e.urls[i], err)
		} else {
			return rec, nil
		}
	}
	return nil, err
}

func (e *ethClient) Clients() []*ethclient.Client {
	var res []*ethclient.Client
	for i, c := range e.ethClients {
		if state := e.breakers[i].State(); state == gobreaker.StateClosed || state == gobreaker.StateHalfOpen {
			res = append(res, c)
		}
	}
	return res
}

func (e *ethClient) RpcClients() []*rpc.Client {
	var res []*rpc.Client
	for i, c := range e.rpcClients {
		if state := e.breakers[i].State(); state == gobreaker.StateClosed || state == gobreaker.StateHalfOpen {
			res = append(res, c)
		}
	}
	return res
}

func (e *ethClient) Shutdown() {
	for _, c := range e.ethClients {
		c.Close()
	}
	for _, c := range e.rpcClients {
		c.Close()
	}
}

var body struct {
	Hash         common.Hash                 `json:"hash"`
	Number       string                      `json:"number"`
	Time         string                      `json:"timestamp"`
	Transactions []*types.DefaultTransaction `json:"transactions"`
}

// // Zk specific staff
func getZkBlock(ctx context.Context, c *rpc.Client, args ...any) (types.Block, error) {
	var raw json.RawMessage
	if err := c.CallContext(ctx, &raw, "eth_getBlockByNumber", args...); err != nil {
		log.Println("get block error", err)
		return nil, err
	} else if len(raw) == 0 {
		return nil, ethereum.NotFound
	}

	if err := json.Unmarshal(raw, &body); err != nil {
		return nil, fmt.Errorf("failed to unmarshal body: %w", err)
	}

	txs := make([]types.Transaction, len(body.Transactions))
	for i, tx := range body.Transactions {
		txs[i] = tx
	}

	timestamp, err := hexutil.DecodeUint64(body.Time)
	if err != nil {
		return nil, err
	}
	number, err := hexutil.DecodeBig(body.Number)
	if err != nil {
		return nil, err
	}

	block := types.NewEthBlock(
		body.Hash,
		number,
		timestamp,
		txs,
	)

	return block, nil
}

func (e *ethClient) GetDefaultTransactionByHash(ctx context.Context, hash common.Hash) (*types.DefaultTransaction, error) {
	var err error
	for _, c := range e.rpcClients {
		var raw json.RawMessage
		if err = c.CallContext(ctx, &raw, "eth_getTransactionByHash", hash.Hex()); err != nil {
			log.Println("get tx error", err)
			continue
		} else if len(raw) == 0 {
			err = ethereum.NotFound
			continue
		}

		var tx *types.DefaultTransaction
		if err = json.Unmarshal(raw, &tx); err != nil {
			err = fmt.Errorf("failed to unmarshal tx: %w", err)
			continue
		}
		return tx, nil
	}
	return nil, err
}
