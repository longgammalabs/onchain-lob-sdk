import type {
  VaultTotalValuesUpdateDto,
  VaultDepositActionUpdateDto,
  VaultDepositorUpdateDto,
  VaultHistoryUpdateDto
} from './dtos';
import type {
  SubscribeToVaultTotalValuesParams,
  SubscribeToVaultDepositActionsParams,
  SubscribeToVaultDepositorsParams,
  SubscribeToVaultHistoryParams,
  UnsubscribeFromVaultTotalValuesParams,
  UnsubscribeFromVaultDepositActionsParams,
  UnsubscribeFromVaultDepositorsParams,
  UnsubscribeFromVaultHistoryParams,
  UnsubscribeFromVaultUserDepositActionsParams,
  SubscribeToVaultUserDepositActionsParams
} from './params';
import {
  OnchainLobWebSocketClient, EventEmitter,
  type OnchainLobWebSocketResponseDto, type PublicEventEmitter, type ToEventEmitter
} from '../../common';
import { getErrorLogMessage } from '../../logging';

interface OnchainLobVaultWebSocketServiceEvents {
  vaultTotalValuesUpdated: PublicEventEmitter<readonly [vaultId: string, isSnapshot: boolean, data: VaultTotalValuesUpdateDto]>;
  vaultDepositActionsUpdated: PublicEventEmitter<readonly [vaultId: string, isSnapshot: boolean, data: VaultDepositActionUpdateDto[]]>;
  vaultUserDepositActionsUpdated: PublicEventEmitter<readonly [vaultId: string, isSnapshot: boolean, data: VaultDepositActionUpdateDto[]]>;
  vaultDepositorsUpdated: PublicEventEmitter<readonly [vaultId: string, isSnapshot: boolean, data: VaultDepositorUpdateDto[]]>;
  vaultHistoryUpdated: PublicEventEmitter<readonly [vaultId: string, isSnapshot: boolean, data: VaultHistoryUpdateDto[]]>;
  subscriptionError: PublicEventEmitter<readonly [error: string]>;
}

/**
 * OnchainLobVaultWebSocketService provides methods to interact with the Onchain LOB vault via WebSocket.
 * It allows subscribing and unsubscribing to various vault events.
 */
export class OnchainLobVaultWebSocketService implements Disposable {
  /**
   * Event emitters for various WebSocket events.
   */
  readonly events: OnchainLobVaultWebSocketServiceEvents = {
    vaultTotalValuesUpdated: new EventEmitter(),
    vaultDepositActionsUpdated: new EventEmitter(),
    vaultUserDepositActionsUpdated: new EventEmitter(),
    vaultDepositorsUpdated: new EventEmitter(),
    vaultHistoryUpdated: new EventEmitter(),
    subscriptionError: new EventEmitter(),
  };

  /**
   * The WebSocket client used to communicate with the Onchain LOB vault.
   */
  protected readonly onchainLobWebSocketClient: OnchainLobWebSocketClient;

  /**
   * Creates an instance of OnchainLobVaultWebSocketService.
   * @param baseUrl - The base URL for the WebSocket connection.
   * @param startImmediately - Whether to start the WebSocket client immediately.
   */
  constructor(readonly baseUrl: string, startImmediately = true) {
    this.onchainLobWebSocketClient = new OnchainLobWebSocketClient(baseUrl);
    this.onchainLobWebSocketClient.events.messageReceived.addListener(this.onSocketMessageReceived);
    if (startImmediately)
      this.startOnchainLobWebSocketClientIfNeeded();
  }

  /**
   * Subscribes to vault total values updates.
   * @param params - The parameters for the vault total values subscription.
   */
  subscribeToVaultTotalValues(params: SubscribeToVaultTotalValuesParams) {
    this.startOnchainLobWebSocketClientIfNeeded();

    this.onchainLobWebSocketClient.subscribe({
      channel: 'vaultTotalValues',
      vault: params.vault,
    });
  }

  /**
   * Unsubscribes from vault total values updates.
   * @param params - The parameters for the vault total values unsubscription.
   */
  unsubscribeFromVaultTotalValues(params: UnsubscribeFromVaultTotalValuesParams) {
    this.onchainLobWebSocketClient.unsubscribe({
      channel: 'vaultTotalValues',
      vault: params.vault,
    });
  }

  /**
   * Subscribes to vault deposit actions updates.
   * @param params - The parameters for the vault deposit actions subscription.
   */
  subscribeToVaultDepositActions(params: SubscribeToVaultDepositActionsParams) {
    this.startOnchainLobWebSocketClientIfNeeded();

    this.onchainLobWebSocketClient.subscribe({
      channel: 'vaultDepositActions',
      vault: params.vault,
    });
  }

  /**
   * Unsubscribes from vault deposit actions updates.
   * @param params - The parameters for the vault deposit actions unsubscription.
   */
  unsubscribeFromVaultDepositActions(params: UnsubscribeFromVaultDepositActionsParams) {
    this.onchainLobWebSocketClient.unsubscribe({
      channel: 'vaultDepositActions',
      vault: params.vault,
    });
  }

  /**
   * Subscribes to user's vault deposit actions updates.
   * @param params - The parameters for the user`s vault deposit actions subscription.
   */
  subscribeToVaultUserDepositActions(params: SubscribeToVaultUserDepositActionsParams) {
    this.startOnchainLobWebSocketClientIfNeeded();

    this.onchainLobWebSocketClient.subscribe({
      channel: 'userDepositActions',
      vault: params.vault,
    });
  }

  /**
   * Unsubscribes from user's vault deposit actions updates.
   * @param params - The parameters for the user's vault deposit actions unsubscription.
   */
  unsubscribeFromVaultUserDepositActions(params: UnsubscribeFromVaultUserDepositActionsParams) {
    this.onchainLobWebSocketClient.unsubscribe({
      channel: 'userDepositActions',
      vault: params.vault,
    });
  }

  /**
   * Subscribes to vault depositors updates.
   * @param params - The parameters for the vault depositors subscription.
   */
  subscribeToVaultDepositors(params: SubscribeToVaultDepositorsParams) {
    this.startOnchainLobWebSocketClientIfNeeded();

    this.onchainLobWebSocketClient.subscribe({
      channel: 'vaultDepositors',
      vault: params.vault,
    });
  }

  /**
   * Unsubscribes from vault depositors updates.
   * @param params - The parameters for the vault depositors unsubscription.
   */
  unsubscribeFromVaultDepositors(params: UnsubscribeFromVaultDepositorsParams) {
    this.onchainLobWebSocketClient.unsubscribe({
      channel: 'vaultDepositors',
      vault: params.vault,
    });
  }

  /**
   * Subscribes to vault history updates.
   * @param params - The parameters for the vault history subscription.
   */
  subscribeToVaultHistory(params: SubscribeToVaultHistoryParams) {
    this.startOnchainLobWebSocketClientIfNeeded();

    this.onchainLobWebSocketClient.subscribe({
      channel: 'vaultHistory',
      vault: params.vault,
    });
  }

  /**
   * Unsubscribes from vault history updates.
   * @param params - The parameters for the vault history unsubscription.
   */
  unsubscribeFromVaultHistory(params: UnsubscribeFromVaultHistoryParams) {
    this.onchainLobWebSocketClient.unsubscribe({
      channel: 'vaultHistory',
      vault: params.vault,
    });
  }

  /**
   * Disposes the WebSocket client and removes the message listener.
   */
  [Symbol.dispose]() {
    this.onchainLobWebSocketClient.events.messageReceived.removeListener(this.onSocketMessageReceived);
    this.onchainLobWebSocketClient.stop();
  }

  /**
   * Starts the WebSocket client if it is not already started.
   */
  protected startOnchainLobWebSocketClientIfNeeded() {
    this.onchainLobWebSocketClient.start()
      .catch(error => console.error(`Onchain LOB Web Socket has not been started. Error = ${getErrorLogMessage(error)}`));
  }

  /**
   * Handles incoming WebSocket messages and emits the appropriate events.
   * @param message - The WebSocket message received.
   */
  protected readonly onSocketMessageReceived = (message: OnchainLobWebSocketResponseDto) => {
    try {
      if (!message.data)
        return;
      switch (message.channel) {
        case 'vaultTotalValues':
          (this.events.vaultTotalValuesUpdated as ToEventEmitter<typeof this.events.vaultTotalValuesUpdated>)
            .emit(message.id, message.isSnapshot, (message.data as VaultTotalValuesUpdateDto[])[0]!);
          break;
        case 'vaultDepositActions':
          (this.events.vaultDepositActionsUpdated as ToEventEmitter<typeof this.events.vaultDepositActionsUpdated>)
            .emit(message.id, message.isSnapshot, message.data as VaultDepositActionUpdateDto[]);
          break;
        case 'userDepositActions':
          (this.events.vaultUserDepositActionsUpdated as ToEventEmitter<typeof this.events.vaultUserDepositActionsUpdated>)
            .emit(message.id, message.isSnapshot, message.data as VaultDepositActionUpdateDto[]);
          break;
        case 'vaultDepositors':
          (this.events.vaultDepositorsUpdated as ToEventEmitter<typeof this.events.vaultDepositorsUpdated>)
            .emit(message.id, message.isSnapshot, message.data as VaultDepositorUpdateDto[]);
          break;
        case 'vaultHistory':
          (this.events.vaultHistoryUpdated as ToEventEmitter<typeof this.events.vaultHistoryUpdated>)
            .emit(message.id, message.isSnapshot, message.data as VaultHistoryUpdateDto[]);
          break;
        case 'error':
          (this.events.subscriptionError as ToEventEmitter<typeof this.events.subscriptionError>).emit(message.data as string);
          break;
        case 'subscriptionResponse':
          break;
        default:
          console.warn('Unknown channel in the socket message handler.', message.channel);
      }
    }
    catch (error: unknown) {
      console.error('Unknown error in the socket message handler.', getErrorLogMessage(error));
    }
  };
}
