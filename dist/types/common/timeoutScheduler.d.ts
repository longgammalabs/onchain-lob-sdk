/**
 * TimeoutScheduler is a utility class that manages the scheduling of actions with specified timeouts.
 * It allows you to set timeouts for actions and automatically handles the expiration of these timeouts.
 *
 * @param {number[]} timeouts - An array of timeout durations in milliseconds.
 * @param {number} [counterExpirationMs] - Optional duration in milliseconds after which the counter resets.
 *
 * Usage:
 *
 * const scheduler = new TimeoutScheduler([1000, 2000, 3000], 5000);
 *
 * scheduler.setTimeout(async () => {
 *   console.log('Action executed after timeout');
 * });
 *
 * // Reset the counter manually if needed
 * scheduler.resetCounter();
 *
 * // Dispose of the scheduler and clear all timeouts
 * scheduler[Symbol.dispose]();
 */
export declare class TimeoutScheduler implements Disposable {
    private readonly timeouts;
    private readonly counterExpirationMs?;
    private counterExpirationWatcherId;
    private actionWatchers;
    private _counter;
    constructor(timeouts: number[], counterExpirationMs?: number | undefined);
    get counter(): number;
    private set counter(value);
    [Symbol.dispose](): void;
    setTimeout(action: () => void | Promise<void>): Promise<void>;
    resetCounter(): void;
    private resetCounterExpiration;
}
