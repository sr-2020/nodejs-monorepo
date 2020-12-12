import * as glob from 'glob';
import { assign, clone, merge as _merge } from 'lodash';
import { ModelCallbacks } from '@alice/alice-common/callbacks';
import { EmptyModel } from '@alice/alice-common/models/alice-model-engine';
import { logger } from '@alice/alice-model-engine/logger';

export interface FolderLoader {
  iterate(): Iterable<{ filename: string; module: unknown }>;
}

export function loadModels<T extends EmptyModel>(loader: FolderLoader): ModelCallbacks<T> {
  return requireDir(loader, (m: ModelCallbacks<T>, src: any) => {
    m = clone(m);

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
        continue;
      }

      if (typeof src[fname] != 'function') {
        continue;
      }

      // TODO(aeremin) Separate event and effect callbacks.
      if (m.eventCallbacks?.[fname] && m.eventCallbacks[fname] != src[fname])
        throw new Error(`Event callback with the name ${fname} was already defined!`);
      if (m.effectCallbacks?.[fname] && m.effectCallbacks[fname] != src[fname])
        throw new Error(`Effect callback with the name ${fname} was already defined!`);
    }

    m.eventCallbacks = assign(m.eventCallbacks, src);
    m.effectCallbacks = assign(m.effectCallbacks, src);

    return m;
  });
}

export class WebpackFolderLoader implements FolderLoader {
  constructor(private context: __WebpackModuleApi.RequireContext) {}

  *iterate() {
    for (const filename of this.context.keys()) {
      yield { filename, module: this.context(filename) };
    }
  }
}

export class TestFolderLoader implements FolderLoader {
  constructor(private dir: string) {}

  *iterate() {
    const scriptsExt = 'ts';
    // First filter is a bit of hack. When run under ts-node, require.extensions will include '.ts'.
    // In the same time, we don't want to 'require' .d.ts files. Unfortunately, *.ts mask _will_ discover them.
    const files = glob
      .sync(`${this.dir}/**/*+(${scriptsExt}|*.json)`)
      .filter((f) => !f.endsWith('.d.ts'))
      .filter((f) => !f.endsWith(`.spec${scriptsExt}`));
    for (const filename of files) {
      yield { filename, module: require(filename) };
    }
  }
}

export function requireDir(loader: FolderLoader, merge = _merge): any {
  let result = {};
  // eslint-disable-next-line prefer-const
  for (let { filename, module } of loader.iterate()) {
    // This is to support
    // module.exports = () => {...}
    // kind of exporting.
    if (typeof module == 'function') {
      logger.error(`Wrong export mode is used by ${filename}!`);
      module = module();
    }
    logger.warn(`Loading file ${filename}`);
    result = merge(result, module);
  }
  return result;
}
