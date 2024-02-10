import {HardhatUserConfig} from "hardhat/config";
import {HttpNetworkUserConfig} from "hardhat/types/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-dependency-compiler";
import "@matterlabs/hardhat-zksync-deploy";
import "@matterlabs/hardhat-zksync-solc";
import "@matterlabs/hardhat-zksync-verify";
import fs from "fs";

const networks = [
  "mumbai",
  "test-zksync",
  "main-zksync",
  "calibration",
  "filecoin",
  "test-opbnb",
  "scroll",
  "test-scroll"
] as const;
type Network = typeof networks[number];
const accounts: Map<Network, string[]> = new Map();

for (let name of networks) {
  const fName = `.${name}-secret`;
  if (fs.existsSync(fName)) {
    accounts.set(name, fs.readFileSync(fName).toString().trim().split("\n"));
  }
}

const mumbaiConfig: HttpNetworkUserConfig = {
  url: "https://matic-mumbai.chainstacklabs.com/",
  chainId: 80001,
  accounts: accounts.get("mumbai"),
};
if (process.env.POLYGON_QUIKNODE_URL) {
  mumbaiConfig.url = process.env.POLYGON_QUIKNODE_URL;
}
const calibrationConfig: HttpNetworkUserConfig = {
  url: "https://filecoin-calibration.chainup.net/rpc/v1",
  chainId: 314159,
  accounts: accounts.get("calibration"),
  timeout: 1000000000
};
const zksyncConfig = {
  url: "https://mainnet.era.zksync.io",
  accounts: accounts.get("main-zksync"),
  zksync: true,
  ethNetwork: "mainnet",
  verifyURL: "https://zksync2-mainnet-explorer.zksync.io/contract_verification",
  timeout: 1000000000,
};
const testnetZksyncConfig = {
  zksync: true,
  url: "https://testnet.era.zksync.dev",
  accounts: accounts.get("test-zksync"),
  ethNetwork: "goerli",
  verifyURL: "https://zksync2-testnet-explorer.zksync.dev/contract_verification",
  timeout: 1000000000,
};
const scrollConfig: HttpNetworkUserConfig = {
  url: "https://rpc.scroll.io/",
  chainId: 534352,
  accounts: accounts.get("scroll"),
  timeout: 1000000000
}
const testnetScrollConfig: HttpNetworkUserConfig = {
  url: "https://sepolia-rpc.scroll.io/",
  chainId: 534351,
  accounts: accounts.get("test-scroll"),
  timeout: 1000000000
}
const filecoinConfig: HttpNetworkUserConfig = {
  url: "https://rpc.ankr.com/filecoin",
  chainId: 314,
  accounts: accounts.get("filecoin"),
  timeout: 1000000000
}
const testnetOpbnbConfig: HttpNetworkUserConfig = {
  url: "https://opbnb-testnet-rpc.bnbchain.org",
  chainId: 5611,
  accounts: accounts.get("test-opbnb"),
  timeout: 1000000000
}

switch (process.env.HARDHAT_NETWORK!) {
  case "mumbai":
    console.log("mumbai cfg:", mumbaiConfig);
    break;
  case "filecoin":
    console.log("mainnet cfg:", filecoinConfig);
    break;
  case "calibration":
    console.log("calibration cfg:", calibrationConfig);
    break;
  case "zksync":
    console.log("zksync cfg:", zksyncConfig);
    break;
  case "testnetZksync":
    console.log("zksync testnet cfg:", testnetZksyncConfig);
    break;
  case "testnetOpbnb":
    console.log("opbnb testnet cfg:", testnetOpbnbConfig);
    break;
  case "testnetScroll":
    console.log("scroll testnet cfg:", testnetScrollConfig);
    break;
}

const config: HardhatUserConfig = {
  zksolc: {
    version: "1.3.22",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  solidity: {
    version: "0.8.23",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1,
      },
      evmVersion: "london"
    },
  },
  networks: {
    hardhat: {
      zksync: false
    },
    mumbai: mumbaiConfig,
    calibration: calibrationConfig,
    filecoin: filecoinConfig,
    testnetZksync: testnetZksyncConfig,
    zksync: zksyncConfig,
    testnetOpbnb: testnetOpbnbConfig,
    scroll: scrollConfig,
    testnetScroll: testnetScrollConfig
  },
  dependencyCompiler: {
    paths: [
      "@scroll-tech/contracts/L2/predeploys/IL1GasPriceOracle.sol"
    ]
  },
  etherscan: {
    apiKey: {
      polygon:
        process.env.MINTER_GURU_POLYGONSCAN_API_KEY !== undefined
          ? process.env.MINTER_GURU_POLYGONSCAN_API_KEY
          : "",
      polygonMumbai:
        process.env.MINTER_GURU_POLYGONSCAN_API_KEY !== undefined
          ? process.env.MINTER_GURU_POLYGONSCAN_API_KEY
          : "",
    },
  },
};

export default config;
