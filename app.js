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

// serve /public folder (css files mostly)
app.use(express.static("public"));

// parse JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

//importing routes must be located after URL parsing
const routes = require("./routes");

// express-session middleware
app.use(sessionMiddleware);

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
// TODO: Store access_token in database
app.post("/api/exchange_public_token", async (req, res, next) => {
  console.log("POST Route called: /api/exchange_public_token");
  const exchangeResponse = await client.itemPublicTokenExchange({
    public_token: req.body.public_token,
  });

  // FOR DEMO PURPOSES ONLY
  // Store access_token in DB instead of session storage
  req.session.access_token = exchangeResponse.data.access_token;
  res.json(true);
});

// Fetches balance data using the Node client library for Plaid
app.get("/api/data", async (req, res, next) => {
  console.log("GET Route called: /api/data");
  const access_token = req.session.access_token;
  const balanceResponse = await client.accountsBalanceGet({ access_token });
  res.json({
    Balance: balanceResponse.data,
  });
});

app.get("/api/transactions", async (req, res, next) => {
  const access_token = req.session.access_token;

  // Set the date range for the transactions you want to retrieve
  const startDate = '2023-01-01'; // Adjust as needed
  const endDate = '2023-01-31'; // Adjust as needed

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
// TODO: pull access_token from database
app.get("/api/is_account_connected", async (req, res, next) => {
  console.log("GET Route called: /api/is_account_connected");
  // console.log(req.session.access_token);
  return (req.session.access_token ? res.json({ status: true }) : res.json({ status: false}));
});


// ---------- INITIALIZE WEB SERVER
app.listen(port, (error) => {
  if (error) {
    console.log("Something went wrong ", error);
  } else {
    console.log("Server is listening on port " + port);
  }
});
