// imports
const express = require('express');
const path = require('path');
const app = express();

const port = 3000;

// serve /public folder

app.use(express.static('public'));

// Set the path for the 'views' directory
app.set('views', path.join(__dirname, 'views'));

//routes

// Serve the index.html from the 'views' directory
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: app.get('views') });
});

// Serve the aboutusindex.html from the 'views' directory
app.get('/aboutusindex.html', (req, res) => {
    res.sendFile('aboutusindex.html', { root: app.get('views') });
});

// error handling

app.listen(port, (error) => {
    if (error) {
        console.log('Something went wrong', error);
    } else {
        console.log('Server is listening on port ' + port);
    }
});
