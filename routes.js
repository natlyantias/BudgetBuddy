/*
----------routes.js
----------handle web page navigation
----------CREDIT: https://stackoverflow.com/questions/6059246/how-to-include-route-handlers-in-multiple-files-in-express
----------CREDIT: https://www.hacksparrow.com/webdev/express/handling-processing-forms.html
*/


// enable routes.js to be used in app.js
module.exports = function (app) {

    const page_dir = app.get("views");

    // ---------- handle GETs

    app.get("/", function (req, res) {
        res.sendFile("index.html", { root: page_dir });
    });

    app.get("/index.html", function (req, res) {
        res.sendFile("index.html", { root: page_dir });
    });

    app.get("/aboutusindex.html", (req, res) => {
        res.sendFile("aboutusindex.html", { root: page_dir });
    });

    app.get("/budgetsindex.html", (req, res) => {
        res.sendFile("budgetsindex.html", { root: page_dir });
    });

    app.get("/createaccountindex.html", (req, res) => {
        res.sendFile("createaccountindex.html", { root: page_dir });
    });

    app.get("/loginindex.html", (req, res) => {
        res.sendFile("loginindex.html", { root: page_dir });
    });

    app.get("/reportindex.html", (req, res) => {
        res.sendFile("reportindex.html", { root: page_dir });
    });

    app.get("/settings", (req, res) => {
        res.sendFile("settingsindex.html", { root: page_dir });
    });

    app.get("/transactionindex.html", (req, res) => {
        res.sendFile("transactionindex.html", { root: page_dir });
    });


    // ---------- handle POSTs

    app.post("/login_request", (req, res) => {
        //for testing purposes
        console.log(req.body);

        const username = req.body.username;
        const password = req.body.password;

        //for testing purposes
        const htmlDis = `<h1>Username:</h1><br></br><h2>${username}</h2><br></br><h1>Password:</h1><br></br><h2>${password}</h2>`;

        res.setHeader('Content-Type', 'text/html');
        res.send(htmlDis);
    });

    
};
