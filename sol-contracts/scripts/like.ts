import * as hre from "hardhat";
import { program } from "commander";
import {LikeEmitter__factory} from "../typechain-types";

async function main() {
  program.option("-token, --token <string>");
  program.option("-collection, --collection <string>");
  program.parse();
  const args = program.opts();

  let accounts = await hre.ethers.getSigners();
  const likeFactory = new LikeEmitter__factory(accounts[0]);
  const like = likeFactory.attach("0xE48c71D68101053bC2E0EE18355f1C7A1Fa919E0");

  const tx = await like.like(args.collection, args.token);

  console.log("minting tx id", tx);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});