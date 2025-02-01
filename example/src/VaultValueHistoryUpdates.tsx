import React, { useEffect, useState, useContext } from 'react';
import { OnchainLobClientContext } from './clientContext';
import { VaultHistoryUpdate } from 'onchain-lob-sdk';
import { Box, Typography } from '@mui/material';

const VaultHistoryUpdates: React.FC = () => {
  const [vaultValueHistoryUpdates, setVaultValueHistoryUpdates] = useState<VaultHistoryUpdate[]>([]);
  const onchainLobClient = useContext(OnchainLobClientContext);

  useEffect(() => {
    onchainLobClient.vault.subscribeToVaultHistory({ period: '1h' });
  }, []);

  useEffect(() => {
    const handleVaultValueHistoryUpdates = (_isSnapshot: boolean, data: VaultHistoryUpdate[]) => {
      setVaultValueHistoryUpdates(prevUpdates => [...prevUpdates, ...data]);
    };

    onchainLobClient.vault.events.vaultHistoryUpdated.addListener(handleVaultValueHistoryUpdates);

    return () => {
      onchainLobClient.vault.unsubscribeFromVaultHistory({ period: '1h' });
      onchainLobClient.vault.events.vaultHistoryUpdated.removeListener(handleVaultValueHistoryUpdates);
    };
  }, [onchainLobClient]);

  return (
    <Box>
      <Typography variant="h6">Vault History Updates</Typography>
      {vaultValueHistoryUpdates.map((update, index) => (
        <Box key={index}>
          <Typography variant="body2">
            {JSON.stringify(update, (_key, value) =>
              typeof value === 'bigint' ? value.toString() : value, 2
            )}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default VaultHistoryUpdates;
