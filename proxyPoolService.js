
const MysqlTool = require('./MysqlTool')

module.exports = {
  async addProxy(dbConfig, ip, port, type, status) {
    let mysqlTool = new MysqlTool(dbConfig);
    try {
      await mysqlTool.connect()
      const results = await mysqlTool.query('INSERT INTO proxy(`ip`,`port`,`type`,`status`,`createTime`,`updateTime`) values (?,?,?,?,?,?)',[ip, port, type, status, new Date(), new Date()]);
      return results
    } finally {
      await mysqlTool.close()
    }
  },

  async updateProxy(dbConfig, id, status) {
    let mysqlTool = new MysqlTool(dbConfig);
    try {
      await mysqlTool.connect()
      const results = await mysqlTool.query('UPDATE proxy SET status=?, updateTime=? WHERE id=?',[status, new Date(), id]);
      return results
    } finally {
      await mysqlTool.close()
    }
  },

  async deleteProxy(dbConfig, id) {
    let mysqlTool = new MysqlTool(dbConfig);
    try {
      await mysqlTool.connect()
      const results = await mysqlTool.query('DELETE FROM proxy WHERE id=?',[id]);
      return results
    } finally {
      await mysqlTool.close()
    }
  },

  async queryProxy(dbConfig, page, pageSize, order = 'ORDER BY updateTime DESC', status = '正常') {
    let mysqlTool = new MysqlTool(dbConfig);
    try {
      await mysqlTool.connect()
      const results = await mysqlTool.query(`SELECT * FROM proxy WHERE status=? ${order} limit ?,?`,[status, (page-1)*pageSize, pageSize]);
      return results.map(e => ({...e}))
    } finally {
      await mysqlTool.close()
    }
  },
}