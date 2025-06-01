import React from "react";

interface Token {
  token_type: string;
  name: string;
  symbol: string;
  contract_address: string;
  decimals: number;
  logo?: string;
  thumbnail?: string;
  balance: string;
  balance_formatted: string;
  usd_price: number;
  usd_value: number;
}

interface Position {
  label: string;
  tokens: Token[];
  address: string;
  balance_usd: number;
  total_unclaimed_usd_value: number;
  position_details?: any;
}

interface Protocol {
  protocol_name: string;
  protocol_id: string;
  protocol_url: string;
  protocol_logo?: string;
  total_usd_value: number;
  total_unclaimed_usd_value?: string;
  positions: Position[];
}

interface ProtocolWithChain extends Protocol {
  chain: string;
}

interface DefiPositionsProps {
  positions: ProtocolWithChain[];
  loading: boolean;
  error: string | null;
  searchedAddress: string | null;
}

const chainLabels: Record<string, string> = {
  eth: 'Ethereum',
  base: 'Base',
};

const DefiPositions: React.FC<DefiPositionsProps> = ({ positions, loading, error, searchedAddress }) => {
  if (searchedAddress === null) return null;
  if (searchedAddress === "") return <span style={{ color: '#888' }}>No address found</span>;
  if (loading) return <span style={{ color: '#888' }}>Loading...</span>;
  if (error) return <span style={{ color: 'red' }}>{error}</span>;
  if (positions.length === 0) return <span style={{ color: '#888' }}>No DeFi positions found</span>;

  const protocolMap: Record<string, ProtocolWithChain[]> = {};
  positions.forEach((protocol) => {
    if (!protocolMap[protocol.protocol_id]) protocolMap[protocol.protocol_id] = [];
    protocolMap[protocol.protocol_id].push(protocol);
  });

  const activeProtocols = Object.values(protocolMap).filter(protocolsByChain =>
    protocolsByChain.some(p => p.positions && p.positions.length > 0 && p.total_usd_value > 0)
  );

  if (activeProtocols.length === 0) {
    return <span style={{ color: '#888' }}>No active DeFi positions found</span>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {activeProtocols.map((protocolsByChain) => {
        const protocol = protocolsByChain[0];
        return (
          <div key={protocol.protocol_id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {protocol.protocol_logo && (
                <img src={protocol.protocol_logo} alt={protocol.protocol_name} style={{ width: 32, height: 32 }} />
              )}
              <a href={protocol.protocol_url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 'bold', fontSize: 18 }}>
                {protocol.protocol_name}
              </a>
              <span style={{ color: '#888', fontSize: 14 }}>({protocol.protocol_id})</span>
            </div>
            <div style={{ marginTop: 8, color: '#333' }}>
              <b>Chain Status:</b>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {protocolsByChain.map((p) => (
                  <li key={p.chain}>
                    <b>{chainLabels[p.chain] || p.chain}:</b> {p.positions && p.positions.length > 0 && p.total_usd_value > 0 ? (
                      <span style={{ color: 'green' }}>Active (${p.total_usd_value?.toLocaleString?.() ?? '-'})</span>
                    ) : (
                      <span style={{ color: '#888' }}>Inactive</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ marginTop: 8 }}>
              <b>Positions:</b>
              {protocolsByChain.some(p => p.positions && p.positions.length > 0 && p.total_usd_value > 0) ? (
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {protocolsByChain.map((p) =>
                    p.positions && p.positions.length > 0 && p.total_usd_value > 0 ?
                      p.positions.map((pos, idx) => (
                        <li key={p.chain + idx} style={{ marginBottom: 8 }}>
                          <div>Chain: {chainLabels[p.chain] || p.chain}</div>
                          <div>Label: {pos.label}</div>
                          <div>USD Value: ${pos.balance_usd?.toLocaleString?.() ?? '-'}</div>
                          <div>Address: {pos.address}</div>
                          <div>Tokens:
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                              {pos.tokens.map((token, tIdx) => (
                                <li key={tIdx}>
                                  {token.logo && <img src={token.logo} alt={token.symbol} style={{ width: 16, height: 16, verticalAlign: 'middle', marginRight: 4 }} />}
                                  {token.symbol} ({token.name}): {token.balance_formatted} (${token.usd_value?.toLocaleString?.() ?? '-'})
                                </li>
                              ))}
                            </ul>
                          </div>
                        </li>
                      )) : null
                  )}
                </ul>
              ) : (
                <div style={{ color: '#888' }}>No positions</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DefiPositions; 