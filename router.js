module.exports = (app) => {
    // '/'
    app.use('/', require('./routes/index'));

    // '/authorize'
    app.use('/authorize', require('./routes/discord'));
    app.use('/usystem', require('./routes/uploader'));
}