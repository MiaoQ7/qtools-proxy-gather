const { createAxiosInstance } = require('../index')

const url = 'https://proxylist.geonode.com/api/proxy-list?limit=500&page=1&sort_by=lastChecked&sort_type=desc&protocols=socks5'

module.exports = {
  async download (proxy) {
    console.log(proxy)
    const axiosInstance = createAxiosInstance(proxy)
    let result = await axiosInstance.get(url, {headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-site',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'zh-CN,zh;q=0.9,zh-HK;q=0.8,en;q=0.7',
      'If-None-Match': 'W/"3d065-0CjoClQhWiDGNpgaJR0jdtWw//U"',
      'Origin': 'https://geonode.com',
      'Referer': 'https://geonode.com/',
    }})
    // console.log(result)
    return result.data.data.map(e => ({ip: e.ip, port: e.port}))
  }
}