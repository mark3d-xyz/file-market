import * as hre from "hardhat";
import {program} from "commander";
import {FilemarketCollectionV2__factory} from "../typechain-types";

async function main() {
  program.option("-id, --id <string>");
  program.option("-collection, --collection <string>");
  program.parse();
  const args = program.opts();

  let accounts = await hre.ethers.getSigners();
  if (accounts.length == 1)
    accounts.push(accounts[0]);

  const collectionFactory = new FilemarketCollectionV2__factory(accounts[0]);
  const collection = collectionFactory.attach(args.collection);

  const isOpBNB = process.env.HARDHAT_NETWORK!.toLowerCase().includes("opbnb");
  const overrides = isOpBNB ?
    {gasPrice: await accounts[0].provider!.getGasPrice()} :
    {};
  console.log(overrides);

  const tx = await collection.connect(accounts[1]).approveTransfer(args.id, "0x34", overrides);
  console.log("approveTransfer txid: ", tx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});