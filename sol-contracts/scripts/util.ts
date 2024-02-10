import {BigNumber, ContractFactory, Overrides} from "ethers";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {serialize, UnsignedTransaction} from "@ethersproject/transactions";
import {formatEther} from "ethers/lib/utils";
import {ethers} from "hardhat";
import {TransactionRequest} from "@ethersproject/providers";
import * as hre from "hardhat";

const ORACLE_PRECOMPILE_ADDRESS = "0x5300000000000000000000000000000000000002";

export async function getScrollDetails(contract: ContractFactory, args: any[], overrides: Overrides, accounts: SignerWithAddress[]): Promise<BigNumber> {
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

async function estimateL1Fee(gasOraclePrecompileAddress: string, unsignedSerializedTransaction: string): Promise<BigNumber> {
  const l1GasOracle = await ethers.getContractAt("IL1GasPriceOracle", gasOraclePrecompileAddress);

  return l1GasOracle.getL1Fee(unsignedSerializedTransaction);
}

async function estimateL2Fee(tx: TransactionRequest): Promise<BigNumber> {
  const gasToUse = await hre.ethers.provider.estimateGas(tx);
  const feeData = await hre.ethers.provider.getFeeData();
  const gasPrice = feeData.gasPrice;

  if (!gasPrice) {
    throw new Error("There was an error estimating L2 fee");
  }

  return gasToUse.mul(gasPrice);
}

export const isFilecoin = process.env.HARDHAT_NETWORK!.toLowerCase().includes("filecoin") ||
  process.env.HARDHAT_NETWORK!.toLowerCase().includes("calibration");
export const isScroll = process.env.HARDHAT_NETWORK!.toLowerCase().includes("scroll");
