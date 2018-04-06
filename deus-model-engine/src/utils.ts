import glob = require('glob');
import { merge as _merge } from 'lodash'
import * as Path from 'path';
import Logger from './logger';

export function requireDir(dir: string, merge = _merge): any {
    const extensions = Object.keys(require.extensions).join('|');
    const files = glob.sync(`${dir}/**/*+(${extensions})`);

    return files.reduce((m, f) => {
        let src;
        try {
            Logger.info('engine', `Loading model from file ${f}`);
            src = require(f);
        } catch (e) {
            Logger.warn('engine', `Haven't managed to load models from ${f}, trying file ${Path.join(process.cwd(), f)}`);
            src = require(Path.join(process.cwd(), f));
        }

        if (typeof src == 'function') {
            src = src();
        }

        return merge(m, src);
    }, {});
}
