import * as glob from 'glob';
import { merge as _merge } from 'lodash';
import * as Path from 'path';
import * as Rx from 'rxjs/Rx';

type AnyFunc = (...args: any[]) => void;

export function stdCallback(resolve: AnyFunc, reject: AnyFunc) {
  return (err: any, data: any) => {
    if (err) {
      reject(err);
    } else {
      resolve(data);
    }
  };
}

export function fromStream<T>(stream, finishEventName = 'end', dataEventName = 'data') {
  stream.pause();

  return new Rx.Observable<T>((observer) => {
    function dataHandler(data) {
      observer.next(data);
    }

    function errorHandler(err) {
      observer.error(err);
    }

    function endHandler() {
      observer.complete();
    }

    stream.addListener(dataEventName, dataHandler);
    stream.addListener('error', errorHandler);
    stream.addListener(finishEventName, endHandler);

    stream.resume();

    return () => {
      stream.removeListener(dataEventName, dataHandler);
      stream.removeListener('error', errorHandler);
      stream.removeListener(finishEventName, endHandler);
    };
  }).publish().refCount();
}

export function requireDir(dir: string, merge = _merge): any {
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

export function delay(t: number) {
  return new Promise((resolve, _reject) => {
    setTimeout(() => resolve(), t);
  });
}
