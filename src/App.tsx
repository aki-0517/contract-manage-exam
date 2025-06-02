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

const SOLANA_PROTOCOLS = [
  { id: "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8", name: "Raydium v4" },
  { id: "CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK", name: "Raydium CLMM" },
  { id: "CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C", name: "Raydium CPMM" },
  { id: "Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB", name: "Meteora Dynamic AMM" },
  { id: "LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo", name: "Meteora DLMM" },
  { id: "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc", name: "Orca/Whirlpool" },
  { id: "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P", name: "PumpFun" },
  { id: "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA", name: "PumpSwap" },
  { id: "LanMV9sAd7wArD4vJFi2qDdfnVhFxYSUg6eADduJ3uj", name: "LaunchLab" },
];

// Solanaアドレス判定関数
function isSolanaAddress(address: string): boolean {
  // 0xで始まらず、32〜44文字、英数字のみ
  return (
    /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address) &&
    !address.startsWith('0x')
  );
}

function App() {
  const [inputAddress, setInputAddress] = useState<string>("");
  const [searchedAddress, setSearchedAddress] = useState<string | null>(null);
  const { ready, user } = usePrivy();
  const [myWalletPositions, setMyWalletPositions] = useState<any[]>([]);
  const [searchedPositions, setSearchedPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'my-wallet' | 'portfolio'>('my-wallet');
  const [isInputFocused, setIsInputFocused] = useState(false);

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
    const fetchMyWalletPositions = async () => {
      if (!user?.wallet?.address || !ready) return;
      setLoading(true);
      setError(null);
      setMyWalletPositions([]);
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
        const evmResults = await Promise.all(
          networks.map(async (networkId) => {
            const chain = getNetworkName(networkId);
            const networkResults = await Promise.all(
              PROTOCOLS.map(async (protocol) => {
                const url = `https://deep-index.moralis.io/api/v2.2/wallets/${user.wallet?.address}/defi/${protocol.id}/positions?chain=${chain}`;
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

        // Solanaアドレス取得
        const solanaWallet = user?.linkedAccounts?.find(a =>
          a.type === 'wallet' &&
          a.chainType === 'solana'
        ) as { address: string } | undefined;
        const solanaAddress = solanaWallet?.address;

        let solanaResults: any[] = [];
        if (solanaAddress) {
          // 1. 各DEXのペア情報を取得
          const pairsResults = await Promise.all(
            SOLANA_PROTOCOLS.map(async (protocol) => {
              const url = `https://solana-gateway.moralis.io/token/mainnet/${protocol.id}/pairs`;
              const res = await fetch(url, {
                headers: {
                  'accept': 'application/json',
                  'X-API-Key': apiKey,
                },
              });
              if (!res.ok) return null;
              const data = await res.json();
              return { protocol, pairs: data };
            })
          );

          // 2. ウォレットのスワップ履歴を取得
          const swapsUrl = `https://solana-gateway.moralis.io/account/mainnet/${solanaAddress}/swaps`;
          const swapsRes = await fetch(swapsUrl, {
            headers: {
              'accept': 'application/json',
              'X-API-Key': apiKey,
            },
          });
          let swapsData = [];
          if (swapsRes.ok) {
            swapsData = await swapsRes.json();
          }

          // 3. ペア情報とスワップ履歴を組み合わせてポートフォリオ風に整形
          solanaResults = pairsResults
            .filter((x): x is { protocol: { id: string; name: string }; pairs: any } => x !== null)
            .map(({ protocol, pairs }) => {
              const pairAddresses = (pairs?.result || []).map((p: any) => p.pairAddress);
              const relatedSwaps = (swapsData?.result || []).filter((swap: any) =>
                pairAddresses.includes(swap.pairAddress)
              );
              return {
                protocol_name: protocol.name,
                protocol_id: protocol.id,
                protocol_url: `https://solana-gateway.moralis.io/token/mainnet/${protocol.id}/pairs`,
                total_swaps: relatedSwaps.length,
                swaps: relatedSwaps,
                pairs: pairs?.result || [],
                chain: 'solana',
              };
            });
        }

        const mergedResults = [...evmResults.flat(), ...solanaResults];
        setMyWalletPositions(mergedResults);
      } catch (e: any) {
        setError("An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyWalletPositions();
  }, [user?.wallet?.address, ready]);

  useEffect(() => {
    const fetchSearchedPositions = async () => {
      if (!searchedAddress || !ready) return;
      setLoading(true);
      setError(null);
      setSearchedPositions([]);
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
        let results: any[] = [];
        if (isSolanaAddress(searchedAddress)) {
          // Solanaアドレスの場合
          // 1. 各DEXのペア情報を取得
          const pairsResults = await Promise.all(
            SOLANA_PROTOCOLS.map(async (protocol) => {
              const url = `https://solana-gateway.moralis.io/token/mainnet/${protocol.id}/pairs`;
              const res = await fetch(url, {
                headers: {
                  'accept': 'application/json',
                  'X-API-Key': apiKey,
                },
              });
              if (!res.ok) return null;
              const data = await res.json();
              return { protocol, pairs: data };
            })
          );

          // 2. ウォレットのスワップ履歴を取得
          const swapsUrl = `https://solana-gateway.moralis.io/account/mainnet/${searchedAddress}/swaps`;
          const swapsRes = await fetch(swapsUrl, {
            headers: {
              'accept': 'application/json',
              'X-API-Key': apiKey,
            },
          });
          let swapsData = [];
          if (swapsRes.ok) {
            swapsData = await swapsRes.json();
          }

          // 3. ペア情報とスワップ履歴を組み合わせてポートフォリオ風に整形
          results = pairsResults
            .filter((x): x is { protocol: { id: string; name: string }; pairs: any } => x !== null)
            .map(({ protocol, pairs }) => {
              const pairAddresses = (pairs?.result || []).map((p: any) => p.pairAddress);
              const relatedSwaps = (swapsData?.result || []).filter((swap: any) =>
                pairAddresses.includes(swap.pairAddress)
              );
              return {
                protocol_name: protocol.name,
                protocol_id: protocol.id,
                protocol_url: `https://solana-gateway.moralis.io/token/mainnet/${protocol.id}/pairs`,
                total_swaps: relatedSwaps.length,
                swaps: relatedSwaps,
                pairs: pairs?.result || [],
                chain: 'solana',
                positions: [],
                total_usd_value: 0,
              };
            });
        } else {
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
          results = allResults.flat();
        }
        setSearchedPositions(results.filter(Boolean));
      } catch (e: any) {
        setError("An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    if (searchedAddress) {
      fetchSearchedPositions();
    }
  }, [searchedAddress, ready]);

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#f9fafb'
    }}>
      {/* ヘッダー */}
      <header style={{ 
        background: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ 
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '32px'
        }}>
          <h1 style={{ 
            fontSize: '24px',
            margin: 0,
            fontWeight: 600,
            color: '#111827',
            flex: '0 0 auto'
          }}>
            Defi Manage
          </h1>
          <div style={{ flex: 1 }} />
          <div style={{ flex: '0 0 auto' }}>
            <WalletConnectButton />
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main style={{ 
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '24px'
      }}>
        {/* タブ */}
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          marginBottom: '32px',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '16px'
        }}>
          <button
            onClick={() => setActiveTab('my-wallet')}
            style={{
              padding: '12px 24px',
              borderRadius: '0.5rem',
              border: 'none',
              background: activeTab === 'my-wallet' ? '#3b82f6' : '#f3f4f6',
              color: activeTab === 'my-wallet' ? 'white' : '#374151',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontWeight: 500,
              fontSize: '16px'
            }}
          >
            My Wallet
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            style={{
              padding: '12px 24px',
              borderRadius: '0.5rem',
              border: 'none',
              background: activeTab === 'portfolio' ? '#3b82f6' : '#f3f4f6',
              color: activeTab === 'portfolio' ? 'white' : '#374151',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontWeight: 500,
              fontSize: '16px'
            }}
          >
            Portfolio
          </button>
        </div>

        {/* コンテンツ */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {activeTab === 'my-wallet' ? (
            <div>
              {user?.wallet?.address && (
                <DefiPositions
                  positions={myWalletPositions}
                  loading={loading}
                  error={error}
                  searchedAddress={user.wallet.address}
                />
              )}
            </div>
          ) : (
            <div>
              <div style={{ 
                display: 'flex', 
                gap: '16px', 
                alignItems: 'center', 
                marginBottom: '24px',
                maxWidth: '800px'
              }}>
                <input
                  type="text"
                  placeholder="Input wallet address"
                  value={inputAddress}
                  onChange={e => setInputAddress(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  style={{ 
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: `1px solid ${isInputFocused ? '#3b82f6' : '#e5e7eb'}`,
                    flex: 1,
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxShadow: isInputFocused ? '0 0 0 2px rgba(59, 130, 246, 0.1)' : 'none'
                  }}
                />
                <button
                  onClick={handleSearch}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#3b82f6',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
                    fontWeight: 500,
                    fontSize: '16px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Search
                </button>
              </div>
              <DefiPositions
                positions={searchedPositions}
                loading={loading}
                error={error}
                searchedAddress={searchedAddress}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
