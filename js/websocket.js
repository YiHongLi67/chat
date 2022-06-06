//1.导入nodejs-websocket包
const ws = require("nodejs-websocket");
const PORT = 3000;
//2．创建一个server
const server = ws.createServer((connect) => {
  connect.on("text", (data) => {
    var res = JSON.parse(data);
    console.log(res);
    if (!!res.sign_str) {
      connect.name = res.sign_str;
      let result = {
        msg: `${connect.name}进入了聊天系统`
      };
      broadcast(JSON.stringify(result));
    } else {
      server.connections.forEach((item) => {
        if (item.name === res.opposing.sign_str) {
          let data = {
            opposing: res.myself,
            chatMsg: res.chatMsg
          };
          item.send(JSON.stringify(data));
        }
      });
    }
  });
  connect.on("close", (data) => {
    console.log("连接关闭了");
    let result = {
      msg: `${connect.name}离开了聊天系统`
    };
    broadcast(JSON.stringify(result));
  });
  connect.on("error", (data) => {
    console.log("连接发生异常");
    console.log(data);
  });
});
function broadcast(data) {
  let result = JSON.stringify(data);
  server.connections.forEach((item) => {
    item.send(result);
  });
}
server.listen(PORT, () => {
  console.log("websocket服务启动成功了，监听了端口" + PORT);
});
