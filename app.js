/*
----------app.js
----------entry file for application
----------
*/

// imports
const path = require("path");
//use express.js
const express = require("express");
const app = express();

//import routes.js
require("./routes")(app);

// serve /public folder
app.use(express.static("public"));


// define listen port
const port = 80;
// start the server and catch any errors that happen in the process
app.listen(port, (error) => {
  if (error) {
    console.log("Something went wrong ", error);
  } else {
    console.log("Server is listening on port " + port);
  }
});
