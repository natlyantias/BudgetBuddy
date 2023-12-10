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

// document root for web pages
const page_dir = path.join(__dirname, "views");

//middleware
const router = express.Router();

// Prevent the user from viewing any pages that require logging in first
const checkLoggedIn = (req, res, next) => {
  // Check if user is logged in
  if (req.session && req.session.username) {
    console.log("Login detected");
    console.log(req.session);
    // User is logged in, proceed to the next route handler
    next();
  } else {
    // User is not logged in, redirect to the login page
    console.log("No login detected");
    console.log(req.session);
    //const nologin_msg = "Please log in first.";
    res.redirect("/login?message=Please log in first.");

  }

};

// ----- Our own server API

router.get("/account/displayTransactions", async (req, res) => {
  try {
    const test_param = 1;
    console.log(test_param);
    const pleaseWork = await query("SELECT amount, description, category, transaction_date FROM transactions WHERE user_id = ?", [test_param]);
    res.json(pleaseWork);
  } catch (error) {
    console.error("ERROR IN FETCHING TRANSACTIONS:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// ---------- handle POSTs

router.post("/login_request", async (req, res) => {
  const { username, password } = req.body;

  console.log(req.body);

  db.query("SELECT password_hash FROM users WHERE username = ?", [username],
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

            req.session.email = 'email@domain.com';

            req.session.userId = -1;

            db.query("SELECT user_id FROM users WHERE username = ?", [username],
              (err, userId_result) => {
                req.session.userId = userId_result[0].user_id;
                console.log(req.session.userId);
              

            console.log(req.session);
            console.log("Username is", req.session.username);
            console.log("User id is", req.session.userId);

            res.redirect("/settings");

});

          } else {
            console.log("Passwords do not match!");
            res.status(500).send("error: non-matching password");
          }
          
        });

      } else {
        res.status(500).send("Internal server error");
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
        (insertErr, insertResults) => {
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

router.get("/budgets", checkLoggedIn, (req, res) => {
  res.render("budgetsindex.ejs", { root: page_dir });
});

router.get("/transactions", checkLoggedIn, (req, res) => {
  res.render("transactionindex.ejs", { root: page_dir });
});

router.get("/reports", checkLoggedIn, (req, res) => {
  res.render("reportindex.ejs", { root: page_dir });
});

router.get("/createaccount", (req, res) => {
  res.render("createaccountindex.ejs", { root: page_dir });
});

router.get("/login", (req, res) => {
  const message = req.query.message;

  res.render("loginindex.ejs", { root: page_dir, message });
});

router.get("/settings", checkLoggedIn, (req, res) => {

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
      console.log("yipee:",results[0].access_token);
      plaidConn = false; // for testing purposes
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

// export all routes after they have been defined for use in app.js
module.exports = router;
