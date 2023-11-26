/*
----------db.js
----------define database connection
----------
*/


// required packages for mysql connectivity
const mysql = require("mysql2");

// WARNING: this is not a static ip
const hostname = "34.130.255.99"

// construct a connection to mysql database
// a real production environment would not store the password in plaintext
const db = mysql.createConnection({
  host: hostname,
  port: 3306,
  user: "buddy",
  password: "OaklandF23!", // it is better to use an environment variable to store the password
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
