/*
----------routes.js
----------handle web page navigation
----------CREDIT: https://stackoverflow.com/questions/6059246/how-to-include-route-handlers-in-multiple-files-in-express
----------CREDIT: https://www.hacksparrow.com/webdev/express/handling-processing-forms.html
*/

const bcrypt = require("bcrypt");

//import other scripts in the same directory
const db = require('./db');


// enable routes.js to be used in app.js
module.exports = function (app) {

    const page_dir = app.get("views");

    // ---------- handle POSTs

    app.post('/login_request', async (req, res) => {
        const { username, password } = req.body;

        const hashed_password = db.query('SELECT password_hash FROM users WHERE username = ?', [username], (err, results) => {
          if (results.length > 0) {
            
            const hash_from_db = results[0].password_hash;

            bcrypt.compare(password, hash_from_db, (err, result) => {
              if (err) {
                console.error('Error comparing passwords:', err);
                
            res.status(500).send('Internal server error');
                return;
              }
            
              if (result) {
                console.log('Passwords match!');
              } else {
                console.log('Passwords do not match!');
              }
            });

          } else {
            res.status(500).send('Internal server error');
          }
        });
        
        

      });

      app.post('/register_account', async (req, res) => {
        const { username, password, email } = req.body;

        const hashed_password = await bcrypt.hash(password, 10);
        
        console.log(hashed_password);
      
        // Check if the username is already taken
        const checkQuery = 'SELECT * FROM users WHERE username = ?';
        db.query(checkQuery, [username], (checkErr, checkResults) => {
          if (checkErr) {
            console.error('MySQL query error:', checkErr);
            res.status(500).send('Internal Server Error');
          } else if (checkResults.length > 0) {
            // Username is already taken
            res.status(400).send('Username is already taken');
          } else {
            // Create a new user
            const insertQuery = 'INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)';
            db.query(insertQuery, [username, hashed_password, email], (insertErr, insertResults) => {
              if (insertErr) {
                console.error('MySQL query error:', insertErr);
                res.status(500).send('Internal Server Error');
              } else {
                // User registration successful, redirect to login page (replace '/login' with your desired route)
                res.redirect('/loginindex');
              }
            });
          }
        });
      });
    // ---------- handle GETs

    app.get("/", function (req, res) {
        res.render("index.ejs", { root: page_dir });
    });

    app.get("/index", function (req, res) {
        res.render("index.ejs", { root: page_dir });
    });

    app.get("/aboutusindex", (req, res) => {
        res.render("aboutusindex.ejs", { root: page_dir });
    });

    app.get("/budgetsindex", (req, res) => {
        res.render("budgetsindex.ejs", { root: page_dir });
    });

    app.get("/createaccountindex", (req, res) => {
        res.render("createaccountindex.ejs", { root: page_dir });
    });

    app.get("/loginindex", (req, res) => {
        res.render("loginindex.ejs", { root: page_dir });
    });

    app.get("/reportindex", (req, res) => {
        res.render("reportindex.ejs", { root: page_dir });
    });

    app.get("/settingsindex", (req, res) => {

        const plaidConn = true;
        res.render("settingsindex.ejs", { plaidConn, root: page_dir });
        
    });

    app.get("/transactionindex", (req, res) => {
        res.render("transactionindex.ejs", { root: page_dir });
    });
    
};
