import React, { useContext, useState } from 'react';
import { Button, TextField, Box, Typography } from '@mui/material';
import { OnchainLobClientContext } from './clientContext';
import { BigNumber } from 'bignumber.js';

const DepositVault = () => {
  const [amount, setAmount] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const onchainLobClient = useContext(OnchainLobClientContext);

  const handleDeposit = () => {
    // Call the onchain lob vault deposit function here
    const depositParams = {
      amount: BigNumber(amount),
      tokenSymbol: tokenSymbol,
    };

    onchainLobClient.vault.deposit(depositParams)
      .then((response: any) => {
        console.log('Deposit successful:', response);
      })
      .catch((error: any) => {
        console.error('Deposit failed:', error);
      });
    console.log(`Depositing ${tokenSymbol} with amount ${amount}`);
  };

  return (
    <Box>
      <Typography variant="h6">Deposit to Vault</Typography>
      <TextField
        label="Amount"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Token Symbol"
        value={tokenSymbol}
        onChange={e => setTokenSymbol(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" color="primary" onClick={handleDeposit}>
        Deposit
      </Button>
    </Box>
  );
};

export default DepositVault;
