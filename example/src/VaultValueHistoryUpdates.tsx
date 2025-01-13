import React, { useEffect, useState, useContext } from 'react';
import { OnchainLobClientContext } from './clientContext';
import { VaultValueHistoryUpdate } from 'onchain-lob-sdk';
import { Box, Typography } from '@mui/material';

const VaultValueHistoryUpdates: React.FC = () => {
  const [vaultValueHistoryUpdates, setVaultValueHistoryUpdates] = useState<VaultValueHistoryUpdate[]>([]);
  const onchainLobClient = useContext(OnchainLobClientContext);

  useEffect(() => {
    onchainLobClient.vault.subscribeToVaultValueHistory({ resolution: '1h' });
  }, []);

  useEffect(() => {
    const handleVaultValueHistoryUpdates = (data: VaultValueHistoryUpdate[]) => {
      setVaultValueHistoryUpdates(prevUpdates => [...prevUpdates, ...data]);
    };

    onchainLobClient.vault.events.vaultValueHistoryUpdated.addListener(handleVaultValueHistoryUpdates);

    return () => {
      onchainLobClient.vault.unsubscribeFromVaultValueHistory();
      onchainLobClient.vault.events.vaultValueHistoryUpdated.removeListener(handleVaultValueHistoryUpdates);
    };
  }, [onchainLobClient]);

  return (
    <Box>
      <Typography variant="h6">Vault Value History Updates</Typography>
      {vaultValueHistoryUpdates.map((update, index) => (
        <Box key={index}>
          <Typography variant="body2">
            {JSON.stringify(update, (key, value) =>
              typeof value === 'bigint' ? value.toString() : value, 2
            )}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default VaultValueHistoryUpdates;
