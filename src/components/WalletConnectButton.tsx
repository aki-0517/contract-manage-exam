import { usePrivy } from '@privy-io/react-auth';
import { useState, useRef, useEffect } from 'react';

const WalletConnectButton = () => {
  const { login, logout, authenticated, user, createWallet } = usePrivy();
  const [showDetails, setShowDetails] = useState(false);
  const [copyStatus, setCopyStatus] = useState<{ [key: string]: string }>({});
  const detailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (detailsRef.current && !detailsRef.current.contains(event.target as Node)) {
        setShowDetails(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!authenticated) {
    return (
      <button
        onClick={() => login()}
        type="button"
        className="login-button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <path d="M10 17l-3 3 3 3" />
          <path d="M17 21V10h-7" />
        </svg>
        Login
      </button>
    );
  }

  const getEVMAddress = (): string => {
    const evm = user?.linkedAccounts?.find(a => a.type === 'wallet' && a.chainType === 'ethereum');
    return (evm && 'address' in evm) ? evm.address : 'Not Generated';
  };

  const getSolanaAddress = (): string => {
    const sol = user?.linkedAccounts?.find(a => a.type === 'wallet' && a.chainType === 'solana');
    if (sol && 'address' in sol) {
      return sol.address;
    }
    return 'Not Generated';
  };

  const handleCreateSolanaWallet = async () => {
    try {
      await createWallet({ walletIndex: 0 });
    } catch (error) {
      console.error('Failed to generate Solana wallet:', error);
    }
  };

  const handleCopyAddress = async (address: string, type: string) => {
    if (address === 'Not Generated') return;
    
    try {
      await navigator.clipboard.writeText(address);
      setCopyStatus(prev => ({ ...prev, [type]: 'Copied!' }));
      setTimeout(() => {
        setCopyStatus(prev => ({ ...prev, [type]: '' }));
      }, 2000);
    } catch (error) {
      setCopyStatus(prev => ({ ...prev, [type]: 'Failed to copy' }));
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={detailsRef}>
      <button
        onClick={() => setShowDetails(!showDetails)}
        type="button"
        style={{
          padding: '8px 16px',
          borderRadius: '0.5rem',
          border: 'none',
          background: '#3b82f6',
          color: 'white',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
          minWidth: '200px',
          fontWeight: 500
        }}
      >
        Wallet Details
      </button>
      
      {showDetails && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '8px',
          padding: '16px',
          background: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          zIndex: 1000,
          minWidth: '300px'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>EVM Wallet</h3>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{ 
                flex: 1,
                padding: '8px',
                background: '#f5f5f5',
                borderRadius: '4px',
                wordBreak: 'break-all'
              }}>
                {getEVMAddress()}
              </div>
              {getEVMAddress() !== 'Not Generated' && (
                <button
                  onClick={() => handleCopyAddress(getEVMAddress(), 'evm')}
                  type="button"
                  style={{
                    padding: '4px 12px',
                    borderRadius: '0.5rem',
                    border: 'none',
                    background: '#3b82f6',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
                    whiteSpace: 'nowrap',
                    fontWeight: 500
                  }}
                >
                  {copyStatus['evm'] || 'Copy'}
                </button>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Solana Wallet</h3>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{ 
                flex: 1,
                padding: '8px',
                background: '#f5f5f5',
                borderRadius: '4px',
                wordBreak: 'break-all'
              }}>
                {getSolanaAddress()}
              </div>
              {getSolanaAddress() !== 'Not Generated' && (
                <button
                  onClick={() => handleCopyAddress(getSolanaAddress(), 'solana')}
                  type="button"
                  style={{
                    padding: '4px 12px',
                    borderRadius: '0.5rem',
                    border: 'none',
                    background: '#3b82f6',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
                    whiteSpace: 'nowrap',
                    fontWeight: 500
                  }}
                >
                  {copyStatus['solana'] || 'Copy'}
                </button>
              )}
            </div>
            {getSolanaAddress() === 'Not Generated' && (
              <button
                onClick={handleCreateSolanaWallet}
                type="button"
                style={{
                  marginTop: '8px',
                  padding: '8px 16px',
                  borderRadius: '0.5rem',
                  border: 'none',
                  background: '#3b82f6',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
                  width: '100%',
                  fontWeight: 500
                }}
              >
                Generate Solana Wallet
              </button>
            )}
          </div>

          <button
            onClick={logout}
            type="button"
            style={{
              width: '100%',
              padding: '8px 16px',
              borderRadius: '0.5rem',
              border: 'none',
              background: '#ef4444',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)',
              fontWeight: 500
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletConnectButton; 