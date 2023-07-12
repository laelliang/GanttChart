const createConnection = () => {
  const socket = new WebSocket('ws://localhost:7869');

  // 监听连接成功事件
  socket.addEventListener('open', () => {
    console.log('WebSocket连接建立');
  });
  
  // 监听消息接收事件
  socket.addEventListener('message', (event) => {
    console.log('服务器端消息:', event.data);

    if (event.data === 'pageChange') {
      // 刷新当前网页
      location.reload();
    }

  });
  
  // 监听连接关闭事件
  socket.addEventListener('close', () => {
    console.log('WebSocket连接关闭');
    setTimeout(createConnection, 3000)
  });
}

createConnection()
