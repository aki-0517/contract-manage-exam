export const mockTestnetPositions = [
  {
    protocol_name: "Uniswap V2",
    protocol_id: "uniswap-v2",
    protocol_url: "https://app.uniswap.org/",
    chain: "sepolia",
    total_usd_value: 2000,
    positions: [
      {
        label: "WETH-USDC LP",
        address: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
        balance_usd: 2000,
        total_unclaimed_usd_value: 0,
        tokens: [
          {
            token_type: "erc20",
            name: "Wrapped Ether",
            symbol: "WETH",
            contract_address: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
            decimals: 18,
            balance: "1000000000000000000",
            balance_formatted: "1.0",
            usd_price: 2000,
            usd_value: 1000
          },
          {
            token_type: "erc20",
            name: "USD Coin",
            symbol: "USDC",
            contract_address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
            decimals: 6,
            balance: "1000000",
            balance_formatted: "1.0",
            usd_price: 1,
            usd_value: 1000
          }
        ]
      }
    ]
  },
  {
    protocol_name: "Aave V3",
    protocol_id: "aave-v3",
    protocol_url: "https://app.aave.com/",
    chain: "base-sepolia",
    total_usd_value: 2000,
    positions: [
      {
        label: "WETH Supply",
        address: "0x4200000000000000000000000000000000000006",
        balance_usd: 2000,
        total_unclaimed_usd_value: 0,
        tokens: [
          {
            token_type: "erc20",
            name: "Wrapped Ether",
            symbol: "WETH",
            contract_address: "0x4200000000000000000000000000000000000006",
            decimals: 18,
            balance: "1000000000000000000",
            balance_formatted: "1.0",
            usd_price: 2000,
            usd_value: 2000
          }
        ]
      }
    ]
  },
  {
    protocol_name: "Raydium v4",
    protocol_id: "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8",
    protocol_url: "https://raydium.io/",
    chain: "solana-testnet",
    total_usd_value: 1000,
    positions: [
      {
        label: "SOL-USDC LP",
        address: "mock-pair-1",
        balance_usd: 1000,
        total_unclaimed_usd_value: 0,
        tokens: [
          {
            token_type: "native",
            name: "Solana",
            symbol: "SOL",
            contract_address: "",
            decimals: 9,
            balance: "1000000000",
            balance_formatted: "1.0",
            usd_price: 100,
            usd_value: 500
          },
          {
            token_type: "spl",
            name: "USD Coin",
            symbol: "USDC",
            contract_address: "mock-usdc-address",
            decimals: 6,
            balance: "500000",
            balance_formatted: "0.5",
            usd_price: 1,
            usd_value: 500
          }
        ]
      }
    ]
  }
]; 