import meow = require('meow');
import path = require('path');

import { Worker } from './worker';

const cli = meow(`
Usage
$ ${path.basename(__filename)} <path-to-models>
`);

const MODELS_PATH = cli.input[0];

Worker.load(MODELS_PATH).listen();
