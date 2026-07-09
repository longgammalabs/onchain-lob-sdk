import { OnchainLobWebSocketClient } from './onchainLobWebSocketClient';
import { EventEmitter } from '../eventEmitter';
import { ReadyState } from '../webSocketClient';

class FakeSocket {
  events = {
    messageReceived: new EventEmitter<readonly [message: unknown]>(),
    opened: new EventEmitter(),
    closed: new EventEmitter(),
  };

  readyState: ReadyState = ReadyState.Closed;

  connect = jest.fn(async () => {
    this.readyState = ReadyState.Open;
  });

  disconnect = jest.fn(() => {
    this.readyState = ReadyState.Closed;
  });

  send = jest.fn();

  emitClosed(reason = 'test') {
    (this.events.closed as unknown as { emit: (s: unknown, e: unknown) => void }).emit(this, { reason });
  }
}

const createClient = () => {
  const client = new OnchainLobWebSocketClient('wss://example.test');
  const fake = new FakeSocket();
  (client as unknown as { socket: FakeSocket }).socket = fake;
  return { client, fake };
};

const TRADES_SUBSCRIPTION = { channel: 'trades', market: 'X' };

describe('OnchainLobWebSocketClient.isConnected', () => {
  it('is false (does not throw) before the socket has ever connected', () => {
    // Uses the real underlying WebSocketClient, whose readyState previously
    // threw when no socket had been created yet (lazy / connect-on-demand mode).
    const client = new OnchainLobWebSocketClient('wss://example.test');

    expect(() => client.isConnected).not.toThrow();
    expect(client.isConnected).toBe(false);
  });
});

describe('OnchainLobWebSocketClient.reconnect', () => {
  it('performs the initial connect when the client was never started', async () => {
    const { client, fake } = createClient();

    await client.reconnect();

    expect(fake.connect).toHaveBeenCalledTimes(1);
    expect(client.isConnected).toBe(true);
    expect(client.isStarted).toBe(true);
  });

  it('reopens the socket and re-sends existing subscriptions after a drop', async () => {
    const { client, fake } = createClient();
    await client.start();
    client.subscribe(TRADES_SUBSCRIPTION);

    // Socket drops while the tab is hidden.
    fake.readyState = ReadyState.Closed;
    fake.connect.mockClear();
    fake.send.mockClear();

    await client.reconnect();

    expect(fake.connect).toHaveBeenCalledTimes(1);
    expect(client.isConnected).toBe(true);
    expect(fake.send).toHaveBeenCalledWith({ method: 'subscribe', subscription: TRADES_SUBSCRIPTION });
  });

  it('is a no-op when the socket is already open', async () => {
    const { client, fake } = createClient();
    await client.start();
    fake.connect.mockClear();

    await client.reconnect();

    expect(fake.connect).not.toHaveBeenCalled();
  });

  it('deduplicates overlapping connects into a single socket connect', async () => {
    const { client, fake } = createClient();

    // Hold the socket in a connecting state so both connect() calls overlap.
    let finishConnect!: () => void;
    fake.connect.mockImplementation(() => new Promise<void>(resolve => {
      finishConnect = () => {
        fake.readyState = ReadyState.Open;
        resolve();
      };
    }));

    const connect = () => (client as unknown as { connect(): Promise<void> }).connect();
    const first = connect();
    const second = connect();

    finishConnect();
    await Promise.all([first, second]);

    expect(fake.connect).toHaveBeenCalledTimes(1);
  });

  it('cancels the pending backoff reconnect so the socket connects only once', async () => {
    jest.useFakeTimers();
    try {
      const { client, fake } = createClient();
      await client.start();

      // Socket dropped → background loop schedules a backoff reconnect.
      fake.readyState = ReadyState.Closed;
      fake.emitClosed();
      fake.connect.mockClear();

      await client.reconnect();
      expect(fake.connect).toHaveBeenCalledTimes(1);

      // The previously-scheduled backoff attempt must not fire a second connect.
      await jest.advanceTimersByTimeAsync(120000);
      expect(fake.connect).toHaveBeenCalledTimes(1);
    }
    finally {
      jest.useRealTimers();
    }
  });
});
