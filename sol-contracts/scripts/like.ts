import * as hre from "hardhat";
import {program} from "commander";
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
  program.option("-instance, --instance <string>");
  program.parse();
  const args = program.opts();

  let accounts = await hre.ethers.getSigners();
  console.log(accounts)

  const isFilecoin = process.env.HARDHAT_NETWORK!.toLowerCase().includes("filecoin") ||
    process.env.HARDHAT_NETWORK!.toLowerCase().includes("calibration");
  const overrides = isFilecoin ?
    {maxPriorityFeePerGas: await callRpc("eth_maxPriorityFeePerGas", "")} :
    {gasPrice: await accounts[0].provider!.getGasPrice()};
  console.log(overrides);

  const likeFactory = new LikeEmitter__factory(accounts[0]);
  const like = likeFactory.attach(args.instance);

  const tx = await like.like(args.collection, args.token, overrides);

  console.log("minting tx id", tx);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});