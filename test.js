
const { socksProxyTest, getHtml } = require('./index')
const socks = require('socks')
const fs = require('fs')
const cheerio = require('cheerio')
const freeproxy = require('./downloadProxy/freeproxy')
const geonode = require('./downloadProxy/geonode')

async function test01 () {
  let html = await getHtml('https://www.freeproxy.world/?type=socks5&anonymity=4&country=&speed=&port=&page=1')
  fs.writeFileSync('demo.html', html)
}

async function test02 () {
  let html = fs.readFileSync('demo.html')
  const $ = cheerio.load(html);

  // 使用选择器语法获取特定元素的数据
  const data = $('body > div.layui-main.site-main > div.proxy-table > table > tbody > tr .show-ip-div').map((index, el) => {
    let ip = $(el).text().replace(/\n/g, '')
    let port = $($(el).parent().children().get()[1]).text().replace(/\n/g, '')
    return {ip, port}
  }).get()

  console.log('DATA:', data);
  fs.writeFileSync('proxy.json', JSON.stringify(data))
}

async function test03 () {
  let usefulProxy = []
  let proxys = JSON.parse(fs.readFileSync('proxy.json'))
  for (const proxy of proxys) {
    // console.log(proxy)
    let result = await socksProxyTest({
      host: proxy.ip,
      port: parseInt(proxy.port),
      type: 5
    })
    console.log(result)
    if (result.status == 'success') {
      usefulProxy.push({...proxy, latency: result.latency})
    }
  }
}

async function test04 () {
  let data = await freeproxy.download({ip:'72.37.217.3',port:'4145'})
  console.log(data)
}

async function test05 () {
  let data = await geonode.download({ip:'72.37.217.3',port:'4145'})
  console.log(data)
}


// test01()
// test02()
test03()
// test04()
// test05()

// socksProxyTest({
//   host: '104.189.96.204',
//   port: 3820,
//   type: 5
// }).then(res => {
//   console.log(res)
// })


