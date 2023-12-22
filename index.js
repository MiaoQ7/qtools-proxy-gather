
const socks = require('socks')
const axios = require('axios')
const {SocksProxyAgent} = require('socks-proxy-agent');

module.exports = {
  socksProxyTest: (proxyOptions) => {
    /*
    {
    socksHost: 'your_proxy_host',
    socksPort: 1080,
    auths: [SocksClient.auth.None()],
    }
    */
    return new Promise((r) => {
      const start_time = new Date();

      const options = {
        proxy: {
          ...proxyOptions
        },

        command: 'connect',
        timeout: 3000,
        destination: {
          host: 'google.com',
          port: 80,
        }
      };

      socks.SocksClient.createConnection(options).then((info) => {
        const end_time = new Date();
        const latency = end_time - start_time;

        console.log(`Proxy is working. Latency: ${latency} ms`);

        // 关闭连接
        info.socket.end();
        r({status: 'success', latency})
      }).catch(error => {
        r({status: 'fail', latency: 0, message: error.message})
      })
    })
  },
  async getHtml(url) {
    let html = await axios.get(url)
    return html.data
  },
  createAxiosInstance (proxy) {
    if (proxy) {
      let agent = new SocksProxyAgent(`socks5://${proxy.ip}:${proxy.port}`)
      return axios.create({
        httpAgent: agent,
        // httpsAgent: agent
      });
    } else {
      return axios.create({})
    }
  }
}

