#!/usr/bin/env node
var WebSocketServer = require('websocket').server;
var http = require('http');

var redis = require("redis");
var client = redis.createClient({
  host:"redis-18915.c10.us-east-1-2.ec2.cloud.redislabs.com",
  port:"18915",
  password:"robot"
});


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

var ui = null

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    if (request.requestedProtocols[0] == "ui") {
      ui = request.accept('ui', request.origin);
      console.log((new Date()) + ' Connection accepted.');
      ui.on('message', function(message) {
          client.set("FromUI",message.utf8Data);
      });

      ui.on('close', function(reasonCode, description) {
          console.log((new Date()) + ' Peer ' + ui.remoteAddress + ' disconnected.');
          ui = null;
      });
    }
});
