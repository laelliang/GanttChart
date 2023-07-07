const fs = require('fs');
const path = require('path');
const { exec, execSync, spawn } = require('child_process');
const WebSocket = require('ws');

const filePath = './nconfig.json';
let configData
try {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  configData = JSON.parse(fileContent);
} catch (error) {
  console.error('读取 JSON 文件时出错:', error);
}

configData.outDir = path.join(__dirname, configData.outDir)
configData.src = path.join(__dirname, configData.src)

// 创建 WebSocket 服务器
const wss = new WebSocket.Server({ port: 7869 });

// 向所有客户端广播消息
const broadcast = (message) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// 监听连接事件
wss.on('connection', (ws) => {
  // 监听消息事件
  ws.on('message', (message) => {
    const msgText = message.toString('utf8')
    console.log('收到客户端消息: ',msgText)
    if (msgText === 'fileChange') {
      let size = 0;
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          size +=1
        }
      });
      console.log(`现有${size}活动终端`)
      // 广播文件变动
      broadcast(msgText)
    }
  });
});
console.log('WebSocket服务已运行');

const createConnection = () => {

  // 清空文件
  const deleteOut = execSync(`node ./node/delete.js -p ${configData.outDir}`)
  console.log(deleteOut.toString('utf8'))


  // 编译
  const buildOut = execSync(`cd ${__dirname} && npm run build`)
  console.log(buildOut.toString('utf8'))

  // 复制文件
  const moveOut = execSync(`node ./node/move.js -s ${configData.src} -t ${configData.outDir}`)
  console.log(moveOut.toString('utf8'))

  // 广播页面变动
  broadcast('pageChange')

  // 监听文件变动
  // const watch = exec(`node ./node/watch.js -p ${configData.watchDir.map(val => path.join(__dirname, val)).join(' ')}`);
  // watch.stdout.pipe(process.stdout);

  // 打开服务
  // const server = exec(`node ./node/server.js -f ${configData.outDir} -p ${configData.port}`);
  // server.stdout.pipe(process.stdout)

  // 监听文件变动
  const watch = spawn('node', ['./node/watch.js', '-p', ...configData.watchDir.map(val => path.join(__dirname, val))]);
  watch.stdout.on('data', (data) => {
    console.log(data.toString('utf8'));
  });

  // 打开服务
  const server = spawn('node',['./node/server.js', '-f', configData.outDir, '-p', configData.port])
  server.stdout.on('data', (data) => {
    console.log(data.toString('utf8'));
  });

  // 创建 WebSocket 客户端实例
  const socket = new WebSocket('ws://localhost:7869');

  socket.on('message', (data) => {
    console.log('收到服务器消息: ', data.toString('utf8'));
    if (data.toString('utf8') === 'fileChange') {
      watch.kill('SIGKILL')
      if (!watch.killed) {
        console.error('watch 进程杀死失败')
        // new Error('watch 进程杀死失败');
      }
      server.kill('SIGKILL')
      if (!server.killed) {
        console.error('server 进程杀死失败');
        // new Error('server 进程杀死失败');
      }

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.close()
        }
      });

      // process.kill(watch.pid, 'SIGTERM')
      // process.kill(server.pid, 'SIGTERM')
      // process.kill(watch.pid, 'SIGINT')
      // process.kill(server.pid, 'SIGINT')
      createConnection()
    }
  });

}

createConnection()




