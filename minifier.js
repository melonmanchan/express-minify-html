'use strict';

var minify = require('html-minifier');

function minifyHTML(opts) {
    function minifier(req, res, next) {
        if (opts.override === true) {
            res.oldRender = res.render;
            res.render = function (view, renderOpts) {
                this.oldRender(view, renderOpts, function (err, html) {
                    if (err) throw err;
                    html = minify.minify(html, opts.minifierOpts);
                    res.send(html);
                });
            };
        } else {
            res.minRender = function (view, renderOpts) {
                this.render(view, renderOpts, function (err, html) {
                    if (err) throw err;
                    html = minify.minify(html, opts.minifierOpts);
                    res.send(html);
                });
            }
        }
        return next();
    }
    return (minifier);
}

module.exports = minifyHTML;