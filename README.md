# express-minify-html
Express middleware wrapper around HTML minifier

## Usage

```js

var express    = require('express');
var minifyHTML = require('express-minify-html');

var app = express();

app.use(minifyHTML({
    override: true,
    htmlMinifier: {
        removeComments:            true,
        collapseWhitespace:        true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes:     true,
        removeEmptyAttributes:     true,
        minifyJS:                  true
    }
}));

```
Set 'override' to false if you don't want to hijack the ordinary res.render function. This adds an additional res.renderMin function to the response object to render minimized HTML. The 'htmlMinifier' opts are simply passed on to the html-minifier plugin. For all the available configuration options, see [the original repo!](https://github.com/kangax/html-minifier/blob/gh-pages/README.md)

Full examples can naturally be found under the 'examples'-folder of this repository!
