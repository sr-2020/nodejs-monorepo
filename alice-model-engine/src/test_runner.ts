import * as childProcess from 'child_process';
const args = ['-c../config.json', '../models'];

const child = childProcess.fork(require.resolve('./worker_runner'), args);

process.on('SIGINT', () => {
  console.log('>>> SIGINT');
  child.disconnect();
  process.exit();
});
