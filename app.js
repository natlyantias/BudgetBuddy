/*
----------app.js
----------entry file for application
*/

// imports
const express = require("express");
const path = require("path");
//use express.js
const app = express();

//
const page_dir = app.get('views');

// define listen port
const port = 3000;

// serve /public folder
app.use(express.static("public"));

//routes

// Set the path for the 'views' directory
app.set("views", path.join(__dirname, "views"));

// Serve the index.html from the 'views' directory
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: page_dir });
});

// Serve the aboutusindex.html from the 'views' directory
app.get("/aboutusindex.html", (req, res) => {
  res.sendFile("aboutusindex.html", { root: page_dir });
});

app.get('/index.html', (req, res) => {
    res.sendFile('index.html', { root: page_dir });
});

app.get('/aboutusindex.html', (req, res) => {
    res.sendFile('aboutusindex.html', { root: page_dir });
});

// Route for budgetsindex.html
app.get('/budgetsindex.html', (req, res) => {
    res.sendFile('budgetsindex.html', { root: page_dir });
});

// Route for createaccountindex.html
app.get('/createaccountindex.html', (req, res) => {
    res.sendFile('createaccountindex.html', { root: page_dir });
});

// Route for loginindex.html
app.get('/loginindex.html', (req, res) => {
    res.sendFile('loginindex.html', { root: page_dir });
});

// Route for reportindex.html
app.get('/reportindex.html', (req, res) => {
    res.sendFile('reportindex.html', { root: page_dir });
});

// Route for settingsindex.html
app.get('/settingsindex.html', (req, res) => {
    res.sendFile('settingsindex.html', { root: page_dir });
});

// Route for transactionindex.html
app.get('/transactionindex.html', (req, res) => {
    res.sendFile('transactionindex.html', { root: page_dir });
});

// error handling
app.listen(port, (error) => {
  if (error) {
    console.log("Something went wrong ", error);
  } else {
    console.log("Server is listening on port " + port);
  }
});
