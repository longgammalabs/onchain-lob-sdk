import React, { useEffect, useState, useContext } from 'react';
import { OnchainLobClientContext } from './clientContext';
import { VaultTotalValuesUpdate } from 'onchain-lob-sdk';
import { Box, Typography } from '@mui/material';

const VaultTotalValuesDisplayUpdates: React.FC = () => {
  const [vaultUpdates, setVaultUpdates] = useState<VaultTotalValuesUpdate[]>([]);
  const onchainLobClient = useContext(OnchainLobClientContext);

  useEffect(() => {
    onchainLobClient.vault.subscribeToVaultTotalValues({});
  }, []);

  useEffect(() => {
    const handleVaultUpdates = (_isSnapshot: boolean, data: VaultTotalValuesUpdate) => {
      setVaultUpdates(prevUpdates => [...prevUpdates, data]);
    };

    onchainLobClient.vault.events.vaultTotalValuesUpdated.addListener(handleVaultUpdates);

    return () => {
      onchainLobClient.vault.unsubscribeToVaultTotalValues({});
      onchainLobClient.vault.events.vaultTotalValuesUpdated.removeListener(handleVaultUpdates);
    };
  }, [onchainLobClient]);

  return (
    <Box>
      <Typography variant="h6">Vault Updates</Typography>
      {vaultUpdates.map((update, index) => (
        <Box key={index}>
          <Typography variant="body2">
            {JSON.stringify(update, (_key, value) =>
              typeof value === 'bigint' ? value.toString() : value
            )}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default VaultTotalValuesDisplayUpdates;
