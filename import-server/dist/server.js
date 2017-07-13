"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
/**
 * The server.
 *
 * @class Server
 */
class Server {
    /**
     * Bootstrap the application.
     *
     * @class Server
     * @method bootstrap
     * @static
     * @return {ng.auto.IInjectorService} Returns the newly created injector for this app.
     */
    static bootstrap() {
        return new Server();
    }
    /**
     * Constructor.
     *
     * @class Server
     * @constructor
     */
    constructor() {
        //create expressjs application
        this.app = express();
        //configure application
        this.config();
        //add routes
        this.routes();
        //add api
        this.api();
    }
    /**
     * Create REST API routes
     *
     * @class Server
     * @method api
     */
    api() {
        //empty for now
    }
    /**
     * Configure application
     *
     * @class Server
     * @method config
     */
    config() {
        //empty for now
    }
    /**
     * Create router
     *
     * @class Server
     * @method api
     */
    routes() {
        //empty for now
    }
}
exports.Server = Server;
//# sourceMappingURL=server.js.map