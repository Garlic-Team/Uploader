const express = require('express');
const app = express();
const fUpload = require('express-fileupload');

app.set('port', 3000);

const session = require('express-session');

app.set('view engine', 'ejs');
app.use(express.static('static'));
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(session({
    secret: 'secret session',
    resave: false,
    saveUninitialized: false,
    expires: 604800000,
}));
app.use(fUpload());
require('./router')(app);

app.listen(3000, () => console.info(`Listening on port 3000`));
