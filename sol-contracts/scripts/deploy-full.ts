import * as hre from "hardhat";
import {ethers} from "hardhat";
import {
  FileBunniesCollection__factory,
  FilemarketCollectionV2__factory,
  FilemarketExchangeV2__factory,
  FraudDeciderWeb2V2__factory,
  LikeEmitter__factory,
  Mark3dAccessTokenV2__factory,
  PublicCollection__factory,
} from "../typechain-types";
import "@nomicfoundation/hardhat-chai-matchers";
import {Deployer} from "@matterlabs/hardhat-zksync-deploy";
import {Contract, Wallet} from "zksync-web3";
import {BigNumber, ContractFactory, Overrides} from "ethers";
import {TransactionRequest} from "@ethersproject/providers";
import {serialize, UnsignedTransaction} from "@ethersproject/transactions";
import {formatEther} from "ethers/lib/utils";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";

const ORACLE_PRECOMPILE_ADDRESS = "0x5300000000000000000000000000000000000002";

const util = require("util");
const request = util.promisify(require("request"));

const genRanHex = (size: number) =>
  [...Array(size)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("");

async function deployZkContract(
  wallet: Wallet,
  contractName: string,
  args: any[],
  shouldVerify: boolean
): Promise<Contract> {
  const deployer = new Deployer(hre, wallet);
  const artifact = await deployer.loadArtifact(contractName);
  let deploymentFee = await deployer.estimateDeployFee(artifact, args);
  console.log(
    contractName,
    " fee: ",
    ethers.utils.formatEther(deploymentFee.toString()),
    " ETH"
  );

  const contract = await deployer.deploy(artifact, args);
  await new Promise((resolve) => setTimeout(resolve, 2000));

  if (shouldVerify) {
    console.log(
      await hre.run("verify:verify", {
        address: contract.address,
        contract: contractName,
        constructorArguments: args,
        bytecode: artifact.bytecode,
      })
    );
  }

  return contract;
}

async function callRpc(method: string, params: string) {
  const network = process.env.HARDHAT_NETWORK;
  let url: string;
  if (network === "filecoin") {
    url = "https://rpc.ankr.com/filecoin";
  } else {
    url = "https://filecoin-calibration.chainup.net/rpc/v1";
  }
  const options = {
    method: "POST",
    url: url,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: method,
      params: [],
      id: 1,
    }),
  };
  console.log(options.body);
  const res = await request(options);
  return JSON.parse(res.body).result;
}

async function main() {
  const shouldVerify = false;

  let accounts = await ethers.getSigners();
  if (accounts.length < 1) {
    console.error("accounts is empty")
    process.exit(1);
  }
  console.log(accounts);

  if (!process.env.HARDHAT_NETWORK) {
    console.log("HARDHAT_NETWORK is not specified");
    process.exit(1);
  }
  const network = process.env.HARDHAT_NETWORK!
  const isZksync = network.toLowerCase().includes("zksync");

  if (isZksync) {
    const wallet = network === "zksync" ?
      // @ts-ignore
      new Wallet(hre.config.networks.zksync.accounts[0]) :
      // @ts-ignore
      new Wallet(hre.config.networks.testnetZksync.accounts[0]);

    const likeEmitter = await deployZkContract(
      wallet,
      "contracts/LikeEmitter.sol:LikeEmitter",
      [],
      shouldVerify
    );
    console.log("likeEmitter address: ", likeEmitter.address);
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const collectionToClone = await deployZkContract(
      wallet,
      "contracts/ZkFilemarketCollectionV2.sol:FilemarketCollectionV2",
      [],
      shouldVerify
    );
    console.log("collectionToClone address: ", collectionToClone.address);

    const fraudDecider = await deployZkContract(
      wallet,
      "FraudDeciderWeb2V2",
      [],
      shouldVerify
    );
    console.log("fraudDecider address: ", fraudDecider.address);
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const globalSalt = genRanHex(128);
    console.log("global salt", globalSalt);
    const accessToken = await deployZkContract(
      wallet,
      "contracts/ZkMark3dAccessTokenV2.sol:Mark3dAccessTokenV2",
      [
        "FileMarket Access Token",
        "FileMarket",
        "",
        "0x" + globalSalt,
        collectionToClone.address,
        true,
        fraudDecider.address,
      ],
      shouldVerify
    );
    console.log("accessToken address: ", accessToken.address);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const exchange = await deployZkContract(
      wallet,
      "contracts/ZkFilemarketExchangeV2.sol:FilemarketExchangeV2",
      [],
      shouldVerify
    );
    console.log("exchange address: ", exchange.address);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const publicCollection = await deployZkContract(
      wallet,
      "contracts/ZkPublicCollection.sol:PublicCollection",
      [
        "FileMarket",
        "FMRT",
        "ipfs://QmZm4oLQoyXZLJzioYCjGtGXGHqsscKvWJmWXMVhTXZtc9",
        accounts[0].address,
        accounts[0].address,
        "0x",
        fraudDecider.address,
        true,
      ],
      shouldVerify
    );
    console.log("public collection address: ", publicCollection.address);
  } else {
    const accessTokenFactory = new Mark3dAccessTokenV2__factory(accounts[0]);
    const fraudDeciderFactory = new FraudDeciderWeb2V2__factory(accounts[0]);
    const collectionFactory = new FilemarketCollectionV2__factory(accounts[0]);
    const publicCollectionFactory = new PublicCollection__factory(accounts[0]);
    const fileBunniesCollectionFactory = new FileBunniesCollection__factory(accounts[0]);
    const exchangeFactory = new FilemarketExchangeV2__factory(accounts[0]);
    const likeEmitterFactory = new LikeEmitter__factory(accounts[0])

    // Filecoin requires eth_maxPriorityFeePerGas
    // opBNB requires gasPrice
    // Scroll requires both gasPrice and gasLimit
    const isFilecoin = process.env.HARDHAT_NETWORK!.toLowerCase()
        .includes("filecoin") ||
      process.env.HARDHAT_NETWORK!.toLowerCase()
        .includes("calibration");
    const isScroll = process.env.HARDHAT_NETWORK!.toLowerCase().includes("scroll");

    let overrides: Overrides = isFilecoin ? {
      maxPriorityFeePerGas: await callRpc("eth_maxPriorityFeePerGas", "")
    } : {
      gasPrice: await accounts[0].provider!.getGasPrice(),
    };
    console.log(overrides);


    ////
    // LikeEmitter
    {
      const likeFee = hre.ethers.utils.parseEther("0.00041"); // 0.1$
      if (isScroll) {
        overrides.gasLimit = getScrollDetails(likeEmitterFactory, [likeFee], overrides, accounts);
      }
      const likeEmitter = await likeEmitterFactory.deploy(likeFee, overrides);
      console.log("likeEmitter address: ", likeEmitter.address);
    }

    ////
    // Collection
    if (isScroll) {
      overrides.gasLimit = getScrollDetails(collectionFactory, [], overrides, accounts);
    }
    const collectionToClone = await collectionFactory.deploy(overrides);
    console.log("collection address: ", collectionToClone.address);

    ////
    // Fraud
    if (isScroll) {
      overrides.gasLimit = getScrollDetails(fraudDeciderFactory, [], overrides, accounts);
    }
    let fraudDecider = await fraudDeciderFactory.deploy(overrides);
    console.log("fraud decider address: ", fraudDecider.address);


    ////
    // Access
    {
      const globalSalt = genRanHex(128);
      console.log("global salt", globalSalt);

      const name = "FileMarket Access Token";
      const symbol = "FileMarket";
      const _contractMetaUri = "";
      const _globalSalt = "0x" + globalSalt;
      const _implementation = collectionToClone.address;
      const _fraudLateDecisionEnabled = true;
      const _fraudDecider = fraudDecider.address;
      if (isScroll) {
        overrides.gasLimit = getScrollDetails(
          accessTokenFactory,
          [
            name,
            symbol,
            _contractMetaUri,
            _globalSalt,
            _implementation,
            _fraudLateDecisionEnabled,
            _fraudDecider,
          ],
          overrides,
          accounts,
        );
      }
      let accessToken = await accessTokenFactory.deploy(
        name,
        symbol,
        _contractMetaUri,
        _globalSalt,
        _implementation,
        _fraudLateDecisionEnabled,
        _fraudDecider,
        overrides,
      );
      console.log("access token address: ", accessToken.address);
    }

    ////
    // PublicCollection
    {
      const name = "FileMarket";
      const symbol = "FMRT";
      const _contractMetaUri = "ipfs://QmZm4oLQoyXZLJzioYCjGtGXGHqsscKvWJmWXMVhTXZtc9";
      const _owner = await accounts[0].getAddress();
      const _royaltyReceiver = await accounts[0].getAddress();
      const _data = "0x";
      const _fraudDecider = fraudDecider.address;
      const _fraudLateDecisionEnabled = true;
      if (isScroll) {
        overrides.gasLimit = getScrollDetails(
          publicCollectionFactory,
          [
            name,
            symbol,
            _contractMetaUri,
            _owner,
            _royaltyReceiver,
            _data,
            _fraudDecider,
            _fraudLateDecisionEnabled,
          ],
          overrides,
          accounts,
        );
      }
      let publicCollection = await publicCollectionFactory.deploy(
        name,
        symbol,
        _contractMetaUri,
        _owner,
        _royaltyReceiver,
        _data,
        _fraudDecider,
        _fraudLateDecisionEnabled,
        overrides
      );
      console.log("public collection address: ", publicCollection.address);
    }

    ////
    // Exchange
    {
      if (isScroll) {
        overrides.gasLimit = getScrollDetails(exchangeFactory, [], overrides, accounts)
      }
      let exchange = await exchangeFactory.deploy(overrides);
      console.log("exchange address: ", exchange.address);
    }

    ////
    // FileBunnies
    if (isFilecoin) {
      let fileBunniesCollection = await fileBunniesCollectionFactory.deploy(
        "FileBunnies",
        "FBNS",
        "ipfs://QmQUr4ApevgdEKCbE7W4YHXCCF7JNAVzX2BgZTntaAGQzC",
        accounts[0].getAddress(),
        accounts[0].getAddress(),
        accounts[0].getAddress(),
        accounts[0].getAddress(),
        "0x",
        fraudDecider.address,
        true,
        overrides
      );
      console.log("file bunnies collection address: ", fileBunniesCollection.address);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


export async function estimateL1Fee(gasOraclePrecompileAddress: string, unsignedSerializedTransaction: string): Promise<BigNumber> {
  const l1GasOracle = await ethers.getContractAt("IL1GasPriceOracle", gasOraclePrecompileAddress);

  return l1GasOracle.getL1Fee(unsignedSerializedTransaction);
}

export async function estimateL2Fee(tx: TransactionRequest): Promise<BigNumber> {
  const gasToUse = await hre.ethers.provider.estimateGas(tx);
  const feeData = await hre.ethers.provider.getFeeData();
  const gasPrice = feeData.gasPrice;

  if (!gasPrice) {
    throw new Error("There was an error estimating L2 fee");
  }

  return gasToUse.mul(gasPrice);
}

async function getScrollDetails(contract: ContractFactory, args: any[], overrides: Overrides, accounts: SignerWithAddress[]): Promise<BigNumber> {
  const tx = contract.getDeployTransaction(...args);
  const gasLimit = await accounts[0].provider!.estimateGas(tx);
  const unsigned: UnsignedTransaction = {
    data: tx.data,
    to: tx.to,
    gasPrice: await overrides.gasPrice,
    gasLimit: gasLimit,
    value: BigNumber.from(0),
    nonce: await accounts[0].provider!.getTransactionCount(accounts[0].address)
  }
  const l1 = await estimateL1Fee(ORACLE_PRECOMPILE_ADDRESS, serialize(unsigned));
  const l2 = await estimateL2Fee(tx);
  const name = contract.constructor.name.replace("__factory", "");
  const totalFee = formatEther(l1.add(l2));
  console.log(`${name}\n\tfee: ${totalFee} ETH\n\tl1 : ${formatEther(l1)} ETH\n\tl2 : ${formatEther(l2)} ETH`);

  return gasLimit
}
