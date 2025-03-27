import React, { useState, useContext } from "react";
import { Button, Typography, Box } from "@mui/material";
import { OnchainLobClientContext } from "./clientContext";
import { VaultConfig } from "onchain-lob-sdk";

const VaultConfigDisplay: React.FC = () => {
  const [vaultConfig, setVaultConfig] = useState<VaultConfig | null>(null);
  const onchainLobClient = useContext(OnchainLobClientContext);

  const fetchVaultInfo = async () => {
    try {
      const info = await onchainLobClient.vault.getVaultConfig({});
      setVaultConfig(info);
    } catch (error) {
      console.error("Error fetching vault info:", error);
    }
  };

  return (
    <Box>
      <Button variant="contained" onClick={fetchVaultInfo}>
        Get Vault Config
      </Button>
      {vaultConfig && (
        <Box mt={2}>
          <Typography variant="h6">
            Vault Address:
            {vaultConfig.vaultAddress}
          </Typography>
          <Typography variant="h6">
            Vault Market Cap:
            {vaultConfig.marketCap.toString()} USD
          </Typography>
          <Typography variant="body1">Tokens:</Typography>
          <ul>
            {vaultConfig.tokens.map((token, index) => (
              <li key={index}>
                <Typography variant="body2">
                  {token.name} ({token.symbol})
                </Typography>
              </li>
            ))}
          </ul>
        </Box>
      )}
    </Box>
  );
};

export default VaultConfigDisplay;
