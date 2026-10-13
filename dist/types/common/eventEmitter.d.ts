/**
 * PublicEventEmitter is an interface that defines the contract for an event emitter.
 * It allows adding, removing, and removing all event listeners.
 *
 * @template T - A tuple type representing the arguments for the event listeners.
 */
export interface PublicEventEmitter<T extends readonly unknown[]> {
    /**
     * Adds a listener to the event emitter.
     *
     * @param listener - The function to be called when the event is emitted.
     * @returns The instance of the event emitter.
     */
    addListener(listener: (...args: T) => void): this;
    /**
     * Removes a specific listener from the event emitter.
     *
     * @param listener - The function to be removed.
     * @returns The instance of the event emitter.
     */
    removeListener(listener: (...args: T) => void): this;
    /**
     * Removes all listeners from the event emitter.
     *
     * @returns The instance of the event emitter.
     */
    removeAllListeners(): this;
}
export declare class EventEmitter<T extends readonly unknown[]> implements PublicEventEmitter<T> {
    private listeners;
    addListener(listener: (...args: T) => void): this;
    removeListener(listener: (...args: T) => void): this;
    removeAllListeners(): this;
    emit(...args: T): void;
}
export type ToEventEmitter<T> = T extends PublicEventEmitter<infer TArgs> ? EventEmitter<TArgs> : never;
export type ToEventEmitters<T> = T extends Record<infer K, PublicEventEmitter<infer TArgs>> ? Record<K, EventEmitter<TArgs>> : never;
