import React, { useEffect, useState, useContext } from 'react';
import { ClientAddressContext, OnchainLobClientContext } from './clientContext';
import { VaultUpdate } from 'onchain-lob-sdk';
import { Box, Typography } from '@mui/material';

const VaultDisplayUpdates: React.FC = () => {
  const [vaultUpdates, setVaultUpdates] = useState<VaultUpdate[]>([]);
  const onchainLobClient = useContext(OnchainLobClientContext);
  const address = useContext(ClientAddressContext);

  useEffect(() => {
    onchainLobClient.vault.subscribeToVaultUpdates({ user: address ?? undefined });
  }, [address]);

  useEffect(() => {
    const handleVaultUpdates = (data: VaultUpdate[]) => {
      setVaultUpdates(data);
    };

    onchainLobClient.vault.events.vaultUpdated.addListener(handleVaultUpdates);

    return () => {
      onchainLobClient.vault.unsubscribeFromVaultUpdates();
      onchainLobClient.vault.events.vaultUpdated.removeListener(handleVaultUpdates);
    };
  }, [onchainLobClient]);

  return (
    <Box>
      <Typography variant="h6">Vault Updates</Typography>
      {vaultUpdates.map((update, index) => (
        <Box key={index}>
          <Typography variant="body2">
            {JSON.stringify(update, (key, value) =>
              typeof value === 'bigint' ? value.toString() : value
            )}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default VaultDisplayUpdates;
