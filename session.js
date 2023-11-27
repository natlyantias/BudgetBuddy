// sessionConfig.js

// express-session middleware for use across all other scripts

const session = require("express-session");
const MySQLStore = require('express-mysql-session')(session);

const sessionMiddleware = session({
  secret: "bosco",
  saveUninitialized: true,
  resave: true,
//   store: new MySQLStore({
//     /* MySQL store configuration */
//   }),
});

module.exports = sessionMiddleware;
