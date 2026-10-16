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
import { VoidSigner } from 'ethers';

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
  it('has no perps module until it is attached, and says how to attach it', () => {
    const client = createClient();
    expect(client.hasPerps).toBe(false);
    expect(() => client.perps).toThrow('onchain-lob-sdk/perps');
    expect(client.spot).toBeDefined();
    expect(client.vault).toBeDefined();
    client.dispose(); // fine without the module
  });

  it('attaches the module given in the options', () => {
    const client = createClient({ module: OnchainLobPerps });
    expect(client.hasPerps).toBe(true);
    expect(client.perps).toBeInstanceOf(OnchainLobPerps);
    client.dispose();
  });

  it('usePerps attaches the module later and returns the same instance on a second call', () => {
    const client = createClient();
    const perps = client.usePerps(OnchainLobPerps, { dataSource: 'mock' });

    expect(client.perps).toBe(perps);
    expect(client.usePerps(OnchainLobPerps)).toBe(perps);
    client.dispose();
  });

  it('the module shares the signer of the client, also when it is attached after setSigner', async () => {
    const signer = new VoidSigner('0x9c72ee4ef78d523da2b604214a7d29b983033234');
    const client = createClient();
    client.setSigner(signer);
    const perps = client.usePerps(OnchainLobPerps, { dataSource: 'mock' });
    expect((perps as any).signer).toBe(signer);

    client.setSigner(null);
    expect((perps as any).signer).toBeNull();
    client.dispose();
  });

  it('the mock data source is selected by the client options', async () => {
    const client = createClient({ module: OnchainLobPerps, dataSource: 'mock', mock: { now: 1_791_198_360 } });
    const [market] = await client.perps.getMarkets();

    expect(market!.name).toBe('WETH-tUSDC-PERP');
    expect(client.perps.isConnected).toBe(true);
    client.dispose();
  });

  it('usePerps options override the perps options of the client', async () => {
    const client = createClient({ dataSource: 'api' });
    const perps = client.usePerps(OnchainLobPerps, { dataSource: 'mock' });
    expect((await perps.getMarkets())[0]!.name).toBe('WETH-tUSDC-PERP');
    client.dispose();
  });

  it('does not open a perps socket until the first subscription by default', () => {
    const client = createClient({ module: OnchainLobPerps });
    expect(client.perps.isConnected).toBe(false);
    client.dispose();
  });

  it('client.reconnect() does not open the perps socket of a client that never used perps', () => {
    const client = createClient({ module: OnchainLobPerps });
    const start = jest.spyOn((client.perps as any).onchainLobWebSocketService.onchainLobWebSocketClient, 'start');
    client.reconnect();
    expect(start).not.toHaveBeenCalled();
    client.dispose();
  });

  it('forwards setSigner, reconnect and dispose to the perps module', () => {
    const client = createClient({ module: OnchainLobPerps });
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
