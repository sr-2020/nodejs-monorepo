const ChildProcess = require('child_process');
const args = ['-c../config.json', '../models'];

const child = ChildProcess.fork(require.resolve('./worker_runner'), args);

process.on('SIGINT', () => {
  console.log('>>> SIGINT');
  child.disconnect();
  process.exit();
});
