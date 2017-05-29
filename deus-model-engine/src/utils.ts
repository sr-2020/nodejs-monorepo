import glob = require('glob');
import { merge } from 'lodash'
import * as Path from 'path';

export function requireDir(dir: string): any {
    const extensions = Object.keys(require.extensions).join('|');
    const files = glob.sync(`${dir}/**/*+(${extensions})`);

    return files.reduce((m, f) => {
        let src;

        try {
            src = require(f);
        } catch (e) {
            src = require(Path.join(process.cwd(), f));
        }

        if (typeof src == 'function') {
            src = src();
        }

        return merge(m, src);
    }, {});

}
