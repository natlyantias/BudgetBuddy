/*
----------db.js
----------define database connection
----------
*/


// required packages for mysql connectivity
const mysql = require("mysql2");

// construct a connection to mysql database
const db = mysql.createConnection({
  host: "172.28.95.165",
  user: "buddy",
  password: "OaklandF23!",
  database: "prod",
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database:", err);
    return;
  }
  console.log("Database connection successful!");
});


module.exports = db;
