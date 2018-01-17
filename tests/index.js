'use strict';

var express = require('express');
var request = require('supertest');
var test    = require('tape');
var fs      = require('fs');

var minifyHTML = require('../minifier.js');
var expectedHTML = fs.readFileSync(__dirname + '/test.output.html', 'utf8'),
    expectedRawHTML = {
        default: fs.readFileSync(__dirname + '/test.output.raw.html', 'utf8'),
        pug: fs.readFileSync(__dirname + '/test.output.raw.pug.html', 'utf8'),
        handlebars: fs.readFileSync(__dirname + '/test.output.raw.handlebars.html', 'utf8'),
    };

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

app.locals.pretty = true;

app.set('views', __dirname);

app.use(minifyHTML({
    override:      true,
    exception_url: ['render-skip-minify', 'send-skip-minify'],
    htmlMinifier: {
        removeComments:            true,
        collapseWhitespace:        true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes:     true,
        removeEmptyAttributes:     true,
        minifyJS:                  true
    }
}));

app.get('/render-test', function (req, res, next) {
    res.render('test', { hello : 'world' });
})
.get('/render-skip-minify', function (req, res, next) {
	res.render('test', { hello : 'world' });
})
.get('/send-test', function (req, res, next) {
	res.send(expectedRawHTML.default);
})
.get('/send-skip-minify', function (req, res, next) {
	res.send(expectedRawHTML.default);
});

function checkMinified(t, path) {
    request(app)
        .get(path || '/render-test')
        .expect(200)
        .end(function (err, res) {
            t.equal(res.text, expectedHTML);
            t.end();
        });
}

function checSkipMinified(t, engine, path) {
    request(app)
        .get(path || '/render-skip-minify')
        .expect(200)
        .end(function (err, res) {
            var raw = expectedRawHTML[engine] || expectedRawHTML.default;
            t.equal(res.text.trim(), raw.trim());
            t.end();
        });
}

test('Should minify EJS templates', function (t) {
    app.set('view engine', 'ejs');

    checkMinified(t);
});

test('Should minify Pug templates', function (t) {
    app.set('view engine', 'pug');

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

test('Should minify on response.send', function (t) {
    checkMinified(t, '/send-test');
});

test('Should skip minify EJS templates', function (t) {
    app.set('view engine', 'ejs');

    checSkipMinified(t, 'ejs');
});
test('Should skip minify Pug templates', function (t) {
    app.set('view engine', 'pug');

    checSkipMinified(t, 'pug');
});

test('Should skip minify Handlebars templates', function (t) {
    app.set('view engine', 'handlebars');

    checSkipMinified(t, 'handlebars');
});

test('Should skip minify Nunjucks templates', function (t) {
    app.set('view engine', 'nunjucks');

    checSkipMinified(t);
});

test('Should skip minify on response.send', function (t) {
    checSkipMinified(t, null, '/send-skip-minify');
});
