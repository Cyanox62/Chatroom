const http = require('http');
const WebSocketServer = require('websocket').server;
const server = http.createServer();

var sockets = [];
var clientCount = 0;

const port = 9898;

server.listen(port);
console.log(`Listening on port ${port}.`);

const wsServer = new WebSocketServer({
    httpServer: server
});

wsServer.on('request', function(request) {
    const connection = request.accept(null, request.origin);
    console.log("Received connection from " + request.host);
    connection.id = clientCount;
    clientCount++;
    sockets.push(connection);
    connection.sendUTF(connection.id);

    connection.on('message', function(message) {
        var data = JSON.parse(message.utf8Data)
        sockets.forEach(function (s, i) {
            if (data["id"] != Number(i)) {
                s.sendUTF(message.utf8Data);
            }
        });
    });

    connection.on('close', function(reasonCode, description) {
        console.log(`Client ${connection.id} has disconnected.`);
        sockets.pop(connection);
    });
});

setInterval(function() {
    sockets.forEach(function (s, i) {
        let obj = 
        {
          'type': 'clientcount',
          'value': sockets.length
        };
        s.sendUTF(JSON.stringify(obj));
    });
}, 3000);