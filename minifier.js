'use strict';

var minify = require('html-minifier').minify;


function minifyHTML(opts) {
    if (!opts) opts = {};

    function minifier(req, res, next) {

        var sendMinified = function (err, html) {
            if (err) {
                console.error(err)
                if (opts.displayErrors === true) {
                    res.send('Rendering error: ' + err.message);
                } else {
                    res.sendStatus(500);
                }
            } else {
                html = minify(html, opts.htmlMinifier);
                res.send(html);
            }
        };

        if (opts.override === false) {
            res.renderMin = function (view, renderOpts) {
                this.render(view, renderOpts, sendMinified);
            }
        } else {
            res.oldRender = res.render;
            res.render = function (view, renderOpts) {
                this.oldRender(view, renderOpts, sendMinified);
            };
        }

        return next();
    }

    return (minifier);
}

module.exports = minifyHTML;

