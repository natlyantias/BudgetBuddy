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
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const path = require("path");
//import other scripts in the same directory
const { db, query } = require('./db');
const loadTransactions = require("./transactions");

// initialize express.js
const app = express();

// initialize templating engine
app.set("view engine", "ejs");

// import initialization of express-session
const sessionMiddleware = require("./session");

// ---------- DEFINE MIDDLEWARE

// serve /public folder
app.use(express.static("public"));

// parse JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  console.log("GET Route called: /api/create_link");
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

  console.log(
    "UPDATE users SET access_token = ",
    plaid_token,
    " WHERE username = ",
    req.session.username
  );

  db.query(
    "UPDATE users SET access_token = ? WHERE username = ?",
    [plaid_token, req.session.username],
    (err, results) => {
      if (err) {
        console.error("MySQL query error:", err);
        res.status(500).send("Internal Server Error");
      } else {
        console.log("Query successful, with token ", plaid_token);
      }
    }
  );

  // FOR DEMO PURPOSES ONLY
  // Store access_token in DB instead of session storage
  // req.session.access_token = exchangeResponse.data.access_token;

  res.json(true);
});

// Fetches balance data using the Node client library for Plaid
app.get("/api/data", (req, res, next) => {
  console.log("GET Route called: /api/data");

  const username = req.session.username;

  if (!username) {
    return res.status(500).send("Internal Server Error");
  }

  db.query(
    "SELECT access_token FROM users WHERE username = ?",
    [username],
    async (err, result) => {
      if (err) {
        console.error("MySQL query error:", err);
        return res.status(500).send("Internal Server Error");
      } else if (result && result.length > 0) {
        const access_token = result[0].access_token;
        console.log("Fetched token: ", access_token);

        try {
          const balanceResponse = await client.accountsBalanceGet({
            access_token,
          });
          res.json({
            Balance: balanceResponse.data,
          });
        } catch (error) {
          console.error("Error fetching balance:", error);
          res.status(500).json({ error: error.message });
        }
      } else {
        res.status(404).send("No access token found for the user");
      }
    }
  );
});

app.get("/api/transactions", async (req, res, next) => {
  const username = req.session.username;

  if (!username) {
    return res.status(500).send("Internal Server Error");
  }

  db.query(
    "SELECT access_token FROM users WHERE username = ?",
    [username],
    async (err, result) => {
      if (err) {
        console.error("MySQL query error:", err);
        res.status(500).send("Internal Server Error");
      } else if (result && result.length > 0) {
        const access_token = result[0].access_token;

        const startDate = "2023-01-01"; // Adjust as needed
        const endDate = "2023-12-31"; // Adjust as needed

        try {
          const transactionsResponse = await client.transactionsGet({
            access_token,
            start_date: startDate,
            end_date: endDate,
            options: {
              count: 10, // Number of transactions to fetch
              offset: 0, // Offset for pagination
            },
          });
          res.json(transactionsResponse.data);
          db.query(
            "SELECT user_id FROM users WHERE username = ?",
            [username],
            function (err, results) {
              if (err) {
                // handle error
                console.error(err);
                return;
              }

              if (results.length > 0) {
                const userId = results[0].user_id;
                // use userId here
                console.log(userId);
                loadTransactions(transactionsResponse.data, userId)
                  .then(() => {
                    console.log("Transactions loaded");
                  })
                  .catch((err) => {
                    console.error("Failed to load transactions:", err);
                  });
              } else {
                // no results found
                console.log("No user found with that username");
              }
            }
          );
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      } else {
        res.status(404).send("No access token found for the user");
      }
    }
  );
});

// Checks whether the user's account is connected, called
// in index.html when redirected from oauth.html
app.get("/api/is_account_connected", async (req, res, next) => {
  console.log("GET Route called: /api/is_account_connected");

  const username = req.session.username;

  if (!username) {
    return res.status(500).send("Internal Server Error");
  }

  try {
    db.query(
      "SELECT access_token FROM users WHERE username = ?",
      [username],
      (err, token_result) => {
        if (err) {
          console.error("MySQL query error:", err);
        } else if (token_result.length > 0) {
          console.log("Query successful");
          const access_token = token_result[0].access_token;
          console.log("Fetched token: ", access_token);
          return res.json({ status: !!access_token });
        }
        //else {
        //   res.status(500).send("Internal Server Error");
        // }
      }
    );
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
