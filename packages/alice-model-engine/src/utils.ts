import glob = require('glob');
import { merge as _merge, clone, assign } from 'lodash';
import * as Path from 'path';
import Logger from './logger';
import { ModelCallbacks } from '@sr2020/interface/callbacks';
import { EmptyModel } from '@sr2020/interface/models/alice-model-engine';

export function loadModels<T extends EmptyModel>(dir: string): ModelCallbacks<T> {
  return requireDir(dir, (m: ModelCallbacks<T>, src: any) => {
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
  // First filter is a bit of hack. When run under ts-node, require.extensions will include '.ts'.
  // In the same time, we don't want to 'require' .d.ts files. Unfortunately, *.ts mask _will_ discover them.
  const files = glob
    .sync(`${dir}/**/*+(${extensions})`)
    .filter((f) => !f.endsWith('.d.ts'))
    .filter((f) => !(f.endsWith('.spec.ts') || f.endsWith('.spec.js')));

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
