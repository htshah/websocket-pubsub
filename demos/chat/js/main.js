$(function() {
  var ws = new WebsocketPubSub("ws://websocket-pubsub-server.herokuapp.com", {
    reconnect: false,
    timeout: 10000
  });

  ws.subscribe("message", function(msg) {
    addMsgToChatBox(JSON.parse(msg));
  });

  var $chatBoxBody = $(".chat-box__body");

  $(".chat-box__input").keydown(function(e) {
    var $this = $(this);
    var msg = $this.val();
    var parsedMsg = {
      author: authorName,
      message: msg
    };
    if (msg.trim().length > 0 && (e.which == 10 || e.which == 13)) {
      ws.emit("broadcast", parsedMsg);
      parsedMsg.author = "You";
      addMsgToChatBox(parsedMsg, true);
      $this.val("");
    }
  });

  function addMsgToChatBox(msg, self) {
    var div = $('<div class="chat-box__msg">');
    var author = "<span>" + msg.author + "</span>";
    div.addClass("chat-box__" + (!self ? "other" : "me"));

    div.html("<div>" + author + msg.message + "</div>");

    $chatBoxBody.append(div);

    $chatBoxBody[0].scrollTop = $chatBoxBody[0].scrollHeight;
  }
});
