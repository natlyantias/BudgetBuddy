const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: '172.28.95.165',
  user: 'root',
  password: '',
  database: 'prod'
});
