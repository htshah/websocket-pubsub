var WebsocketPubSub = (function () {
  'use strict';

  function log() {
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
    this.ws = this._createObj(url);

    var defaultOptions = {
      reconnect: true,
      attempts: 5,
      timeout: 3000,
      buffer: true,
      url: url
    }; // Overwrite default options

    this._options = updateDefaults(defaultOptions, userOptions || {});
    log('✔ Configured:', this._options);

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
    _buffer: [],
    _lastPing: false,
    _stillConnected: false,
    _createObj: function _createObj(url) {
      // Use MozWebSocket if browser is Firefox
      var Socket = 'MozWebSocket' in window ? window.MozWebSocket : window.WebSocket; // Create a new Socket object

      return new Socket(url);
    },
    _init: function _init() {
      var _this = this;

      this.isOpen = false;

      this.ws.onopen = function () {
        _this.isOpen = true; // Bind events

        _this._onMessage();

        _this.ws.onclose = _this._onClose;

        _this._onError(); // Send buffered messages.


        _this._emitBuffered(); // Continuously check if server is still
        // connected or not.
        //! __ is a reserved channel name.


        _this._key = _this.subscribe('__', function (data) {
          if (data === 'ping' || data === 'pong') {
            _this._stillConnected = true;
          }
        });
        _this._pingLoop = setInterval(function () {
          if (_this._lastPing !== false && !_this._stillConnected) {
            _this._onClose(); // Close connection


            return;
          }

          _this._lastPing = true;
          _this._stillConnected = false;

          _this.emit('__', 'ping');
        }, _this._options.timeout);
      }; // Autoclose after a timeout if no connection can be made


      setTimeout(function () {
        if (_this.ws !== null && (_this.ws.readyState === 0 || _this.ws.readyState === 3)) {

          _this._onClose();
        }
      }, this._options.timeout);
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
    _onClose: function _onClose() {
      clearInterval(this._pingLoop);

      if (this._options.reconnect && this._options.attempts > 0) {
        this._options.attempts -= 1;
        this.unsubscribe(this._key);
        this.ws = this._createObj(this._options.url);

        this._init();
      }
    },
    _onError: function _onError() {
      this.ws.onerror = function () {
      };
    },
    emit: function emit(channel, payload) {
      var parsedPayload = JSON.stringify(payload);
      var msg = channel + " " + parsedPayload;

      if (this.isOpen) {
        this.ws.send(msg);
      } else if (this._options.buffer) {
        this._buffer.push(msg);
      }
    },
    _emitBuffered: function _emitBuffered() {
      var _this3 = this;

      if (this.isOpen && this._buffer.length > 0) {
        this._buffer.forEach(function (msg) {

          _this3.ws.send(msg);
        });

        this._buffer = [];
      }
    },
    subscribe: function subscribe(channel, cb) {
      var sub = this._sub;
      this._uid += 1;
      sub[channel] = sub[channel] || {};
      sub[channel][this._uid] = cb;
      return channel + " " + this._uid;
    },
    unsubscribe: function unsubscribe(key) {
      if (key === undefined) {
        return;
      }
      var parsedKey = split(key, ' ');
      var channel = parsedKey[0];
      var uid = parsedKey[1]; // Remove cb from the channel's list.

      delete this._sub[channel][uid];
    }
  };

  return WebsocketPubSub;

}());
//# sourceMappingURL=websocket-pubsub.js.map
