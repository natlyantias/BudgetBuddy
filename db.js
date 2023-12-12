/*
----------db.js
----------define database connection
----------
*/

// utilize environment variables
require("dotenv").config();

// required packages for mysql connectivity
const mysql = require("mysql2");
//enable promises for sql queries
const util = require("util");

// construct a connection to mysql database
const db = mysql.createConnection({
  host: process.env.DATABASE_HOSTNAME,
  port: process.env.DATABASE_PORT,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_STORE,
});

// Promisify the query method
const query = util.promisify(db.query).bind(db);

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database:", err);
    return;
  }
  console.log("Database connection successful!");
});

// module.exports = db;

module.exports = {
  db,
  query,
};
