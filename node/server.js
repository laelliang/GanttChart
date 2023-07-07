const express = require('express');
const path = require('path');
const fs = require('fs');
const { program } = require('commander');
const cheerio = require('cheerio');
const WebSocket = require('ws');


program
  .option('-f, --filePath <filePath>', '设置文件夹路径')
  .option('-p, --port <port>', '设置端口')
  .parse(process.argv);

const options = program.opts();


const app = express();
const port = options.port
const staticFolder = options.filePath // 静态文件夹路径

app.use(express.static(staticFolder, { index: false }));

app.get('/', (req, res) => {
  const indexPath = path.join(staticFolder, './index.html');
  const jsPath = path.join(__dirname, './refresh.js');
  const htmlStr = fs.readFileSync(indexPath, 'utf-8');
  const jsStr = fs.readFileSync(jsPath, 'utf-8');
  // 使用 cheerio 解析 HTML
  const $ = cheerio.load(htmlStr);

  // 修改 HTML 内容
  $('head').append(`<script type="module">\n${jsStr}\n</script>\n`);

  res.send($.html());
});

const server =app.listen(port, () => {
  console.log(`访问地址：http://localhost:${port}`);
});


// // 创建 WebSocket 客户端实例
// const socket = new WebSocket('ws://localhost:7869');

// // 监听 WebSocket 事件
// socket.on('message', (data) => {
//   if (data.toString('utf8') === 'fileChange') {
//     console.log('关闭server')
//     server.close()
//   }
// });
