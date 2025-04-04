import type { ErrorDescription } from 'ethers';
import { OnchainLobError } from '../common';
export declare class TransactionFailedError extends OnchainLobError {
    readonly encodedError: string;
    readonly error: ErrorDescription | null;
    constructor(encodedError: string, error: ErrorDescription | null, options?: ErrorOptions);
}
