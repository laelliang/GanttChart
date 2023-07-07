const WebSocket = require('ws');
const chokidar = require('chokidar');
const { program } = require('commander');

program
  .option('-p, --paths <paths...>', '设置文件夹路径', (value, previous) => previous.concat(value), [])
  .parse(process.argv);

const options = program.opts();

// 创建 WebSocket 客户端实例
const socket = new WebSocket('ws://localhost:7869');

const watcher = chokidar.watch(options.paths, {
  recursive: true, // 启用递归监听
});
watcher.on('change', (path) => {
  console.log(`文件 ${path} 变动`);
  socket.send('fileChange')
});
