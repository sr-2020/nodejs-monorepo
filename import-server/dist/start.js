"use strict";
//module dependencies
var server = require("server");
var debug = require("debug")("express:server");
var http = require("http");
//create http server
var httpPort = 8080;
var app = server.Server.bootstrap().app;
app.set("port", httpPort);
var httpServer = http.createServer(app);
//listen on provided ports
httpServer.listen(httpPort);
//add error handler
httpServer.on("error", onError);
//start listening on port
httpServer.on("listening", onListening);
/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
    if (error.syscall !== "listen") {
        throw error;
    }
    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            console.error("Port 8000 requires elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error("Port 8000 is already in use");
            process.exit(1);
            break;
        default:
            throw error;
    }
}
/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    var addr = httpServer.address();
    var bind = "port " + addr.port;
    debug("Listening on " + bind);
}
//# sourceMappingURL=start.js.map