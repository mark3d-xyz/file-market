import {ethers} from "hardhat";
import {
  FilemarketCollectionV2__factory,
  FilemarketExchangeV2__factory,
  FraudDeciderWeb2V2__factory,
  LikeEmitter__factory,
  Mark3dAccessTokenV2__factory,
  PublicCollection__factory,
} from "../typechain-types";
import "@nomicfoundation/hardhat-chai-matchers";
import {Overrides} from "ethers";
import {getScrollDetails, isScroll} from "./util";

const genRanHex = (size: number) =>
  [...Array(size)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("");


async function main() {
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

  if (!isScroll) {
    console.log("Not scroll");
    process.exit(1);
  }

  const accessTokenFactory = new Mark3dAccessTokenV2__factory(accounts[0]);
  const fraudDeciderFactory = new FraudDeciderWeb2V2__factory(accounts[0]);
  const collectionFactory = new FilemarketCollectionV2__factory(accounts[0]);
  const publicCollectionFactory = new PublicCollection__factory(accounts[0]);
  const exchangeFactory = new FilemarketExchangeV2__factory(accounts[0]);
  const likeEmitterFactory = new LikeEmitter__factory(accounts[0])

  let overrides: Overrides = {
    gasPrice: await accounts[0].provider!.getGasPrice(),
  };
  console.log(overrides);

  ////
  // LikeEmitter
  getScrollDetails(likeEmitterFactory, ["123123123"], overrides, accounts);

  ////
  // Collection
  getScrollDetails(collectionFactory, [], overrides, accounts);

  ////
  // Fraud
  getScrollDetails(fraudDeciderFactory, [], overrides, accounts);

  ////
  // Access
  getScrollDetails(
    accessTokenFactory,
    [
      "FileMarket Access Token",
      "FileMarket",
      "",
      "0x" + genRanHex(128),
      "0x0000000000000000000000000000000000000000",
      true,
      "0x0000000000000000000000000000000000000000",
    ],
    overrides,
    accounts,
  );

  ////
  // PublicCollection
  getScrollDetails(
    publicCollectionFactory,
    [
      "FileMarket",
      "FMRT",
      "ipfs://QmZm4oLQoyXZLJzioYCjGtGXGHqsscKvWJmWXMVhTXZtc9",
      await accounts[0].getAddress(),
      await accounts[0].getAddress(),
      "0x",
      "0x0000000000000000000000000000000000000000",
      true,
    ],
    overrides,
    accounts,
  );

  ////
  // Exchange
  getScrollDetails(exchangeFactory, [], overrides, accounts)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
