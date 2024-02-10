import * as hre from "hardhat";
import {program} from "commander";
import {FilemarketExchangeV2__factory} from "../typechain-types";

async function main() {
  program.option("-id, --id <string>");
  program.option("-collection, --collection <string>");
  program.option("-exchange, --exchange <string>");
  program.option("-key, --key <string>");
  program.parse();
  const args = program.opts();

  let accounts = await hre.ethers.getSigners();
  if (accounts.length == 1)
    accounts.push(accounts[0]);

  const isOpBNB = process.env.HARDHAT_NETWORK!.toLowerCase().includes("opbnb");
  const overrides = isOpBNB ?
    {gasPrice: await accounts[0].provider!.getGasPrice()} :
    {};
  console.log(overrides);

  const factory = new FilemarketExchangeV2__factory(accounts[0]);
  const exchange = factory.attach(args.exchange);
  const tx = await exchange
    .connect(accounts[1])
    .fulfillOrder(args.collection, args.key, args.id, "0x", {...overrides, value: 10000});
  console.log("fulfill order txid: ", tx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});