package main

import (
	"flag"
	"fmt"
	"log"
	"math/big"

	"github.com/ethereum/go-ethereum/common"
	"github.com/mark3d-xyz/mark3d/indexer/contracts/access_token"
	ethclient2 "github.com/mark3d-xyz/mark3d/indexer/pkg/ethclient"
)

func main() {
	var address, url string
	flag.StringVar(&address, "address", "", "")
	flag.StringVar(&url, "url", "", "")
	flag.Parse()

	c, err := ethclient2.NewEthClient([]string{url}, "main")
	if err != nil {
		log.Panicln(err)
	}
	accessTokenInstance, err := access_token.NewMark3dAccessTokenV2(common.HexToAddress(address), c.Clients()[0])
	if err != nil {
		log.Panicln(err)
	}
	fmt.Println(accessTokenInstance.TokenURI(nil, big.NewInt(0)))
}
