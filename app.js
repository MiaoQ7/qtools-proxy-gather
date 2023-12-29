
const http = require('http');
const url = require('url');
const querystring = require('querystring');
const fs = require('fs');
const path = require('path');
const proxyPoolService = require('./proxyPoolService')
const { socksProxyTest } = require('./index')

const USER_TOKEN = process.env.USER_TOKEN

const dbConfig = {
  host: '127.0.0.1',
  port: '3306',
  user: 'root',
  password: '123456',
  database: 'proxy_pool',
  timezone: 'Asia/Shanghai'
};

const downloadProxyModules = []
function importAll() {
  // 获取目录下的所有文件名
  let directoryPath = path.join(__dirname,'downloadProxy')
  const fileNames = fs.readdirSync(directoryPath);

  // 遍历文件名数组
  fileNames.forEach((fileName) => {
    // 构建文件的完整路径
    const filePath = path.join(directoryPath, fileName);

    // 判断文件是否是 JavaScript 文件
    if (path.extname(filePath) === '.js') {
      // 使用 require 导入 JavaScript 文件
      const importedModule = require(filePath);
      downloadProxyModules.push(importedModule)
    }
  });
}

importAll()

console.log(downloadProxyModules.length)

let runDownload = false

setInterval(async function () {
  if (runDownload) {
    console.log('download proxy running')
    return
  }
  console.log('download proxy start')
  runDownload = true
  for (const importedModule of downloadProxyModules) {
    try {
      let proxys = await proxyPoolService.queryProxy(dbConfig, 1, 1, 'ORDER BY RAND()')
      let datas = await importedModule.download(proxys.length > 0 ? proxys[0] : null)
      for (const data of datas) {
        try {
          await proxyPoolService.addProxy(dbConfig, data.ip, data.port, 'sock5', '未知')
        } catch {}
      }
    } catch (e) {
      // console.log(e)
    }
  }
  console.log('download proxy finish')
  runDownload = false
}, 1000 * 60)

let runCheck = false
/**
 * 检查数据库中的代理
 */
setInterval(async function () {
  if (runCheck) {
    console.log('check proxy running')
    return
  }
  console.log('check proxy start')
  runCheck = true

  let proxys = await proxyPoolService.queryProxy(dbConfig, 1, 100, 'ORDER BY updateTime', '未知')
  for (const proxy of proxys) {
    let {status,latency} = await socksProxyTest({
      host: proxy.ip,
      port: parseInt(proxy.port),
      type: 5
    })
    if (status === 'success') {
      console.log(`socks5://${proxy.ip}:${proxy.port} is useful. Latency: ${latency} ms`)
      await proxyPoolService.updateProxy(dbConfig, proxy.id, '正常')
    } else {
      await proxyPoolService.deleteProxy(dbConfig, proxy.id)
    }
  }

  proxys = await proxyPoolService.queryProxy(dbConfig, 1, 100, 'ORDER BY updateTime', '正常')
  for (const proxy of proxys) {
    let {status,latency} = await socksProxyTest({
      host: proxy.ip,
      port: parseInt(proxy.port),
      type: 5
    })
    if (status === 'success') {
      console.log(`socks5://${proxy.ip}:${proxy.port} is useful. Latency: ${latency} ms`)
      await proxyPoolService.updateProxy(dbConfig, proxy.id, '正常')
    } else {
      await proxyPoolService.deleteProxy(dbConfig, proxy.id)
    }
  }
  console.log('check proxy finish')
  runCheck = false
}, 1000 * 60)


const server = http.createServer(async (req, res) => {
  try {
    // 解析请求的 URL
    const parsedUrl = url.parse(req.url);
    console.log(parsedUrl)
    // 解析查询参数
    let text = JSON.stringify({code: 0, message: 'success'})
    const queryParams = querystring.parse(parsedUrl.query);
    if (queryParams['token'] == USER_TOKEN) {
      if (parsedUrl.pathname == '/list') {
        let result = await proxyPoolService.queryProxy(dbConfig, 1, 10, 'ORDER BY RAND()')
        text = JSON.stringify({code: 0, data: result, message: 'success'})
      }
      if (parsedUrl.pathname == '/ss/list') {
        text = JSON.stringify({code: 0, data: {
          ip: 'qq.miaomiao.press',
          port: 8860,
          password: '123456',
          encrypt: 'none'
        }, message: 'success'})
      }
      // if (parsedUrl.pathname == '/add') {
      //   await proxyPoolService.addProxy(dbConfig, '192.168.1.1', '8888', 'sock5', '未知')
      // }
      // if (parsedUrl.pathname == '/update') {
      //   await proxyPoolService.updateProxy(dbConfig, 1, '瞎改')
      // }
      // if (parsedUrl.pathname == '/delete') {
      //   await proxyPoolService.deleteProxy(dbConfig, 1)
      // }
    }

    // 设置响应头
    res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});

    // 发送响应数据
    res.end(text);
  } catch (e) {
    console.log(e)
    // 设置响应头
    res.writeHead(500, {'Content-Type': 'application/json;charset=utf-8'});

    // 发送响应数据
    res.end(JSON.stringify({code: -1, message: e.message}));
  }
});

const port = 3001;
const host = '127.0.0.1';

server.listen(port, host, () => {
  console.log(`Server is running at http://${host}:${port}/`);
});