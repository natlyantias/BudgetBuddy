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
// NOTE: 'db' is used for older query code that still works,
//       'query' is the new promisified sql query code
const { db, query } = require('./db');
const sessionMiddleware = require("./session");
const mysql = require('mysql2/promise');

//packages
const path = require("path");
const express = require("express");
const moment = require('moment');
const bcrypt = require("bcrypt");
// const mysql = require('mysql2/promise');
// document root for web pages
const page_dir = path.join(__dirname, "views");

//middleware
const router = express.Router();


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
};



// ----- Our own server API

router.get("/account/displayTransactions", async (req, res) => {
  try {
    const user_id = req.session.userId;
    // console.log(user_id);
    // promisified queries seem to be needed for api routes
    const transactions_result = await query("SELECT amount, description, category, transaction_date FROM transactions WHERE user_id = ? ORDER BY transaction_date DESC", [user_id]);
    
    // store result in an iterable object to format the 'transaction_date' column
    const transactionDatesFormatted = transactions_result.map(transaction => ({
      // keep the other columns the same
      amount: transaction.amount,
      description: transaction.description,
      category: transaction.category,
      // format the date in this column
      transaction_date: moment(transaction.transaction_date).format('YYYY-MM-DD'),
    }));
    
    res.json(transactionDatesFormatted);
  } catch (error) {
    console.error("ERROR IN FETCHING TRANSACTIONS:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/account/displayBalance", async (req, res) => {
  try {
    const user_id = req.session.userId;
    // console.log(user_id);

    const balance_result = await query("SELECT sum(amount) AS balance FROM transactions WHERE user_id = ?", [user_id]);
    res.json(balance_result);
    console.log(balance_result, "BAL");
  } catch (error) {
    console.error("ERROR IN FETCHING BALANCE:", error);
    res.status(500).send("Internal Server Error");
  }
})


// Function to find the nearest frequency
function findNearest(values, targets) {
  return values.map(value => {
      return targets.reduce((prev, curr) => 
          (Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev));
  });
}

// Function to categorize pay frequency
function categorizePayFrequency(daysBetween) {
  const targets = [7, 14, 30];
  let categorized = findNearest(daysBetween, targets);
  let frequencyCounts = categorized.reduce((acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
  }, {});

  let mostFrequent = Object.keys(frequencyCounts).reduce((a, b) => 
      frequencyCounts[a] > frequencyCounts[b] ? a : b);

  return parseInt(mostFrequent);
}

// Function to estimate monthly salary
function estimateMonthlySalary(transactions) {
  if (!transactions || transactions.length === 0) {
      console.log("No transactions found");
      return 0;
  }

  let daysBetween = transactions.map(t => t.days_between).filter(Boolean);
  let payFrequency = categorizePayFrequency(daysBetween);

  let totalIncome = transactions.reduce((sum, record) => {
      let amount = parseFloat(record.amount); // Ensure amount is a number
      return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  let averageIncome = totalIncome / transactions.length;

  console.log("Total Income:", totalIncome, "Transactions Count:", transactions.length);

  switch (payFrequency) {
      case 7: // Weekly
          return averageIncome * 4;
      case 14: // Bi-Weekly
          return averageIncome * 2;
      case 30: // Monthly
          return averageIncome;
      default:
          console.log("Undefined pay frequency:", payFrequency);
          return 0; // Undefined frequency
  }
}
router.get("/account/getDays", async (req, res) => {
  try {
    const test_param = req.session.userId;
    const transactions = await query("SELECT transaction_id, amount, transaction_date, DATEDIFF(transaction_date, LAG(transaction_date, 1) OVER (ORDER BY transaction_date)) AS days_between FROM transactions WHERE category = 'Transfer' AND description LIKE '%Salary%' AND user_id = ? ORDER BY transaction_date;", [test_param]);
    const monthlySalary = estimateMonthlySalary(transactions);
    console.log(monthlySalary);
    res.json({ transactions, monthlySalary });
  } catch (error) {
    console.error("ERROR IN FETCHING TRANSACTIONS:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.get("/account/getSums", async (req, res) => {
  try {
    const test_param = req.session.userId;
    console.log(test_param);
    const pleaseWork = await query("select category, sum(amount) as total_amount from transactions where user_id= ? group by category;", [test_param]);
    res.json(pleaseWork);
  } catch (error) {
    console.error("ERROR IN FETCHING TRANSACTIONS:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/budgetData', async (req, res) => {
  try {
      console.log("you are here");
      const userId = req.session.userId;
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01';

      const queryString = `
          SELECT food_drinks_budget, entertainment_budget, travel_budget, savings_budget 
          FROM budgets 
          WHERE user_id = ? AND budget_month = ?
      `;
      const [rows, fields] = await query(queryString, [userId, currentMonth]);

      if (rows.length > 0) {
          res.json(rows[0]);
          console.log(rows[0]);
      } else {
          res.status(404).send('Budget data not found for the current month.');
      }
  } catch (error) {
      console.error('Database error:', error);
      res.status(500).send('Internal Server Error');
  }
});


// ---------- handle POSTs

router.post("/login_request", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

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

            // Placeholder for email
            req.session.email = "email@domain.com";

            // TODO: Handle if this value actually passes
            // Fallback value to prevent 'undefined' error
            req.session.userId = -1;

            db.query(
              "SELECT user_id, email FROM users WHERE username = ?",
              [username],
              (err, userData_result) => {
                req.session.userId = userData_result[0].user_id;
                req.session.email = userData_result[0].email;
                console.log(req.session.userId);

                console.log(req.session);
                // console.log("Username is", req.session.username);
                // console.log("User id is", req.session.userId);
                // console.log("Email is", req.session.email);

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
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  const hashed_password = await bcrypt.hash(password, 10);

  // console.log(hashed_password);
  console.log("Registration password has been hashed");

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

 console.log("Plaid connected:", plaidConn);
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
