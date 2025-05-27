import { useState } from "react";
import WalletConnectButton from "./components/WalletConnectButton";
import './App.css'
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

const queryClient = new QueryClient();

function App() {
  const [inputAddress, setInputAddress] = useState<string>("");
  const [searchedAddress, setSearchedAddress] = useState<string | null>(null);
  const { address: connectedAddress } = useAccount();

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearch = () => {
    if (inputAddress.trim() !== "") {
      setSearchedAddress(inputAddress.trim());
    } else if (connectedAddress) {
      setSearchedAddress(connectedAddress);
    } else {
      setSearchedAddress("");
    }
  };

  return (
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <div className="app-container" style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
            <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
              <h1 style={{ fontSize: 24 }}>Morpho Manage</h1>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <WalletConnectButton />
                <input
                  type="text"
                  placeholder="Input wallet address"
                  value={inputAddress}
                  onChange={e => setInputAddress(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', minWidth: 320 }}
                />
                <button
                  onClick={handleSearch}
                  style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', background: '#f9f9f9', cursor: 'pointer' }}
                >
                  Search
                </button>
              </div>
            </header>
            <div style={{ marginTop: 24, minHeight: 32 }}>
              {searchedAddress === null ? null : searchedAddress === "" ? (
                <span style={{ color: '#888' }}>No address found</span>
              ) : (
                <span style={{ color: '#333' }}>{searchedAddress}</span>
              )}
            </div>
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
  )
}

export default App
