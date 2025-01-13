import BigNumber from 'bignumber.js';
import { VaultInfo } from '../models';
import { EventEmitter } from '../common';
import { CalculateDepositDetailsSyncParams, CalculateWithdrawDetailsSyncParams, DepositDetails, DepositParams, SubscribeToVaultUpdatesParams, SubscribeToVaultValueHistoryParams, WithdrawDetails, WithdrawParams } from './params';
import { VaultUpdate, VaultValueHistoryUpdate } from '../models';

export class MockVault {
  subscribeParams: SubscribeToVaultUpdatesParams | undefined;

  constructor() {
    this.subscribeParams = undefined;
    setInterval(() => {
      if (this.subscribeParams) {
        this.emitRandomVault();
      }
    }, 7000);
    setInterval(() => {
      if (this.subscribeParams) {
        this.emitRandomHistory();
      }
    }, 8340);
  }

  private emitRandomVault(): void {
    this.events.vaultUpdated.emit([{
      totalAmount: BigInt(Math.floor(Math.random() * 100000)),
      totalUSDValue: Math.random() * 100000,
      pastWeekReturn: Math.random() * 100,
      userUSDValue: this.subscribeParams?.user ? Math.random() * 10000 : undefined,
      userAllTimeEarnedUSDValue: this.subscribeParams?.user ? Math.random() * 5000 : undefined,
      leader: '0x4562393292392393293923',
      vaultPerfomance: {
        pnlPerfomance: Math.random() * 10000,
        maxDrowdownPercentage: Math.random() * 100,
        volume: Math.random() * 1000000,
        profitShare: Math.random() * 100,
      },
    }]);
  }

  private emitRandomHistory(): void {
    this.events.vaultValueHistoryUpdated.emit([{
      pnl: Math.random() * 10000,
      totalUSDValue: Math.random() * 100000,
      time: Date.now(),
      lastTouched: Date.now(),
    }]);
  }

  private emitHistory(): void {
    const timestamps = [1735765200, 1735851600, 1735938000, 1736024400, 1736110800];
    const history = timestamps.map(timestamp => ({
      pnl: Math.random() * 10000,
      totalUSDValue: Math.random() * 100000,
      time: timestamp,
      lastTouched: timestamp,
    }));
    this.events.vaultValueHistoryUpdated.emit(history);
  }

  events = {
    vaultUpdated: new EventEmitter<[data: VaultUpdate[]]>(),
    vaultValueHistoryUpdated: new EventEmitter<[data: VaultValueHistoryUpdate[]]>(),
    subscriptionError: new EventEmitter<[error: string]>(),
  };

  subscribeToVaultUpdates(params: SubscribeToVaultUpdatesParams): void {
    this.subscribeParams = params;
  }

  unsubscribeFromVaultUpdates(): void {
    this.subscribeParams = undefined;
  }

  subscribeToVaultValueHistory(_params: SubscribeToVaultValueHistoryParams): void {
    setTimeout(() => {
      this.emitHistory();
    }, 1500);
  }

  unsubscribeFromVaultValueHistory(): void {
    this.subscribeParams = undefined;
  }

  calculateDepositDetailsSync(params: CalculateDepositDetailsSyncParams): DepositDetails {
    return {
      estTokenReceive: new BigNumber(Math.random() * 1000),
      estFee: new BigNumber(Math.random() * 10),
    } as DepositDetails;
  }

  calculateWithdrawDetailsSync(params: CalculateWithdrawDetailsSyncParams): WithdrawDetails {
    return {
      estTokenReceive: new BigNumber(Math.random() * 1000),
      estFee: new BigNumber(Math.random() * 10),
    } as WithdrawDetails;
  }

  deposit(params: DepositParams): void {
    setTimeout(() => {
      this.emitRandomVault();
      this.emitRandomHistory();
    }, 1000);
  }

  withdraw(params: WithdrawParams): void {
    setTimeout(() => {
      this.emitRandomVault();
      this.emitRandomHistory();
    }, 1000);
  }

  async vaultInfo(): Promise<VaultInfo> {
    return {
      vaultAddress: '0x123123123123123123123123',
      tokens: [
        {
          id: '0x50c42deacd8fc9773493ed674b675be577f2634b',
          name: 'Ether',
          symbol: 'ETH',
          contractAddress: '0x50c42deacd8fc9773493ed674b675be577f2634b',
          decimals: 18,
          roundingDecimals: 6,
          supportsPermit: false,
          iconUrl: null,
          fromOg: false,
        },
        {
          id: '0x29219dd400f2bf60e5a23d13be72b486d4038894',
          name: 'USD Coin',
          symbol: 'USDC',
          contractAddress: '0x29219dd400f2bf60e5a23d13be72b486d4038894',
          decimals: 6,
          roundingDecimals: 6,
          supportsPermit: false,
          iconUrl: null,
          fromOg: false,
        },
        {
          id: 's',
          name: 'Sonic',
          symbol: 'S',
          contractAddress: '0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38',
          decimals: 18,
          roundingDecimals: 6,
          supportsPermit: false,
          iconUrl: null,
          fromOg: false,
        },
      ],
    } as VaultInfo;
  }
}
