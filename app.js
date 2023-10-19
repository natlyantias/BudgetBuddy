/*
----------app.js
----------entry file for application
*/

// imports
const express = require("express");
const path = require("path");
//use express.js
const app = express();

// define listen port
const port = 3000;

// other folders

// serve /public folder
app.use(express.static("public"));

//routes

// Set the path for the 'views' directory
app.set("views", path.join(__dirname, "views"));

// Serve the index.html from the 'views' directory
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: app.get("views") });
});

// Serve the aboutusindex.html from the 'views' directory
app.get("/aboutusindex.html", (req, res) => {
  res.sendFile("aboutusindex.html", { root: app.get("views") });
});

app.get('/index.html', (req, res) => {
    res.sendFile('index.html', { root: app.get('views') });
});

app.get('/aboutusindex.html', (req, res) => {
    res.sendFile('aboutusindex.html', { root: app.get('views') });
});

// Route for budgetsindex.html
app.get('/budgetsindex.html', (req, res) => {
    res.sendFile('budgetsindex.html', { root: app.get('views') });
});

// Route for createaccountindex.html
app.get('/createaccountindex.html', (req, res) => {
    res.sendFile('createaccountindex.html', { root: app.get('views') });
});

// Route for loginindex.html
app.get('/loginindex.html', (req, res) => {
    res.sendFile('loginindex.html', { root: app.get('views') });
});

// Route for reportindex.html
app.get('/reportindex.html', (req, res) => {
    res.sendFile('reportindex.html', { root: app.get('views') });
});

// Route for settingsindex.html
app.get('/settingsindex.html', (req, res) => {
    res.sendFile('settingsindex.html', { root: app.get('views') });
});

// Route for transactionindex.html
app.get('/transactionindex.html', (req, res) => {
    res.sendFile('transactionindex.html', { root: app.get('views') });
});

// error handling
app.listen(port, (error) => {
  if (error) {
    console.log("Something went wrong", error);
  } else {
    console.log("Server is listening on port " + port);
  }
});
