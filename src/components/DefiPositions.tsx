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

interface DefiPositionsProps {
  positions: Protocol[];
  loading: boolean;
  error: string | null;
  searchedAddress: string | null;
}

const DefiPositions: React.FC<DefiPositionsProps> = ({ positions, loading, error, searchedAddress }) => {
  if (searchedAddress === null) return null;
  if (searchedAddress === "") return <span style={{ color: '#888' }}>No address found</span>;
  if (loading) return <span style={{ color: '#888' }}>Loading...</span>;
  if (error) return <span style={{ color: 'red' }}>{error}</span>;
  if (positions.length === 0) return <span style={{ color: '#888' }}>No DeFi positions found</span>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {positions.map((protocol) => (
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
            Total USD Value: ${protocol.total_usd_value?.toLocaleString?.() ?? '-'}
          </div>
          <div style={{ marginTop: 8 }}>
            <b>Positions:</b>
            {protocol.positions && protocol.positions.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {protocol.positions.map((pos, idx) => (
                  <li key={idx} style={{ marginBottom: 8 }}>
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
                ))}
              </ul>
            ) : (
              <div style={{ color: '#888' }}>No positions</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DefiPositions; 