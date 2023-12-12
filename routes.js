/*
----------routes.js
----------handle web page navigation
----------CREDIT: https://stackoverflow.com/questions/6059246/how-to-include-route-handlers-in-multiple-files-in-express
----------CREDIT: https://www.hacksparrow.com/webdev/express/handling-processing-forms.html
----------CREDIT: https://codeforgeek.com/manage-session-using-node-js-express-4/
----------CREDIT: https://codeshack.io/basic-login-system-nodejs-express-mysql/
----------CREDIT: https://www.youtube.com/watch?v=-RCnNyD0L-s
*/


//import other scripts in the same directory
const { db, query } = require('./db');
const sessionMiddleware = require("./session");

//packages
const path = require("path");
const express = require("express");
const bcrypt = require("bcrypt");
const mysql = require('mysql2/promise');
// document root for web pages
const page_dir = path.join(__dirname, "views");

//middleware
const router = express.Router();

const moment = require('moment');

// Prevent the user from viewing any pages that require logging in first
const loginRedirect = (req, res, next) => {
  // Check if user is logged in
  if (req.session && req.session.username) {
    console.log("Login detected");
    console.log(req.session);
    // proceed to the next route handler (defined in routes where this function is passed)
    next();
  } else {
    console.log("No login detected");
    console.log(req.session);
    //const nologin_msg = "Please log in first.";
    res.redirect("/login?message=Please log in first.");

  }

};

// Prevent access to the login and register pages when already logged in
const alreadyLoggedIn = (req, res, next) => {
  if (!(req.session && req.session.username)) {
    next();
  } else {
    res.redirect("/settings");
  }
}

// ----- Our own server API

router.get("/account/displayTransactions", async (req, res) => {
  try {
    const user_id = req.session.userId;
    console.log(user_id);
    // promisified queries seem to be needed for api routes
    const transactions_result = await query("SELECT amount, description, category, transaction_date FROM transactions WHERE user_id = ? ORDER BY transaction_date DESC", [user_id]);
    
    // store result in an iterable object to format the 'transaction_date' column
    const transactionDatesFormatted = transactions_result.map(transaction => ({
      // keep the other columns the same
      amount: transaction.amount,
      description: transaction.description,
      category: transaction.category,
      transaction_date: moment(transaction.transaction_date).format('YYYY-MM-DD'),
    }));
    
    res.json(transactionDatesFormatted);
  } catch (error) {
    console.error("ERROR IN FETCHING TRANSACTIONS:", error);
    res.status(500).send("Internal Server Error");
  }
});


// ---------- handle POSTs

router.post("/login_request", async (req, res) => {
  const { username, password } = req.body;

  console.log(req.body);

  // use parameterized queries for better security
  db.query(
    "SELECT password_hash FROM users WHERE username = ?",
    [username],
    (err, password_hash_result) => {
      if (password_hash_result.length > 0) {
        const user = password_hash_result[0];

        console.log(user);

        const hashed_password = user.password_hash;

        bcrypt.compare(password, hashed_password, (err, result) => {
          if (err) {
            console.error("Error comparing passwords:", err);
            res.status(500).send("Internal server error");
            return;
          }

          if (result) {
            // successful login
            console.log("Passwords match!");

            req.session.username = username;

            req.session.email = "email@domain.com";

            req.session.userId = -1;

            db.query(
              "SELECT user_id FROM users WHERE username = ?",
              [username],
              (err, userId_result) => {
                req.session.userId = userId_result[0].user_id;
                console.log(req.session.userId);

                console.log(req.session);
                console.log("Username is", req.session.username);
                console.log("User id is", req.session.userId);

                res.redirect("/settings");
              }
            );
          } else {
            // wrong password for user
            console.log("Passwords do not match!");
            // res.status(500).send("Error: Non-matching username and/or password");
            res.redirect("/login?message=Non-matching username and/or password");
          }
        });
      } else {
        // no username found (show a generic error)
        // res.status(500).send("Error: Non-matching username and/or password");
        res.redirect("/login?message=Non-matching username and/or password");
      }
    }
  );
});

router.post("/register_account", async (req, res) => {
  const { username, password, email } = req.body;

  const hashed_password = await bcrypt.hash(password, 10);

  console.log(hashed_password);

  // Check if the username is already taken
  db.query("SELECT * FROM users WHERE username = ?", [username], (checkErr, checkResults) => {
    if (checkErr) {
      console.error("MySQL query error:", checkErr);
      res.status(500).send("Internal Server Error");

    } else if (checkResults.length > 0) {
      // Username is already taken
      res.status(400).send("Username is already taken");

    } else {
      // Create a new user
      const insertQuery = "INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)";
      db.query(
        insertQuery,
        [username, hashed_password, email],
        (insertErr) => {
          if (insertErr) {
            console.error("MySQL query error:", insertErr);
            res.status(500).send("Internal Server Error");

          } else {
            // User registration successful
            res.redirect("/login");

          }

        }

      );

    }

  });
});

router.post("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login?logout=true");
})

// ---------- handle GETs

router.get("/", function (req, res) {
  res.render("index.ejs", { root: page_dir });
});

router.get("/index", function (req, res) {
  res.render("index.ejs", { root: page_dir });
});

router.get("/aboutus", (req, res) => {
  res.render("aboutusindex.ejs", { root: page_dir });
});

router.get("/budgets", loginRedirect, (req, res) => {
  res.render("budgetsindex.ejs", { root: page_dir });
});

router.get("/transactions", loginRedirect, (req, res) => {
  res.render("transactionindex.ejs", { root: page_dir });
});

router.get("/reports", loginRedirect, (req, res) => {
  res.render("reportindex.ejs", { root: page_dir });
});

router.get("/createaccount", alreadyLoggedIn, (req, res) => {
  res.render("createaccountindex.ejs", { root: page_dir });
});

router.get("/login", alreadyLoggedIn, (req, res) => {
  const message = req.query.message;

  res.render("loginindex.ejs", { root: page_dir, message });
});

router.get("/settings", loginRedirect, (req, res) => {

  // Assume plaid is not connected unless a token is returned from database
  let plaidConn;

  const username = req.session.username;

  if (!username) {
    console.log("No username found while trying to check for Plaid connectivity");
    return false;
  }

  db.query("SELECT access_token FROM users WHERE username = ?", [username], (err, results) => {
    if (err) {
      console.error("Error:", err);
    } else if (results.length > 0) {
      const token = results[0].access_token;
      // use regex to determine if a key has been added to the current user already
      const pattern = /null/;
      if (pattern.test(token)) {
        console.log("No token found.")
        plaidConn = false;
      } else {
        console.log("Token found");
        plaidConn = true;
      }
      console.log(token);
      // plaidConn = true; // for testing purposes
    
    } else {
      console.log("No Plaid token found in database");
      plaidConn = false;
    }

 console.log("Result is", plaidConn);
  // pull data from session to display in response render
  session_username = req.session.username;
  session_email = req.session.email;

    res.render("settingsindex.ejs", { plaidConn, session_username, root: page_dir });
  });  

});

router.get("/editprofile", (req, res) => {
  res.render("editprofile.ejs", { root: page_dir });
});

// export all routes after they have been defined for use in app.js
module.exports = router;
