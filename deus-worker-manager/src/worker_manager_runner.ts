import * as path from 'path';
import * as meow from 'meow';
import Manager from './manager';

const cli = meow(`
Usage
$ ${path.basename(__filename)} -c <path-to-config>
`);

if (!cli.flags.c) {
    cli.showHelp(1);
}

const CONFIG_PATH = cli.flags.c;

const CONFIG = require(CONFIG_PATH);

let manager = new Manager(CONFIG);
