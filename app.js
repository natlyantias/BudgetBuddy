/*
----------app.js
----------entry file for application
----------CREDIT: https://www.youtube.com/watch?v=-RCnNyD0L-s
----------
*/


// define listen port for the node.js server
const port = 80;

// ---------- IMPORTS

// utilize environment variables
require("dotenv").config();
// import packages
// const bodyParser = require("body-parser");
// const MySQLStore = require("express-mysql-session")(session);
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const path = require("path");

//import other scripts in the same directory
const db = require('./db');


// initialize express.js
const app = express();

// initialize templating engine
app.set('view engine', 'ejs');

// import initialization of express-session
const sessionMiddleware = require("./session");


// ---------- DEFINE MIDDLEWARE

// serve /public folder
app.use(express.static("public"));

// parse JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

// express-session middleware
app.use(sessionMiddleware);

//importing routes must be located after URL parsing
const routes = require("./routes");


//
app.use(routes);

// ---------- PLAID API

const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");


// Configuration for the Plaid client
const config = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET,
      "Plaid-Version": "2020-09-14",
    },
  },
});

//Instantiate the Plaid client with the configuration
const client = new PlaidApi(config);

// ----- Plaid routes

//Creates a Link token and return it
app.get("/api/create_link_token", async (req, res, next) => {
  console.log("GET Route called: /api/create_link")
  const tokenResponse = await client.linkTokenCreate({
    user: { client_user_id: req.sessionID },
    client_name: "Plaid's Tiny Quickstart",
    language: "en",
    products: ["auth", "transactions"],
    country_codes: ["US"],
    redirect_uri: process.env.PLAID_SANDBOX_REDIRECT_URI,
  });
  res.json(tokenResponse.data);
});

// Exchanges the public token from Plaid Link for an access token
// occurs when linking is complete
app.post("/api/exchange_public_token", async (req, res, next) => {
  console.log("POST Route called: /api/exchange_public_token");
  const exchangeResponse = await client.itemPublicTokenExchange({
    public_token: req.body.public_token,
  });

  plaid_token = exchangeResponse.data.access_token;

  console.log("UPDATE users SET access_token = ", plaid_token, " WHERE username = ", req.session.userId);


  db.query("UPDATE users SET access_token = ? WHERE username = ?",
  [plaid_token, req.session.userId], (err, results) => {
    if (err) {
      console.error("MySQL query error:", err);
      res.status(500).send("Internal Server Error");

    } else {
      console.log("Query successful, with token ", plaid_token);
    }

  });

  // FOR DEMO PURPOSES ONLY
  // Store access_token in DB instead of session storage
  // req.session.access_token = exchangeResponse.data.access_token;

  res.json(true);
});

// Fetches balance data using the Node client library for Plaid
app.get("/api/data", async (req, res, next) => {
  console.log("GET Route called: /api/data");

  const username = req.session.userId;

  if (!username) {
    return res.status(500).send("Internal Server Error");
  }

  try {
    const result = await query("SELECT access_token FROM users WHERE username = ?", [username]);

    if (result.length > 0) {
      console.log("Query successful");
      const access_token = result[0].access_token;
      console.log("Fetched token: ", access_token);

      const balanceResponse = await client.accountsBalanceGet({ access_token });
      res.json({
        Balance: balanceResponse.data,
      });
    } else {
      res.status(500).send("Internal Server Error");
    }
  } catch (error) {
    console.error("MySQL query error:", error);
    res.status(500).send("Internal Server Error");
  }
});


app.get("/api/transactions", async (req, res, next) => {

  const username = req.session.userId;

  if (username) {
    console.log("Valid userID found");
  } else {
    return res.status(500).send("Internal Server Error");
  }

  db.query("SELECT access_token FROM users WHERE username = ?", [username],
  (err, result) => {
    if (err) {
      console.error("MySQL query error:", err);
      res.status(500).send("Internal Server Error");

    } else if (result) {
      console.log("Query successful");
      const access_token = result[0].access_token;
      console.log("Fetched token: ", access_token);

    }

  });

  // const access_token = req.session.access_token;
  // Set the date range for the transactions you want to retrieve
  const startDate = '2023-01-01'; // Adjust as needed
  const endDate = '2023-12-31'; // Adjust as needed

  try {
    const transactionsResponse = await client.transactionsGet({
      access_token,
      start_date: startDate,
      end_date: endDate,
      options: {
        count: 10, // Number of transactions to fetch
        offset: 0,  // Offset for pagination
      },
    });
    res.json(transactionsResponse.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Checks whether the user's account is connected, called
// in index.html when redirected from oauth.html
app.get("/api/is_account_connected", async (req, res, next) => {
  console.log("GET Route called: /api/is_account_connected");

  const username = req.session.userId;

  if (!username) {
    return res.status(500).send("Internal Server Error");
  }

  try {
    const result = db.query("SELECT access_token FROM users WHERE username = ?", [username]);

    if (result.length > 0) {
      console.log("Query successful");
      const access_token = result[0].access_token;
      console.log("Fetched token: ", access_token);
      return res.json({ status: !!access_token });
    } else {
      res.status(500).send("Internal Server Error");
    }
  } catch (error) {
    console.error("MySQL query error:", error);
    res.status(500).send("Internal Server Error");
  }
});



// ---------- INITIALIZE WEB SERVER
app.listen(port, (error) => {
  if (error) {
    console.log("Something went wrong ", error);
  } else {
    console.log("Server is listening on port " + port);
  }
});
