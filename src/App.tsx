import { useState, useEffect } from "react";
import WalletConnectButton from "./components/WalletConnectButton";
import './App.css'
import { usePrivy } from '@privy-io/react-auth';
import DefiPositions from "./components/DefiPositions";
import { mainnet, sepolia, base, baseSepolia } from 'viem/chains';

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
  const { ready, user } = usePrivy();
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.wallet?.address) {
      setInputAddress(user.wallet.address);
    }
  }, [user?.wallet?.address]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearch = () => {
    if (inputAddress.trim() !== "") {
      setSearchedAddress(inputAddress.trim());
    } else if (user?.wallet?.address) {
      setSearchedAddress(user.wallet.address);
    } else {
      setSearchedAddress("");
    }
  };

  useEffect(() => {
    const fetchPositions = async () => {
      if (!searchedAddress || !ready) return;
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
        const networks = [mainnet.id, base.id];
        const allResults = await Promise.all(
          networks.map(async (networkId) => {
            const chain = getNetworkName(networkId);
            const networkResults = await Promise.all(
              PROTOCOLS.map(async (protocol) => {
                const url = `https://deep-index.moralis.io/api/v2.2/wallets/${searchedAddress}/defi/${protocol.id}/positions?chain=${chain}`;
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
                return { ...data, chain };
              })
            );
            return networkResults.filter(Boolean);
          })
        );

        const mergedResults = allResults.flat();
        setPositions(mergedResults);
      } catch (e: any) {
        setError("An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };
    if (searchedAddress) {
      fetchPositions();
    }
  }, [searchedAddress, ready]);

  return (
    <div className="app-container" style={{ maxWidth: 600, margin: '0 auto', padding: 24, position: 'relative' }}>
      <div style={{ position: 'absolute', top: 24, right: 24 }}>
        <WalletConnectButton />
      </div>
      <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>Defi Manage</h1>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 16 }}>
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
            style={{
              padding: '8px 16px',
              borderRadius: '0.5rem',
              border: 'none',
              background: '#3b82f6',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)'
            }}
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
  );
}

export default App;
