const instances: any[] = [];

jest.mock('../../common', () => {
  const actual = jest.requireActual('../../common');

  class FakeWebSocketClient {
    readonly events = { messageReceived: new actual.EventEmitter() };
    isConnected = false;
    start = jest.fn(() => Promise.resolve());
    stop = jest.fn();
    subscribe = jest.fn();
    unsubscribe = jest.fn();
    reconnect = jest.fn(() => Promise.resolve());

    constructor(readonly baseUrl: string) {
      instances.push(this);
    }
  }

  return { ...actual, OnchainLobWebSocketClient: FakeWebSocketClient };
});

import { OnchainLobPerpsWebSocketService } from './onchainLobPerpsWebSocketService';

const create = (startImmediately = false) => {
  const service = new OnchainLobPerpsWebSocketService('wss://example.test', startImmediately);
  const client = instances[instances.length - 1];
  const receive = (message: { channel: string; id?: string; isSnapshot?: boolean; data?: unknown }) =>
    client.events.messageReceived.emit({ id: 'id', isSnapshot: true, ...message });

  return { service, client, receive };
};

describe('OnchainLobPerpsWebSocketService', () => {
  beforeEach(() => {
    instances.length = 0;
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => jest.restoreAllMocks());

  describe('message routing', () => {
    test.each([
      ['perpMarket', 'perpMarketUpdated', { id: 'm' }],
      ['perpOrderbook', 'perpOrderbookUpdated', { marketId: 'm' }],
    ] as const)('%s goes to %s with the id and the snapshot flag', (channel, event, data) => {
      const { service, receive } = create();
      const listener = jest.fn();
      (service.events[event] as any).addListener(listener);

      receive({ channel, id: '0xmarket', isSnapshot: false, data });
      expect(listener).toHaveBeenCalledWith('0xmarket', false, data);
    });

    test('perpMarket accepts one market or a one-element array', () => {
      const { service, receive } = create();
      const listener = jest.fn();
      service.events.perpMarketUpdated.addListener(listener);

      receive({ channel: 'perpMarket', id: 'm', data: { id: 'a' } });
      receive({ channel: 'perpMarket', id: 'm', data: [{ id: 'b' }] });
      receive({ channel: 'perpMarket', id: 'm', data: [] });

      expect(listener.mock.calls.map(call => call[2])).toEqual([{ id: 'a' }, { id: 'b' }]);
    });

    test('allPerpMarkets accepts an array or one item', () => {
      const { service, receive } = create();
      const listener = jest.fn();
      service.events.allPerpMarketsUpdated.addListener(listener);

      receive({ channel: 'allPerpMarkets', data: [{ id: 'a' }, { id: 'b' }] });
      receive({ channel: 'allPerpMarkets', data: { id: 'c' } });

      expect(listener.mock.calls.map(call => call[1])).toEqual([[{ id: 'a' }, { id: 'b' }], [{ id: 'c' }]]);
    });

    test.each([
      ['perpTrades', 'perpTradesUpdated'],
      ['userPerpAccounts', 'userPerpAccountsUpdated'],
      ['userPerpOrders', 'userPerpOrdersUpdated'],
      ['userPerpFills', 'userPerpFillsUpdated'],
      ['userPerpCollateral', 'userPerpCollateralUpdated'],
    ] as const)('%s goes to %s; a single item is tolerated as an array', (channel, event) => {
      const { service, receive } = create();
      const listener = jest.fn();
      (service.events[event] as any).addListener(listener);

      receive({ channel, id: 'm', data: [{ n: 1 }, { n: 2 }] });
      receive({ channel, id: 'm', isSnapshot: false, data: { n: 3 } });

      expect(listener.mock.calls[0]).toEqual(['m', true, [{ n: 1 }, { n: 2 }]]);
      expect(listener.mock.calls[1]).toEqual(['m', false, [{ n: 3 }]]);
    });

    test('perpCandles carries one candle, the id is the market', () => {
      const { service, receive } = create();
      const listener = jest.fn();
      service.events.perpCandlesUpdated.addListener(listener);

      const candle = { time: 1, open: '1', high: '2', low: '1', close: '2', volume: '3', resolution: '15' };
      receive({ channel: 'perpCandles', id: '0xmarket', isSnapshot: false, data: candle });
      expect(listener).toHaveBeenCalledWith('0xmarket', false, candle);
    });

    test('an error message goes to subscriptionError', () => {
      const { service, receive } = create();
      const listener = jest.fn();
      service.events.subscriptionError.addListener(listener);

      receive({ channel: 'error', data: 'Could not fetch data for subscription: perpTrades.' });
      expect(listener).toHaveBeenCalledWith('Could not fetch data for subscription: perpTrades.');
    });

    test('subscriptionResponse, empty data and unknown channels emit nothing', () => {
      const { service, receive } = create();
      const listeners = Object.values(service.events).map(emitter => {
        const listener = jest.fn();
        (emitter).addListener(listener);

        return listener;
      });

      receive({ channel: 'subscriptionResponse', data: 'Successfully subscribed' });
      receive({ channel: 'perpTrades', data: null });
      receive({ channel: 'perpTrades', data: undefined });
      receive({ channel: 'trades', data: [{}] }); // a spot channel
      for (const listener of listeners)
        expect(listener).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Unknown channel'), 'trades');
    });

    test('a throwing listener does not break the next messages', () => {
      const { service, receive } = create();
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
      const listener = jest.fn();
      service.events.perpTradesUpdated.addListener(() => {
        throw new Error('boom');
      });
      service.events.perpTradesUpdated.addListener(listener);

      expect(() => receive({ channel: 'perpTrades', data: [] })).not.toThrow();
    });
  });

  describe('subscription payloads', () => {
    test('public channels', () => {
      const { service, client } = create();
      service.subscribeToPerpMarket({ market: '0xm' });
      service.subscribeToAllPerpMarkets();
      service.subscribeToPerpOrderbook({ market: '0xm', aggregation: 5 });
      service.subscribeToPerpTrades({ market: '0xm' });
      service.subscribeToPerpCandles({ market: '0xm', resolution: '15' });

      expect(client.subscribe.mock.calls.map((call: unknown[]) => call[0])).toEqual([
        { channel: 'perpMarket', market: '0xm' },
        { channel: 'allPerpMarkets' },
        { channel: 'perpOrderbook', market: '0xm', aggregation: 5 },
        { channel: 'perpTrades', market: '0xm' },
        { channel: 'perpCandles', resolution: '15', market: '0xm' },
      ]);
    });

    test.each([
      ['subscribeToUserPerpAccounts', 'unsubscribeFromUserPerpAccounts', 'userPerpAccounts'],
      ['subscribeToUserPerpOrders', 'unsubscribeFromUserPerpOrders', 'userPerpOrders'],
      ['subscribeToUserPerpFills', 'unsubscribeFromUserPerpFills', 'userPerpFills'],
      ['subscribeToUserPerpCollateral', 'unsubscribeFromUserPerpCollateral', 'userPerpCollateral'],
    ] as const)('%s defaults the market to allMarkets and %s sends the identical payload', (subscribe, unsubscribe, channel) => {
      const { service, client } = create();
      (service as any)[subscribe]({ user: '0xuser' });
      (service as any)[unsubscribe]({ user: '0xuser' });
      (service as any)[subscribe]({ user: '0xuser', market: '0xm' });
      (service as any)[unsubscribe]({ user: '0xuser', market: '0xm' });

      expect(client.subscribe.mock.calls[0]![0]).toEqual({ channel, user: '0xuser', market: 'allMarkets' });
      expect(client.unsubscribe.mock.calls[0]![0]).toEqual(client.subscribe.mock.calls[0]![0]);
      expect(client.subscribe.mock.calls[1]![0]).toEqual({ channel, user: '0xuser', market: '0xm' });
      expect(client.unsubscribe.mock.calls[1]![0]).toEqual(client.subscribe.mock.calls[1]![0]);
    });

    test('the unsubscribe payloads of the public channels equal the subscribe ones', () => {
      const { service, client } = create();
      service.subscribeToPerpOrderbook({ market: '0xm', aggregation: 5 });
      service.unsubscribeFromPerpOrderbook({ market: '0xm', aggregation: 5 });
      service.subscribeToPerpCandles({ market: '0xm', resolution: '1D' });
      service.unsubscribeFromPerpCandles({ market: '0xm', resolution: '1D' });
      service.subscribeToPerpMarket({ market: '0xm' });
      service.unsubscribeFromPerpMarket({ market: '0xm' });
      service.subscribeToAllPerpMarkets();
      service.unsubscribeFromAllPerpMarkets();
      service.subscribeToPerpTrades({ market: '0xm' });
      service.unsubscribeFromPerpTrades({ market: '0xm' });

      expect(client.unsubscribe.mock.calls.map((call: unknown[]) => call[0])).toEqual(client.subscribe.mock.calls.map((call: unknown[]) => call[0]));
    });
  });

  describe('lifecycle', () => {
    test('the socket starts lazily, on the first subscription', () => {
      const { service, client } = create(false);
      expect(client.start).not.toHaveBeenCalled();

      service.subscribeToPerpTrades({ market: '0xm' });
      expect(client.start).toHaveBeenCalledTimes(1);
    });

    test('the socket starts in the constructor when asked', () => {
      const { client } = create(true);
      expect(client.start).toHaveBeenCalledTimes(1);
    });

    test('unsubscribing alone does not start the socket', () => {
      const { service, client } = create(false);
      service.unsubscribeFromPerpTrades({ market: '0xm' });
      expect(client.start).not.toHaveBeenCalled();
    });

    test('reconnect is a no-op until the socket was started', () => {
      const { service, client } = create(false);
      service.reconnect();
      expect(client.reconnect).not.toHaveBeenCalled();

      service.subscribeToPerpTrades({ market: '0xm' });
      service.reconnect();
      expect(client.reconnect).toHaveBeenCalledTimes(1);
    });

    test('reconnect works after an immediate start', () => {
      const { service, client } = create(true);
      service.reconnect();
      expect(client.reconnect).toHaveBeenCalledTimes(1);
    });

    test('isConnected reflects the socket', () => {
      const { service, client } = create();
      expect(service.isConnected).toBe(false);
      client.isConnected = true;
      expect(service.isConnected).toBe(true);
    });

    test('dispose stops the socket and detaches the listener', () => {
      const { service, client, receive } = create();
      const listener = jest.fn();
      service.events.perpTradesUpdated.addListener(listener);

      service[Symbol.dispose]();
      expect(client.stop).toHaveBeenCalledTimes(1);

      receive({ channel: 'perpTrades', data: [] });
      expect(listener).not.toHaveBeenCalled();
    });
  });
});
