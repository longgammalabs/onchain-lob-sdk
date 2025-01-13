import React, { useContext, useState } from 'react';
import { Button, TextField, Box, Typography } from '@mui/material';
import { OnchainLobClientContext } from './clientContext';
import { BigNumber } from 'bignumber.js';

const WithdrawVault = () => {
  const [amount, setAmount] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const onchainLobClient = useContext(OnchainLobClientContext);

  const handleWithdraw = () => {
    // Call the onchain lob vault withdraw function here
    const withdrawParams = {
      amount: BigNumber(amount),
      tokenSymbol: tokenSymbol,
    };

    onchainLobClient.vault.withdraw(withdrawParams)
      .then((response: any) => {
        console.log('Withdraw successful:', response);
      })
      .catch((error: any) => {
        console.error('Withdraw failed:', error);
      });
    console.log(`Withdrawing ${tokenSymbol} with amount ${amount}`);
  };

  return (
    <Box>
      <Typography variant="h6">Withdraw from Vault</Typography>
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
      <Button variant="contained" color="primary" onClick={handleWithdraw}>
        Withdraw
      </Button>
    </Box>
  );
};

export default WithdrawVault;
