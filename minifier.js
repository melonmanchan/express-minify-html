'use strict';

var minify = require('html-minifier').minify;

function minifyHTML(opts) {
    if (!opts) opts = {};
    function minifier(req, res, next) {
        if (opts.override === false) {
            res.renderMin = function (view, renderOpts) {
                this.render(view, renderOpts, function (err, html) {
                    if (err) throw err;
                    html = minify(html, opts.htmlMinifier);
                    res.send(html);
                });
            }
        } else {
            res.oldRender = res.render;
            res.render = function (view, renderOpts) {
                this.oldRender(view, renderOpts, function (err, html) {
                    if (err) throw err;
                    html = minify(html, opts.htmlMinifier);
                    res.send(html);
                });
            };
        }
        return next();
    }
    return (minifier);
}

module.exports = minifyHTML;