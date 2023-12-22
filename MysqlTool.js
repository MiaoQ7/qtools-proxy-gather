const mysql = require('mysql');

class MysqlTool {
  constructor(config) {
    this.config = config
    this.connection = mysql.createConnection(config);
  }

  // 连接到数据库
  connect() {
    if (this.connection == null) {
      this.connection = mysql.createConnection(config);
    }
    return new Promise((resolve, reject) => {
      this.connection.connect((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  // 执行查询
  query(sql, values = []) {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, values, (err, results) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(results);
      });
    });
  }

  // 关闭数据库连接
  close() {
    return new Promise((resolve, reject) => {
      this.connection.end((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }
}

module.exports = MysqlTool;