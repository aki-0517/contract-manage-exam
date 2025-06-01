import { ConnectButton } from '@rainbow-me/rainbowkit';

const WalletConnectButton = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openConnectModal,
        mounted,
      }) => {
        return (
          <div
            {...(!mounted && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!mounted || !account || !chain) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    style={{
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      background: '#f9f9f9',
                      cursor: 'pointer'
                    }}
                  >
                    Connect Wallet
                  </button>
                );
              }
              return (
                <button
                  onClick={openAccountModal}
                  type="button"
                  style={{
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    background: '#f9f9f9',
                    cursor: 'pointer'
                  }}
                >
                  {account.displayName}
                </button>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default WalletConnectButton; 