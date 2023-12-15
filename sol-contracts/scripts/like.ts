import * as hre from "hardhat";
import { program } from "commander";
import {LikeEmitter__factory} from "../typechain-types";
import util from "util";
const request = util.promisify(require("request"));

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
  program.option("-token, --token <string>");
  program.option("-collection, --collection <string>");
  program.parse();
  const args = program.opts();

  const priorityFee = await callRpc("eth_maxPriorityFeePerGas", "");
  console.log(priorityFee);

  let accounts = await hre.ethers.getSigners();
  console.log(accounts)

  const likeFactory = new LikeEmitter__factory(accounts[0]);
  const like = likeFactory.attach("0x03afEF500900839F109957f8b856C3E2CC9309a8");

  const tx = await like.like(args.collection, args.token, {maxPriorityFeePerGas: priorityFee});

  console.log("minting tx id", tx);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});