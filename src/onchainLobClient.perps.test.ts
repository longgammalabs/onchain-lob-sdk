// The vault WebSocket service starts immediately regardless of options, so stub
// the `ws` socket to keep the test off the network.
jest.mock('ws', () => ({
  WebSocket: class {
    readyState = 0;
    on() { return this; }
    off() { return this; }
    once() { return this; }
    addEventListener() {}
    removeEventListener() {}
    removeAllListeners() { return this; }
    close() {}
    send() {}
  },
}));

import { OnchainLobClient } from './onchainLobClient';
import { OnchainLobPerps } from './perps';

const createClient = (perps?: ConstructorParameters<typeof OnchainLobClient>[0]['perps']) =>
  new OnchainLobClient({
    apiBaseUrl: 'https://example.test',
    webSocketApiBaseUrl: 'wss://example.test',
    signer: null,
    webSocketConnectImmediately: false,
    perps,
  });

describe('OnchainLobClient.perps', () => {
  it('exposes the perps module next to spot and vault', () => {
    const client = createClient();
    expect(client.perps).toBeInstanceOf(OnchainLobPerps);
    expect(client.spot).toBeDefined();
    expect(client.vault).toBeDefined();
    client.dispose();
  });

  it('the mock data source is selected by the client options', async () => {
    const client = createClient({ dataSource: 'mock', mock: { now: 1_791_198_360 } });
    const [market] = await client.perps.getMarkets();

    expect(market!.name).toBe('WETH-tUSDC-PERP');
    expect(client.perps.isConnected).toBe(true);
    client.dispose();
  });

  it('does not open a perps socket until the first subscription by default', () => {
    const client = createClient();
    expect(client.perps.isConnected).toBe(false);
    client.dispose();
  });

  it('forwards setSigner, reconnect and dispose to the perps module', () => {
    const client = createClient();
    const setSigner = jest.spyOn(client.perps, 'setSigner');
    const reconnect = jest.spyOn(client.perps, 'reconnect');

    client.setSigner(null);
    client.reconnect();
    expect(setSigner).toHaveBeenCalledWith(null);
    expect(reconnect).toHaveBeenCalledTimes(1);

    const dispose = jest.fn();
    (client.perps as any)[Symbol.dispose] = dispose;
    client.dispose();
    expect(dispose).toHaveBeenCalledTimes(1);
  });
});
