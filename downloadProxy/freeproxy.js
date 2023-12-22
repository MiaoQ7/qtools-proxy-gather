const { createAxiosInstance } = require('../index')
const cheerio = require('cheerio')

const url = 'https://www.freeproxy.world/?type=socks5&anonymity=4&country=&speed=&port=&page='

module.exports = {
  async download (proxy) {
    console.log(proxy)
    const axiosInstance = createAxiosInstance(proxy)
    let all = []
    for (let i = 1; i <= 5; i++) {
      let result = await axiosInstance.get(url + i)
      const $ = cheerio.load(result.data);

      // 使用选择器语法获取特定元素的数据
      const data = $('body > div.layui-main.site-main > div.proxy-table > table > tbody > tr .show-ip-div').map((index, el) => {
        let ip = $(el).text().replace(/\n/g, '')
        let port = $($(el).parent().children().get()[1]).text().replace(/\n/g, '')
        return {ip, port}
      }).get()
      all.push(...data)
    }
    return all
  }
}