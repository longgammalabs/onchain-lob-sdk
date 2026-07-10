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

const createClient = () =>
  new OnchainLobClient({
    apiBaseUrl: 'https://example.test',
    webSocketApiBaseUrl: 'wss://example.test',
    signer: null,
    // Do not open sockets in the test — dispose is what we're exercising.
    webSocketConnectImmediately: false,
  });

describe('OnchainLobClient.dispose', () => {
  it('disposes both the spot and vault facades', () => {
    const client = createClient();
    const spotDispose = jest.spyOn(client.spot, Symbol.dispose as never);
    const vaultDispose = jest.spyOn(client.vault, Symbol.dispose as never);

    client.dispose();

    expect(spotDispose).toHaveBeenCalledTimes(1);
    expect(vaultDispose).toHaveBeenCalledTimes(1);
  });

  it('is invocable via the Symbol.dispose protocol', () => {
    const client = createClient();
    const disposeSpy = jest.spyOn(client, 'dispose');

    client[Symbol.dispose]();

    expect(disposeSpy).toHaveBeenCalledTimes(1);
  });

  it('does not throw when the sockets were never started', () => {
    const client = createClient();
    expect(() => client.dispose()).not.toThrow();
  });
});
