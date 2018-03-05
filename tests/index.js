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
        handlebars: fs.readFileSync(__dirname + '/test.output.raw.handlebars.html', 'utf8')
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
    exception_url: ['skip-minify'],
    htmlMinifier: {
        removeComments:            true,
        collapseWhitespace:        true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes:     true,
        removeEmptyAttributes:     true,
        minifyJS:                  true
    }
}));

app
  .get('/test', function (req, res, next) {
    res.render('test', { hello : 'world' });
  })
  .get('/test-broken', function (req, res, next) {
    res.render('test-broken', { hello : 'world' });
  })
  .get('/skip-minify', function (req, res, next) {
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
}

function checkSkipMinified(t, engine) {
    request(app)
        .get('/skip-minify')
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

test('Should skip minify EJS templates', function (t) {
    app.set('view engine', 'ejs');

    checkSkipMinified(t, 'ejs');
});

test('Should skip minify Pug templates', function (t) {
    app.set('view engine', 'pug');

    checkSkipMinified(t, 'pug');
});

test('Should skip minify Handlebars templates', function (t) {
    app.set('view engine', 'handlebars');

    checkSkipMinified(t, 'handlebars');
});

test('Should skip minify Nunjucks templates', function (t) {
    app.set('view engine', 'nunjucks');

    checkSkipMinified(t);
});

test('Should pass error to express on broken html', function (t) {
	request(app)
		.get('/test-broken')
		.expect(500).end(function (err, res) {
			t.end();
		});
});
