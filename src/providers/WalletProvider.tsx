import React from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { supportedChains } from '../config/wallet';
import '@rainbow-me/rainbowkit/styles.css';

// Create a client
const queryClient = new QueryClient();

// Configure RainbowKit
const config = getDefaultConfig({
  appName: 'Secure Loot Pass',
  projectId: process.env.VITE_WALLET_CONNECT_PROJECT_ID || 'your_wallet_connect_project_id_here',
  chains: supportedChains,
  ssr: false, // If your dApp uses server side rendering (SSR)
});

interface WalletProviderProps {
  children: React.ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
