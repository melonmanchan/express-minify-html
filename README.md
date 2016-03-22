# express-minify-html
Express middleware wrapper around HTML minifier

## Description

This express middleware simply enchances the regular 'render' method of the response object for minifying HTML.

## Usage

```js

var express    = require('express');
var minifyHTML = require('express-minify-html');

var app = express();

app.use(minifyHTML({
    override:      true,
    displayErrors: process.env.NODE_ENV === 'development',
    htmlMinifier: {
        removeComments:            true,
        collapseWhitespace:        true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes:     true,
        removeEmptyAttributes:     true,
        minifyJS:                  true
    }
}));

app.get('hello', function (req, res, next) {
    res.render('helloTemplate', { hello : 'world'}, function(err, html) {
        // The output is minified, huzzah!
        console.log(html);
        res.send(html);
    })
});

```
Set 'override' to false if you don't want to hijack the ordinary res.render function. This adds an additional res.renderMin function to the response object to render minimized HTML. 

The 'htmlMinifier' opts are simply passed on to the html-minifier plugin. For all the available configuration options, see [the original repo!](https://github.com/kangax/html-minifier/blob/gh-pages/README.md)

The displayErrors parameter is used to determine whether or not possible rendering error messages
(For example, Layout file not found) should be themselves rendered as HTML, or if the app should
simply respond with a status code of 500, and nothing more.

If no callback is provided, res.render/res.renderMin sends the minified HTML to the client just as the regular
express res.render does. Otherwise, the callback is called with the error object and the minified HTML content, as
demonstrated above.

Additionally, if no callback is provided - error handling will be handled as explained when referencing displayErrors, but if you wish you can override this default behavior and define your own custom error callback such as this:

```js
	app.use(minifyHTML({
		override:      true,
		errCallback: function(err, req, res, next)
		{
			next(err);
		},
		htmlMinifier: {
			removeComments:            true,
			collapseWhitespace:        true,
			collapseBooleanAttributes: true,
			removeAttributeQuotes:     true,
			removeEmptyAttributes:     false,
			minifyJS:                  true
		}
	}));
```

Full examples can naturally be found under the 'examples'-folder of this repository!

## License

MIT © [Matti Jokitulppo](http://mattij.com)

[![npm version](https://badge.fury.io/js/express-minify-html.svg)](https://badge.fury.io/js/express-minify-html)
[![npm downloads](https://img.shields.io/npm/dm/express-minify-html.svg)](https://img.shields.io/npm/dm/express-minify-html.svg)
