import React, { useContext, useState } from "react";
import { Button, Container, Typography, Box } from "@mui/material";
import { ClientAddressContext, OnchainLobClientContext } from "./clientContext";
import { Order } from "onchain-lob-sdk";

export const UserOpenOrders: React.FC = () => {
  const [openOrdersData, setOpenOrdersData] = useState<Order[] | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const onchainLobClient = useContext(OnchainLobClientContext);
  const address = useContext(ClientAddressContext);

  const fetchDepositsData = async () => {
    if (!address) {
      alert("Please connect your wallet first");
      return;
    }
    try {
      setIsFetching(true);
      const data = await onchainLobClient.spot.getOrders({
        market: "0xec15d9d316745ebcedaf37e0137678aa20fd5234",
        user: "0x6df692a228f4f16f74f583664a1ef4b375ccff9e",
        // status: "open",
      });
      setOpenOrdersData(data);
      setIsFetching(false);
    } catch (error) {
      console.error("Error fetching deposits data:", error);
    }
  };

  return (
    <Container>
      <Typography variant="h6" component="h3" gutterBottom>
        User Open Orders
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={fetchDepositsData}
        disabled={isFetching}
      >
        Fetch User Open Orders Data
      </Button>
      {openOrdersData && (
        <Box mt={2} mb={2} textAlign="left">
          <Typography variant="body1" component="pre">
            {JSON.stringify(
              openOrdersData,
              (_key, value) =>
                typeof value === "bigint" ? value.toString() : value,
              2
            )}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default UserOpenOrders;
