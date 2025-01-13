import { useState } from 'react';
import './App.css';
import { WalletConnect } from './WalletConnect';
import { PlaceOrder } from './PlaceOrder';
import { Orderbook } from './Orderbook';
import { Box, Divider, Typography, AppBar, Tabs, Tab, Button } from '@mui/material';
import UserOrdersUpdates from './UserOrdersUpdates';
import { ClientAddressContext, OnchainLobClientContext, defaultOnchainLobClient } from './clientContext';
import ApproveToken from './ApproveToken';
import OrderbookUpdates from './OrderbookUpdates';
import AllMarketsUpdates from './AllMarketUpdates';
import CalculateOrderDetails from './CalculateOrderDetails';
import CandleUpdates from './CandleUpdates';
import UserBalances from './UserBalances';
import UserOrderHistoryUpdates from './UserOrderHistoryUpdates';
import ClaimOrder from './ClaimOrder';
import TradeUpdates from './TradeUpdates';
import Timetx from './Timetx';
import UserDeposits from './UserDeposits';
import WrapUnwrapNativeToken from './WrapNativeToken';
import VaultInfoDisplay from './VaultInfoDisplay';
import DepositVault from './DepositVault';
import VaultDisplayUpdates from './VaultDisplayUpdates';
import WithdrawVault from './WithdrawVault';
import VaultValueHistoryUpdates from './VaultValueHistoryUpdates';

function App() {
  const [address, setAddress] = useState<string>('');
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [selectedPage, setSelectedPage] = useState<string>('ContractAPI');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <OnchainLobClientContext.Provider value={defaultOnchainLobClient}>
      <ClientAddressContext.Provider value={address}>
        <AppBar position="static" sx={{ backgroundColor: 'white' }}>
          <Tabs value={tabIndex} onChange={handleTabChange}>
            <Tab
              label="Orderbook"
              sx={{
                color: tabIndex === 0 ? 'primary.main' : 'text.secondary',
                fontWeight: tabIndex === 0 ? 'bold' : 'normal',
              }}
            />
            <Tab
              label="Vault"
              sx={{
                color: tabIndex === 1 ? 'primary.main' : 'text.secondary',
                fontWeight: tabIndex === 1 ? 'bold' : 'normal',
              }}
            />
          </Tabs>
        </AppBar>
        {tabIndex === 0 && (
          <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={2}>
            <Box p={1} sx={{ gridColumn: '1 / 2' }}>
              <Typography variant="h6">Contract API</Typography>
              <Divider />
              {address !== ''
                ? (
                  <>
                    <Typography>
                      User address is
                      {' '}
                      { address }
                    </Typography>
                    <Timetx />
                    <Divider />
                    <ApproveToken />
                    <Divider />
                    <WrapUnwrapNativeToken />
                    <Divider />
                    <PlaceOrder />
                    <Divider />
                    <ClaimOrder />
                  </>
                )
                : (
                  <WalletConnect setAddress={(address: string) => setAddress(address)} />
                )}
            </Box>
            <Box p={1} sx={{ gridColumn: '2 / 3' }}>
              <Typography variant="h6">HTTP API</Typography>
              <Divider />
              <Orderbook />
              <Divider />
              <UserBalances />
              <Divider />
              <UserDeposits />
              <Divider />
              <CalculateOrderDetails />
            </Box>
            <Box p={1} sx={{ gridColumn: '3 / 4' }}>
              <Typography variant="h6">WebSocket</Typography>
              <Divider />
              <UserOrdersUpdates />
              <Divider />
              <UserOrderHistoryUpdates />
              <Divider />
              <OrderbookUpdates />
              <Divider />
              <TradeUpdates />
              <Divider />
              <AllMarketsUpdates />
              <Divider />
              <CandleUpdates />
            </Box>
          </Box>
        )}
        {tabIndex === 1 && (
          <Box p={2}>
            { address ? `User address is ${address}` : <WalletConnect setAddress={(address: string) => setAddress(address)} /> }
            <Box>
              <Divider />
              <Box>
                <Button onClick={() => setSelectedPage('ContractAPI')}>ContractAPI</Button>
                <Button onClick={() => setSelectedPage('HTTP API')}>HTTP API</Button>
                <Button onClick={() => setSelectedPage('Sockets API')}>Sockets API</Button>
              </Box>
              <Divider />
              {selectedPage === 'ContractAPI' && (
                <Box>
                  <Typography variant="subtitle1">ContractAPI</Typography>
                  <Typography variant="body2">
                    This section provides access to the ContractAPI, allowing you to interact with smart contracts directly.
                  </Typography>
                  <Divider />
                  <VaultDisplayUpdates />
                  <Divider />
                  <DepositVault />
                  <Divider />
                  <WithdrawVault />
                </Box>
              )}
              {selectedPage === 'HTTP API' && (
                <Box>
                  <Typography variant="subtitle1">HTTP API</Typography>
                  <Typography variant="body2">
                    This section provides access to the HTTP API, enabling you to perform RESTful operations.
                  </Typography>
                  <Divider />
                  <VaultInfoDisplay />
                  <Divider />
                </Box>
              )}
              {selectedPage === 'Sockets API' && (
                <Box>
                  <Typography variant="subtitle1">Sockets API</Typography>
                  <Typography variant="body2">
                    This section provides access to the Sockets API, allowing real-time data streaming and updates.
                  </Typography>
                  <Divider />
                  <VaultDisplayUpdates />
                  <Divider />
                  <VaultValueHistoryUpdates />
                </Box>
              )}
            </Box>
          </Box>
        )}
      </ClientAddressContext.Provider>
    </OnchainLobClientContext.Provider>
  );
}

export default App;
