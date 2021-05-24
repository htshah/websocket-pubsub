/* eslint-disable no-undef */
import WebSocket from 'ws';
import WebsocketPubSub from '../src';
import { handleSocketClose } from './utils';

const WebsocketServer = WebSocket.Server;

const PORT = 50123;
const PORT_UNRESPONSIVE = 50124;

const URL = `ws://localhost:${PORT}`;

beforeEach(() => {
  // Add WebSocket to global as nodejs
  // does not support it natively.
  global.WebSocket = WebSocket;
});

afterEach(() => {
  // Remove the global WebSocket object
  // that we
  delete global.WebSocket;

  jest.restoreAllMocks();
});

describe('testing the constructor', () => {
  test('creates a new WebsocketPubSub instance', (done) => {
    const wss = new WebsocketServer({
      port: PORT,
    });

    const ws = new WebsocketPubSub({
      url: URL,
    });

    ws.ws.addEventListener('open', () => {
      expect(ws).toBeInstanceOf(WebsocketPubSub);
      ws.close();
    });

    handleSocketClose(ws, wss, done);
  });

  test('throws error for no url', () => {
    expect(() => {
      // eslint-disable-next-line no-new
      new WebsocketPubSub();
    }).toThrow('WebsocketPubSub: url not provided.');
  });
});
