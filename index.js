#!/usr/bin/env node
var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8083, function() {
    console.log((new Date()) + ' Server is listening on port 8083');
});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

var robot = null
var ui = null

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    if (request.requestedProtocols[0] == "robot") {
      robot = request.accept('robot', request.origin);
      console.log((new Date()) + ' Connection accepted.');
      robot.on('message', function(message) {
        if (ui != null) {
            ui.sendUTF(message.utf8Data);
        }
      });

      robot.on('close', function(reasonCode, description) {
          console.log((new Date()) + ' Peer ' + robot.remoteAddress + ' disconnected.');
          robot = null;
      });
    } else {
      var ui = request.accept('ui', request.origin);
      console.log((new Date()) + ' Connection accepted.');
      ui.on('message', function(message) {
        if (robot != null) {
          robot.sendUTF(message.utf8Data);
        }
      });

      ui.on('close', function(reasonCode, description) {
          console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
          ui = null;
      });
    }
});
