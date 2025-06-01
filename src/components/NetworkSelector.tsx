import { useChainId, useSwitchChain } from 'wagmi';
import { mainnet, sepolia, base, baseSepolia } from 'wagmi/chains';

const NetworkSelector = () => {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const networks = [
    { id: mainnet.id, name: 'Ethereum' },
    { id: sepolia.id, name: 'Sepolia' },
    { id: base.id, name: 'Base' },
    { id: baseSepolia.id, name: 'Base Sepolia' },
  ];

  return (
    <select
      value={chainId || mainnet.id}
      onChange={(e) => switchChain({ chainId: Number(e.target.value) })}
      style={{
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        background: '#f9f9f9',
        cursor: 'pointer'
      }}
    >
      {networks.map((network) => (
        <option key={network.id} value={network.id}>
          {network.name}
        </option>
      ))}
    </select>
  );
};

export default NetworkSelector; 