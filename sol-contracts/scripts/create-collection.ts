import * as hre from "hardhat";
import {program} from "commander";
import {FilemarketCollectionV2__factory, Mark3dAccessTokenV2__factory} from "../typechain-types";
import {PayableOverrides} from "ethers";
import {isFilecoin, isScroll} from "./util";

const genRanHex = (size: number) =>
  [...Array(size)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("");

async function main() {
  program.option("-instance, --instance <string>");
  program.parse();
  const args = program.opts();

  let accounts = await hre.ethers.getSigners();
  if (accounts.length == 1)
    accounts.push(accounts[0]);

  const accessTokenFactory = new Mark3dAccessTokenV2__factory(accounts[0]);
  const collectionFactory = new FilemarketCollectionV2__factory(accounts[0]);
  const accessToken = accessTokenFactory.attach(args.instance);
  const salt = genRanHex(64);

  let overrides: PayableOverrides = isFilecoin ?
    {} :
    {gasPrice: await accounts[0].provider!.getGasPrice()};
  console.log(overrides);

  {
    const saltArg = "0x" + salt;
    const name = "TEST";
    const symbol = "TEST";
    const _contractMetaUri = "ipfs://QmQUr4ApevgdEKCbE7W4YHXCCF7JNAVzX2BgZTntaAGQzC";
    const accessTokenMetaUri = "";
    const royaltyReceiver = accounts[0].address;
    const data = "0x";
    if (isScroll) {
      overrides.gasLimit = await accessToken.estimateGas.createCollection(
        saltArg,
        name,
        symbol,
        _contractMetaUri,
        accessTokenMetaUri,
        royaltyReceiver,
        data,
        overrides);
    }
    const tx = await accessToken
      .connect(accounts[1])
      .createCollection(
        saltArg,
        name,
        symbol,
        _contractMetaUri,
        accessTokenMetaUri,
        royaltyReceiver,
        data,
        overrides);
    console.log("tx: ", tx.hash)

    const collectionAddress = await accessToken.predictDeterministicAddress("0x" + salt);
    let collectionInstance = collectionFactory.attach(collectionAddress);
    console.log("collection address: ", collectionInstance.address);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});