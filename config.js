require("dotenv").config();

const config = {
  networks: {
    ethereum: {
      name: "Ethereum",
      symbol: "ETH",
      rpc: process.env.ETHEREUM_RPC,
      api_url: process.env.ETHERSCAN_API_URL,
      api_key: process.env.ETHERSCAN_API_KEY,
    },
    bsc: {
      name: "BSC",
      symbol: "BNB",
      rpc: process.env.BSC_RPC,
      api_url: process.env.BSCSCAN_API_URL,
      api_key: process.env.BSCSCAN_API_KEY,
    },
    polygon: {
      name: "Polygon",
      symbol: "POL",
      rpc: process.env.POLYGON_RPC,
      api_url: process.env.POLYGONSCAN_API_URL,
      api_key: process.env.POLYGONSCAN_API_KEY,
    },
    fantom: {
      name: "Fantom",
      symbol: "FTM",
      rpc: process.env.FANTOM_RPC,
      api_url: process.env.FTMSCAN_API_URL,
      api_key: process.env.FTMSCAN_API_KEY,
    },
    optimism: {
      name: "Optimism",
      symbol: "ETH",
      rpc: process.env.OPTIMISM_RPC,
      api_url: process.env.OPTIMISM_SCAN_API_URL,
      api_key: process.env.OPTIMISM_SCAN_API_KEY,
    },
    arbitrum: {
      name: "Arbitrum",
      symbol: "ETH",
      rpc: process.env.ARBITRUM_RPC,
      api_url: process.env.ARBISCAN_API_URL,
      api_key: process.env.ARBISCAN_API_KEY,
    },
  },
};

module.exports = config;
