'use strict';

var express = require('express');
var request = require('supertest');
var test    = require('tape');

var minifyHTML = require('../minifier.js');

var app = express();

app.set('view engine', 'ejs');
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

test('Should minify EJS templates', function (t) {
    request(app)
        .get('/test')
        .expect(200)
        .end(function (err, res) {
            t.equal(res.text, '<!DOCTYPE html><html><head class=head><meta charset=UTF-8><title>Express minify HTML handlebars example</title></head><body id=body>Hello world</body><script type=text/javascript>function reallyNiceFunction(){return"Hello!"}</script></html>');
            t.end();
        });
});

