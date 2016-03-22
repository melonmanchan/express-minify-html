'use strict';

var express    = require('express');
var minifyHTML = require('../../minifier.js');
var exhbs      = require('express-handlebars');

var app = express();

var hbs = exhbs.create({
    defaultLayout: 'main',
    layoutsDir:    './'
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', './');

app.use(minifyHTML({
    override:      true,
    htmlMinifier: {
        removeComments:            true,
        collapseWhitespace:        true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes:     true,
        removeEmptyAttributes:     true,
        minifyJS:                  true
    }
}));

app.get('/', function(req, res) {
    res.render('main', { hello: 'world' });
});

var server = app.listen(3000, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Handlebars example app listening at http://%s:%s', host, port);
});
