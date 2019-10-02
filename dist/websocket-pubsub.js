var WebsocketPubSub = (function () {
  'use strict';

  function log() {
    // eslint-disable-next-line no-unused-expressions,no-undef,no-console
     console.log.apply(null, arguments);
  }
  /**
   * Overwrites all the values in 'a' by values
   * in 'b' and returns a new object containing
   * new values.
   *
   * @param {Object} a Object in which overwrites will happen
   * @param {Object} b Object from which new values will be taken
   */

  function updateDefaults(a, b) {
    var temp = {};
    Object.keys(a).forEach(function (key) {
      // eslint-disable-next-line no-prototype-builtins
      temp[key] = b.hasOwnProperty(key) ? b[key] : a[key];
    });
    return temp;
  }
  function split(str, delimiter) {
    var pos = str.indexOf(delimiter);
    return [str.substr(0, pos), str.substr(pos + 1)];
  }

  var WebsocketPubSub = function WebsocketPubSub(url, userOptions) {
    log('🚀 Creating a websocket...');
    this.ws = this._createObj(url);
    log('🧰 Configuring...'); // Default options

    var defaultOptions = {
      reconnect: true,
      attempts: 5,
      timeout: 3000
    }; // Overwrite default options

    this.options = updateDefaults(defaultOptions, userOptions || {});
    log('✔ Configured:', this.options);

    this._init();
  };

  WebsocketPubSub.prototype = {
    _uid: -1,
    // Stores last UID generated
    _delimiter: ' ',
    // Delimiter for channel
    _sub: {},
    // Stores list of subscriptions for each channels registered.
    isOpen: false,
    // Tells whether the websocket is connected or not.
    _createObj: function _createObj(url) {
      // Use MozWebSocket if browser is Firefox
      var Socket = 'MozWebSocket' in window ? window.MozWebSocket : window.WebSocket; // Create a new Socket object

      return new Socket(url);
    },
    _init: function _init() {
      var _this = this;

      this.ws.onopen = function () {
        log('Connection opened');
        _this.isOpen = true; // Bind events

        _this._onMessage();
      };
    },
    _onMessage: function _onMessage() {
      var _this2 = this;

      this.ws.onmessage = function (event) {
        log("Received: " + event.data); // Separate channel and payload;

        var parsedData = split(event.data, _this2._delimiter);
        var channel = parsedData[0];
        var payload = parsedData[1]; // Invoke all the callbacks for given
        // channel.

        var cbs = _this2._sub[channel];
        Object.keys(cbs).map(function (k) {
          return cbs[k](payload, event);
        });
      };
    },
    emit: function emit(channel, payload) {
      log("Emitting: " + payload);
      this.isOpen && this.ws.send(channel + " " + payload);
    },
    subscribe: function subscribe(channel, cb) {
      log("Subscribing to " + channel);
      var sub = this._sub;
      sub[channel] = sub[channel] || {};
      sub[channel][++this._uid] = cb;
      return channel + " " + this._uid;
    },
    unsubscribe: function unsubscribe(key) {
      log("Unsubscribing from " + key);
      var parsedKey = split(key, ' ');
      var channel = parsedKey[0];
      var uid = parsedKey[1]; // Remove cb from the channel's list.

      delete this._sub[channel][uid];
    }
  };

  return WebsocketPubSub;

}());
