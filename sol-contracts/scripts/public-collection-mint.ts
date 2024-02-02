import * as hre from "hardhat";
import {program} from "commander";
import {PublicCollection__factory} from "../typechain-types";

async function main() {
  program.option("-cid, --cid <string>");
  program.option("-instance, --instance <string>");
  program.option("-id, --id <string>");
  program.parse();
  const args = program.opts();

  let accounts = await hre.ethers.getSigners();
  if (accounts.length == 1)
    accounts.push(accounts[0]);

  const collectionFactory = new PublicCollection__factory(accounts[0]);
  const collection = collectionFactory.attach(args.instance);

  const isOpBNB = process.env.HARDHAT_NETWORK!.toLowerCase().includes("opbnb");
  const overrides = isOpBNB ?
    {gasPrice: await accounts[0].provider!.getGasPrice()} :
    {};
  console.log(overrides);

  // const tx = args.id ?
  //   await collection
  //     .connect(accounts[1])
  //     .mint(accounts[1].address, args.id, args.cid, "1000", "0x", overrides) :
  //   await collection
  //     .connect(accounts[1])
  //     .mintWithoutId(accounts[1].address, args.cid, "1000", "0x", overrides);
  //
  // console.log("minting tx id", tx.hash);

  // console.log(await collection.connect(accounts[0]).tokenUris(hre.ethers.BigNumber.from("1")))
  console.log(await collection.connect(accounts[1]).tokensCount())
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});