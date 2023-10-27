package types

import (
	"encoding/json"
	"github.com/ethereum/go-ethereum/common"
	"math/big"
	"strconv"
	"strings"
)

type AutosellTokenInfo struct {
	TokenId   string
	MetaUri   string
	PublicKey string
}

type Block interface {
	HashProvider

	Number() *big.Int
	Time() uint64
	Transactions() []Transaction
}

type EthBlock struct {
	hash         common.Hash
	number       *big.Int
	timestamp    uint64
	transactions []Transaction
}

func NewEthBlock(hash common.Hash, number *big.Int, timestamp uint64, transactions []Transaction) Block {
	return &EthBlock{
		hash:         hash,
		number:       number,
		timestamp:    timestamp,
		transactions: transactions[:],
	}
}

func (b *EthBlock) Hash() common.Hash {
	return b.hash
}

func (b *EthBlock) Number() *big.Int {
	return b.number
}

func (b *EthBlock) Time() uint64 {
	return b.timestamp
}

func (b *EthBlock) Transactions() []Transaction {
	return b.transactions
}

type Transaction interface {
	HashProvider

	To() *common.Address
	ChainId() *big.Int
}

type DefaultTransaction struct {
	hash    common.Hash
	chainId *big.Int
	to      *common.Address
	from    common.Address
}

func NewDefaultTransaction(hash common.Hash, to *common.Address, from *common.Address, chainId *big.Int) Transaction {
	fromAddr := common.HexToAddress("0x0")
	if from != nil {
		fromAddr = *from
	}

	return &DefaultTransaction{
		hash:    hash,
		to:      to,
		from:    fromAddr,
		chainId: chainId,
	}
}

func (t *DefaultTransaction) From() common.Address {
	return t.from
}

func (t *DefaultTransaction) Hash() common.Hash {
	return t.hash
}

func (t *DefaultTransaction) To() *common.Address {
	return t.to
}

func (t *DefaultTransaction) ChainId() *big.Int {
	return t.chainId
}

type chainIdType struct {
	Int *int64
	Hex *string
}

func (c *chainIdType) UnmarshalJSON(input []byte) error {
	if input[0] == '"' {
		var hexValue string
		if err := json.Unmarshal(input, &hexValue); err != nil {
			return err
		}
		c.Hex = &hexValue
		return nil
	}
	var intValue int64
	if err := json.Unmarshal(input, &intValue); err != nil {
		return err
	}
	c.Int = &intValue
	return nil
}

// UnmarshalJSON overrides json.Unmarshaler
func (t *DefaultTransaction) UnmarshalJSON(input []byte) error {
	var dec struct {
		Hash    common.Hash     `json:"hash"`
		To      *common.Address `json:"to"`
		ChainId chainIdType     `json:"chainId"`
		From    common.Address  `json:"from"`
	}

	if err := json.Unmarshal(input, &dec); err != nil {
		return err
	}

	t.to = dec.To
	t.hash = dec.Hash
	t.from = dec.From

	if dec.ChainId.Int != nil {
		t.chainId = big.NewInt(*dec.ChainId.Int)
	} else if dec.ChainId.Hex != nil {
		trimmedHex := strings.TrimPrefix(*dec.ChainId.Hex, "0x")
		chainIdInt, err := strconv.ParseInt(trimmedHex, 16, 64)
		if err != nil {
			return err
		}
		t.chainId = big.NewInt(chainIdInt)
	}

	return nil
}

type HashProvider interface {
	Hash() common.Hash
}
