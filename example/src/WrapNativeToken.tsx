import React, { useContext, useState } from 'react';
import {
  Box,
  Checkbox,
  FormControlLabel,
  TextField,
  Button,
  Typography
} from '@mui/material';
import BigNumber from 'bignumber.js';
import { OnchainLobClientContext } from './clientContext';
import { MARKET_ADDRESS } from './constants';

export const WrapUnwrapNativeToken: React.FC = () => {
  const [isUnwrapTokens, setIsUnwrapTokens] = useState(false);
  const [amount, setAmount] = useState('');
  const onchainLobClient = useContext(OnchainLobClientContext);
  const [isFetching, setIsFetching] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsFetching(true);
    try {
      if (!isUnwrapTokens) {
        const wrapToken = await onchainLobClient.spot.wrapNativeTokens({
          market: MARKET_ADDRESS,
          amount: BigNumber(amount),
        });
        console.log('Wrap Token:', wrapToken);
      }
      else {
        const unwrapToken = await onchainLobClient.spot.unwrapNativeTokens({
          market: MARKET_ADDRESS,
          amount: BigNumber(amount),
        });
        console.log('Unwrap Token:', unwrapToken);
      }
    }
    catch (error) {
      console.error('Error:', error);
    }
    finally {
      setIsFetching(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ '& > :not(style)': { m: 1 } }}>
      <Typography variant="h6">Wrap/Unwrap Tokens</Typography>
      <FormControlLabel
        control={(
          <Checkbox
            checked={isUnwrapTokens}
            onChange={e => setIsUnwrapTokens(e.target.checked)}
            name="isUnwrapTokens"
          />
        )}
        label="Unwrap Tokens"
      />
      <TextField
        fullWidth
        label="Raw Amount"
        variant="outlined"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        placeholder="Enter amount"
      />
      <Button type="submit" variant="contained" color="primary" disabled={isFetching}>
        {isUnwrapTokens ? 'Unwrap' : 'Wrap'}
        {' '}
        Tokens
      </Button>
    </Box>
  );
};

export default WrapUnwrapNativeToken;
