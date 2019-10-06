import { log, updateDefaults, split } from './utils';

const WebsocketPubSub = function(url, userOptions) {
  log('🚀 Creating a websocket...');
  this.ws = this._createObj(url);

  log('🧰 Configuring...');

  // Default options
  const defaultOptions = {
    reconnect: true,
    attempts: 5,
    timeout: 3000,
    buffer: true,
    url
  };

  // Overwrite default options
  this._options = updateDefaults(defaultOptions, userOptions || {});
  log('✔ Configured:', this._options);

  this._init();
};

WebsocketPubSub.prototype = {
  _uid: -1, // Stores last UID generated
  _delimiter: ' ', // Delimiter for channel
  _sub: {}, // Stores list of subscriptions for each channels registered.
  isOpen: false, // Tells whether the websocket is connected or not.
  _buffer: [],
  _lastPing: false,
  _stillConnected: false,
  _createObj(url) {
    // Use MozWebSocket if browser is Firefox
    const Socket =
      'MozWebSocket' in window ? window.MozWebSocket : window.WebSocket;

    // Create a new Socket object
    return new Socket(url);
  },
  _init() {
    this.isOpen = false;
    this.ws.onopen = () => {
      log('Connection opened');
      this.isOpen = true;
      // Bind events
      this._onMessage();
      this.ws.onclose = this._onClose;
      this._onError();

      // Send buffered messages.
      this._emitBuffered();

      // Continuously check if server is still
      // connected or not.
      //! __ is a reserved channel name.
      this._key = this.subscribe('__', (data) => {
        if (data === 'ping' || data === 'pong') {
          this._stillConnected = true;
        }
      });

      this._pingLoop = setInterval(() => {
        if (this._lastPing !== false && !this._stillConnected) {
          this._onClose(); // Close connection
          return;
        }
        this._lastPing = true;
        this._stillConnected = false;
        this.emit('__', 'ping');
      }, this._options.timeout);
    };

    // Autoclose after a timeout if no connection can be made
    setTimeout(() => {
      if (
        this.ws !== null &&
        (this.ws.readyState === 0 || this.ws.readyState === 3)
      ) {
        log("Couldn't connect to target. Closing connection...");
        this._onClose();
      }
    }, this._options.timeout);
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
  _onClose() {
    log('❌ Closing');

    clearInterval(this._pingLoop);
    if (this._options.reconnect && this._options.attempts > 0) {
      log(`Reconnecting..`);
      this._options.attempts -= 1;
      this.unsubscribe(this._key);
      this.ws = this._createObj(this._options.url);
      this._init();
    } else {
      log('✔ Closed');
    }
  },
  _onError() {
    this.ws.onerror = () => {
      log('Some error occured');
    };
  },
  emit(channel, payload) {
    log(`Emitting: ${payload}`);
    const parsedPayload =
      typeof payload === 'object' ? JSON.stringify(payload) : payload;
    const msg = `${channel} ${parsedPayload}`;
    if (this.isOpen) {
      this.ws.send(msg);
    } else if (this._options.buffer) {
      this._buffer.push(msg);
    }
  },
  _emitBuffered() {
    if (this.isOpen && this._buffer.length > 0) {
      this._buffer.forEach((msg) => {
        log(`Emitting buffered: ${msg}`);
        this.ws.send(msg);
      });
      this._buffer = [];
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
    if (key === undefined) {
      return;
    }
    log(`Unsubscribing from ${key}`);
    const parsedKey = split(key, ' ');
    const channel = parsedKey[0];
    const uid = parsedKey[1];

    // Remove cb from the channel's list.
    delete this._sub[channel][uid];
  }
};

export default WebsocketPubSub;
