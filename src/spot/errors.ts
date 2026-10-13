import type { ErrorDescription } from 'ethers';

import { OnchainLobError } from '../common';

export class TransactionFailedError extends OnchainLobError {
  constructor(
    readonly encodedError: string,
    readonly error: ErrorDescription | null,
    options?: ErrorOptions
  ) {
    super(`${error ? `${error.name} [${error.selector}]` : `Unknown error: [${encodedError}]`}`, options);
  }
}

export class UnsupportedMarketMethodError extends OnchainLobError {
  constructor(readonly method: string, readonly market: string) {
    super(`${method} is not supported by the market ${market}`);
  }
}
