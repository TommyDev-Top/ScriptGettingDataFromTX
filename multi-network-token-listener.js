const { ethers } = require("ethers");
const axios = require("axios");
const config = require("./config");
require("dotenv").config();

const TRANSFER_EVENT_SIGNATURE = ethers.utils.id(
    "Transfer(address,address,uint256)"
);

const ERC20_ABI = [
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function name() view returns (string)",
];

let NET_RPC, NET_API_URL, NET_API_KEY;

function getNetInfoByName(name) {
    const network = Object.values(config.networks).find(
        (net) => net.name.toLowerCase() === name.toLowerCase()
    );
    if (network) {
        return network;
    } else {
        console.error(`Network "${name}" not found.`);
        return;
    }
}

async function getContractABI(contractAddress) {
    try {
        const response = await axios.get(NET_API_URL, {
            params: {
                module: "contract",
                action: "getabi",
                address: contractAddress,
                apikey: NET_API_KEY,
            },
        });

        const abi = JSON.parse(response.data.result);
        return abi;
    } catch (error) {
        console.error(`Error fetching ABI for ${contractAddress}:`, error.message);
        throw error;
    }
}

async function getContractLabel(address) {
    try {
        const response = await axios.get(NET_API_URL, {
            params: {
                module: "contract",
                action: "getsourcecode",
                address: address,
                apikey: NET_API_KEY,
            },
        });

        const result = response.data.result[0];
        return result.ContractName || "Wallet";
    } catch (error) {
        console.error(`Error fetching label for address ${address}:`, error.message);
        return "Unknown";
    }
}

async function handleTransaction(tx, provider, netInfo) {
    const code = await provider.getCode(tx.to);
    const value = ethers.utils.formatUnits(tx.value);

    if (code !== "0x") {
        // Contract Address
        const abi = await getContractABI(tx.to);
        const iface = new ethers.utils.Interface(abi);
        const decodedData = iface.parseTransaction({ data: tx.data });
        const toLabel = await getContractLabel(tx.to);

        console.log("---------------- Transaction Action ----------------");
        console.log(`Function Name: ${decodedData.name}`);
        console.log(`Caller Address: ${tx.from}`);
        console.log(`Contract Address: ${tx.to} (${toLabel})`);
        console.log(`Value: ${value} (${netInfo.symbol})`);
    } else {
        // Wallet Address
        console.log("---------------- Transaction Content ----------------");
        console.log(`From: ${tx.from}`);
        console.log(`To: ${tx.to}`);
        console.log(`Value: ${value} (${netInfo.symbol})`);
    }
}

async function handleTokenTransfers(receipt, provider) {
    for (const log of receipt.logs) {
        if (log.topics[0] === TRANSFER_EVENT_SIGNATURE) {
            const tokenContract = new ethers.Contract(
                log.address,
                ERC20_ABI,
                provider
            );
            const decodedLog = tokenContract.interface.parseLog(log);

            const from = decodedLog.args.from;
            const to = decodedLog.args.to;
            const value = decodedLog.args.value;
            const tokenAddress = log.address;

            const decimals = await tokenContract.decimals();
            const symbol = await tokenContract.symbol();
            const name = await tokenContract.name();
            const formattedValue = ethers.utils.formatUnits(value, decimals);

            const fromLabel = await getContractLabel(from);
            const toLabel = await getContractLabel(to);

            console.log("---------------- Transfer Details ----------------");
            console.log(`Token: ${name} (${symbol})`);
            console.log(`From: ${from} (${fromLabel})`);
            console.log(`To: ${to} (${toLabel})`);
            console.log(`Value: ${formattedValue}`);
            console.log(`Token Address: ${tokenAddress}`);
        }
    }
}

async function getTransactionDetails() {
    const netName = process.argv[2];
    const txHash = process.argv[3];

    if (!netName || !txHash) {
        console.error(
            "Please provide two arguments - network name and transaction hash."
        );
        return;
    }

    const netInfo = getNetInfoByName(netName);
    NET_RPC = netInfo.rpc;
    NET_API_URL = netInfo.api_url;
    NET_API_KEY = netInfo.api_key;

    try {
        const provider = new ethers.providers.JsonRpcProvider(NET_RPC);

        const tx = await provider.getTransaction(txHash);
        if (!tx) {
            console.error("Transaction not found!");
            return;
        }

        await handleTransaction(tx, provider, netInfo);

        const receipt = await provider.getTransactionReceipt(txHash);
        await handleTokenTransfers(receipt, provider);
    } catch (error) {
        console.error("Error processing transaction:", error.message);
    }
}

getTransactionDetails().catch((err) => console.error(err));