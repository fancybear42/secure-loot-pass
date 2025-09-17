// Wallet configuration for Secure Loot Pass
export const walletConfig = {
  chainId: 11155111, // Sepolia testnet
  rpcUrl: process.env.VITE_RPC_URL || 'your_sepolia_rpc_url_here',
  walletConnectProjectId: process.env.VITE_WALLET_CONNECT_PROJECT_ID || 'your_wallet_connect_project_id_here',
  infuraApiKey: process.env.VITE_INFURA_API_KEY || 'your_infura_api_key_here',
  rpcUrlAlt: process.env.VITE_RPC_URL_ALT || 'your_alternative_rpc_url_here'
};

// Supported chains
export const supportedChains = [
  {
    id: 11155111,
    name: 'Sepolia',
    network: 'sepolia',
    nativeCurrency: {
      decimals: 18,
      name: 'Ether',
      symbol: 'ETH',
    },
    rpcUrls: {
      default: {
        http: [walletConfig.rpcUrl],
      },
      public: {
        http: [walletConfig.rpcUrl, walletConfig.rpcUrlAlt],
      },
    },
    blockExplorers: {
      default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' },
    },
    testnet: true,
  },
];
