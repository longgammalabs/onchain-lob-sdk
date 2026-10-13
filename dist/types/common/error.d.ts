/**
 * A base class for all errors thrown by the Onchain LOB TypeScript SDK.
 *
 * @class OnchainLobError
 * @extends Error
 */
export declare abstract class OnchainLobError extends Error {
    readonly name: string;
    /**
     * Creates a new OnchainLobError.
     *
     * @param {string} [message] - The error message.
     * @param {ErrorOptions} [options] - The error options.
     */
    constructor(message?: string, options?: ErrorOptions);
}
