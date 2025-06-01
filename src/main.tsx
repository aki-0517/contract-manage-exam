import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PrivyProvider } from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mainnet, sepolia, base, baseSepolia } from 'viem/chains';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID}
      config={{
        loginMethods: ['google', 'email'],
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets'
          },
          solana: {
            createOnLogin: 'users-without-wallets'
          }
        },
        defaultChain: base,
        supportedChains: [mainnet, sepolia, base, baseSepolia]
      }}
    >
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </PrivyProvider>
  </StrictMode>,
)
