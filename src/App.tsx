import { useState, useEffect } from "react";
import WalletConnectButton from "./components/WalletConnectButton";
import NetworkSelector from "./components/NetworkSelector";
import './App.css'
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAccount, useChainId } from 'wagmi';
import DefiPositions from "./components/DefiPositions";
import { mainnet, sepolia, base, baseSepolia } from 'wagmi/chains';

const queryClient = new QueryClient();

const PROTOCOLS = [
  { id: "uniswap-v2", name: "Uniswap V2" },
  { id: "uniswap-v3", name: "Uniswap V3" },
  { id: "pancakeswap-v2", name: "PancakeSwap V2" },
  { id: "pancakeswap-v3", name: "PancakeSwap V3" },
  { id: "quickswap-v2", name: "QuickSwap V2" },
  { id: "sushiswap-v2", name: "SushiSwap V2" },
  { id: "aave-v2", name: "Aave V2" },
  { id: "aave-v3", name: "Aave V3" },
  { id: "fraxswap-v1", name: "FraxSwap V1" },
  { id: "fraxswap-v2", name: "FraxSwap V2" },
  { id: "lido", name: "Lido" },
  { id: "makerdao", name: "MakerDAO" },
  { id: "eigenlayer", name: "EigenLayer" },
];

function App() {
  const [inputAddress, setInputAddress] = useState<string>("");
  const [searchedAddress, setSearchedAddress] = useState<string | null>(null);
  const { address: connectedAddress } = useAccount();
  const chainId = useChainId();
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (connectedAddress) {
      setInputAddress(connectedAddress);
      setSearchedAddress(connectedAddress);
    }
  }, [connectedAddress]);

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

  useEffect(() => {
    const fetchPositions = async () => {
      if (!searchedAddress || !chainId) return;
      setLoading(true);
      setError(null);
      setPositions([]);
      const apiKey = import.meta.env.VITE_MORALIS_API_KEY;
      if (!apiKey) {
        setError("Moralis API key is not set.");
        setLoading(false);
        return;
      }

      const getNetworkName = (chainId: number) => {
        switch (chainId) {
          case mainnet.id:
            return 'eth';
          case sepolia.id:
            return 'sepolia';
          case base.id:
            return 'base';
          case baseSepolia.id:
            return 'base-sepolia';
          default:
            return 'eth';
        }
      };

      try {
        const results = await Promise.all(
          PROTOCOLS.map(async (protocol) => {
            const url = `https://deep-index.moralis.io/api/v2.2/wallets/${searchedAddress}/defi/${protocol.id}/positions?chain=${getNetworkName(chainId)}`;
            const res = await fetch(url, {
              headers: {
                'accept': 'application/json',
                'X-API-Key': apiKey,
              },
            });
            if (!res.ok) {
              return null;
            }
            const data = await res.json();
            return data;
          })
        );
        setPositions(results.filter(Boolean));
      } catch (e: any) {
        setError("An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };
    if (searchedAddress) {
      fetchPositions();
    }
  }, [searchedAddress, chainId]);

  return (
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider modalSize="compact">
        <div className="app-container" style={{ maxWidth: 600, margin: '0 auto', padding: 24, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 24, right: 24 }}>
            <WalletConnectButton />
          </div>
          <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
            <h1 style={{ fontSize: 24 }}>Defi Manage</h1>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <NetworkSelector />
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
            <DefiPositions
              positions={positions}
              loading={loading}
              error={error}
              searchedAddress={searchedAddress}
            />
          </div>
        </div>
      </RainbowKitProvider>
    </QueryClientProvider>
  );
}

export default App;
