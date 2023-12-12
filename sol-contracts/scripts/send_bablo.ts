import * as hre from "hardhat";
import { program } from "commander";
import readline from 'readline';
import util from "util";
const request = util.promisify(require("request"));

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

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
    program.option("-to, --to <string>");
    program.option("-amount, --amount <string>");
    program.parse();
    const args = program.opts();

    const priorityFee = await callRpc("eth_maxPriorityFeePerGas", "");
    console.log(priorityFee);

    const accounts = await hre.ethers.getSigners();
    console.log(accounts)

    const balance = await accounts[0].getBalance();
    console.log(`current balance: ${balance} (${hre.ethers.utils.formatEther(balance)} FIL)`)

    rl.question(`Are you sure you want to send ${hre.ethers.utils.formatEther(args.amount)} ETH to ${args.to}? (yes/no) `, function(answer) {
        if (answer.toLowerCase() === 'yes') {
            const tx = accounts[0].sendTransaction({
                to: args.to,
                value: args.amount,
                maxPriorityFeePerGas: priorityFee,
            }).then(tx => {
                console.log(tx);
            }).catch(err => {
                console.log("Failed: ", err)
            })
        } else {
            console.log("Cancelled")
        }
        rl.close()
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
