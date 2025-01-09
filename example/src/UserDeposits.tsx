import React, { useContext, useState } from 'react';
import { Button, Container, Typography, Box } from '@mui/material';
import { ClientAddressContext, OnchainLobClientContext } from './clientContext';
import { type UserDeposits as UserDepositsType } from 'onchain-lob-sdk';

export const UserDeposits: React.FC = () => {
  const [depositsData, setDepositsData] = useState<UserDepositsType | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const onchainLobClient = useContext(OnchainLobClientContext);
  const address = useContext(ClientAddressContext);

  const fetchDepositsData = async () => {
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }
    try {
      setIsFetching(true);
      const data = await onchainLobClient.spot.getUserDeposits({
        user: address,
      });
      setDepositsData(data);
      setIsFetching(false);
    }
    catch (error) {
      console.error('Error fetching deposits data:', error);
    }
  };

  return (
    <Container>
      <Typography variant="h6" component="h3" gutterBottom>
        User Deposits
      </Typography>
      <Button variant="contained" color="primary" onClick={fetchDepositsData} disabled={isFetching}>
        Fetch User Deposits Data
      </Button>
      {depositsData && (
        <Box mt={2} mb={2} textAlign="left">
          <Typography variant="body1" component="pre">
            {JSON.stringify(depositsData, (_key, value) =>
              typeof value === 'bigint'
                ? value.toString()
                : value, 2)}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default UserDeposits;
