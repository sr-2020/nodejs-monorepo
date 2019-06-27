import glob = require('glob');
import { merge as _merge, clone, assign } from 'lodash';
import * as Path from 'path';
import Logger from './logger';
import { Model } from './model';

export function loadModels(dir: string): Model {
  return requireDir(dir, (m: Model, src: any) => {
    m = clone(m);
    src = clone(src);

    if (!m.viewModelCallbacks) m.viewModelCallbacks = {};
    if (!m.preprocessCallbacks) m.preprocessCallbacks = [];

    if (src._view) {
      m.viewModelCallbacks.default = src._view;
      delete src._view;
    }

    if (src._preprocess) {
      m.preprocessCallbacks.push(src._preprocess);
      delete src._preprocess;
    }

    for (const fname in src) {
      if (fname.startsWith('view_')) {
        m.viewModelCallbacks[fname.substr('view_'.length)] = src[fname];
        delete src[fname];
      }
    }

    m.callbacks = assign({}, m.callbacks, src);

    return m;
  });
}

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
