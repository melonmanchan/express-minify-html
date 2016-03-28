'use strict';

var express = require('express');
var request = require('supertest');
var test    = require('tape');
var fs      = require('fs');

var minifyHTML = require('../minifier.js');
var expectedHTML = fs.readFileSync(__dirname + '/test.output.html', 'utf8');

var exhbs = require('express-handlebars');
var hbs  = exhbs.create({
    defaultLayout: 'test',
    layoutsDir:    __dirname
});

var nunjucks = require('nunjucks');
nunjucks.configure(__dirname, {
    autoescape: true,
    express: app
});

var app = express();

app.engine('handlebars', hbs.engine);
app.engine('nunjucks', nunjucks.render);

app.set('views', __dirname);

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

app.get('/test', function (req, res, next) {
    res.render('test', { hello : 'world' });
});

function checkMinified(t) {
    request(app)
        .get('/test')
        .expect(200)
        .end(function (err, res) {
            t.equal(res.text, expectedHTML);
            t.end();
        });
};

test('Should minify EJS templates', function (t) {
    app.set('view engine', 'ejs');

    checkMinified(t);
});

test('Should minify Jade templates', function (t) {
    app.set('view engine', 'jade');

    checkMinified(t);
});

test('Should minify Handlebars templates', function (t) {
    app.set('view engine', 'handlebars');

    checkMinified(t);
});

test('Should minify Nunjucks templates', function (t) {
    app.set('view engine', 'nunjucks');

    checkMinified(t);
});

