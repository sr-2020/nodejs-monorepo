import meow = require('meow');
import path = require('path');

import { Worker } from './worker';
import * as config from './config'

const cli = meow(`
Usage
$ ${path.basename(__filename)} <path-to-models> -c <path-to-config>
`);

if (!(cli.input.length && cli.flags.c)) {
    cli.showHelp(1);
}

const MODELS_PATH = cli.input[0];
const CONFIG_PATH = cli.flags.c;

const CONFIG = require(CONFIG_PATH);

let worker = Worker
    .load(MODELS_PATH)
    .configure(config.Config.parse(CONFIG))
    .listen()
