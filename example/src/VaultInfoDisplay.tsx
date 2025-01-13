import React, { useState, useContext } from 'react';
import { Button, Typography, Box } from '@mui/material';
import { OnchainLobClientContext } from './clientContext';
import { VaultInfo } from 'onchain-lob-sdk';

const VaultInfoDisplay: React.FC = () => {
  const [vaultInfo, setVaultInfo] = useState<VaultInfo | null>(null);
  const onchainLobClient = useContext(OnchainLobClientContext);

  const fetchVaultInfo = async () => {
    try {
      const info = await onchainLobClient.vault.getVaultInfo();
      setVaultInfo(info);
    }
    catch (error) {
      console.error('Error fetching vault info:', error);
    }
  };

  return (
    <Box>
      <Button variant="contained" onClick={fetchVaultInfo}>Get Vault Info</Button>
      {vaultInfo && (
        <Box mt={2}>
          <Typography variant="h6">
            Vault Address:
            {vaultInfo.vaultAddress}
          </Typography>
          <Typography variant="body1">Tokens:</Typography>
          <ul>
            {vaultInfo.tokens.map((token, index) => (
              <li key={index}>
                <Typography variant="body2">
                  {token.name}
                  {' '}
                  (
                  {token.symbol}
                  )
                </Typography>
              </li>
            ))}
          </ul>
        </Box>
      )}
    </Box>
  );
};

export default VaultInfoDisplay;
