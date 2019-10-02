import { log, updateDefaults, split } from './utils';

const WebsocketPubSub = function(url, userOptions) {
  log('🚀 Creating a websocket...');
  this.ws = this._createObj(url);

  log('🧰 Configuring...');

  // Default options
  const defaultOptions = {
    reconnect: true,
    attempts: 5,
    timeout: 3000
  };

  // Overwrite default options
  this.options = updateDefaults(defaultOptions, userOptions || {});
  log('✔ Configured:', this.options);

  this._init();
};

WebsocketPubSub.prototype = {
  _uid: -1, // Stores last UID generated
  _delimiter: ' ', // Delimiter for channel
  _sub: {}, // Stores list of subscriptions for each channels registered.
  isOpen: false, // Tells whether the websocket is connected or not.
  _createObj(url) {
    // Use MozWebSocket if browser is Firefox
    const Socket =
      'MozWebSocket' in window ? window.MozWebSocket : window.WebSocket;

    // Create a new Socket object
    return new Socket(url);
  },
  _init() {
    this.ws.onopen = () => {
      log('Connection opened');
      this.isOpen = true;
      // Bind events
      this._onMessage();
    };
  },
  _onMessage() {
    this.ws.onmessage = (event) => {
      log(`Received: ${event.data}`);

      // Separate channel and payload;
      const parsedData = split(event.data, this._delimiter);
      const channel = parsedData[0];
      const payload = parsedData[1];

      // Invoke all the callbacks for given
      // channel.
      const cbs = this._sub[channel];
      Object.keys(cbs).map((k) => cbs[k](payload, event));
    };
  },
  emit(channel, payload) {
    log(`Emitting: ${payload}`);
    if (this.isOpen) {
      this.ws.send(`${channel} ${payload}`);
    }
  },
  subscribe(channel, cb) {
    log(`Subscribing to ${channel}`);
    const sub = this._sub;
    this._uid += 1;
    sub[channel] = sub[channel] || {};
    sub[channel][this._uid] = cb;

    return `${channel} ${this._uid}`;
  },
  unsubscribe(key) {
    log(`Unsubscribing from ${key}`);
    const parsedKey = split(key, ' ');
    const channel = parsedKey[0];
    const uid = parsedKey[1];

    // Remove cb from the channel's list.
    delete this._sub[channel][uid];
  }
};

export default WebsocketPubSub;
