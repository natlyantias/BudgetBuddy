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
        const plaidConn = false;

        res.render("settingsindex.ejs", { plaidConn, root: page_dir });
    });

    app.get("/transactionindex", (req, res) => {
        res.render("transactionindex.ejs", { root: page_dir });
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
