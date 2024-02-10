import * as hre from "hardhat";
import {program} from "commander";
import {FilemarketCollectionV2__factory} from "../typechain-types";

async function main() {
  program.option("-cid, --cid <string>");
  program.option("-collection, --collection <string>");
  program.option("-id, --id <string>");
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

  const tx = args.id ?
    await collection
      .connect(accounts[1])
      .mint(accounts[1].address, args.id, args.cid, "1000", "0x", overrides) :
    await collection
      .connect(accounts[1])
      .mintWithoutId(accounts[1].address, args.cid, "1000", "0x", overrides);

  console.log("minting tx id", tx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});