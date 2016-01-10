'use strict';

var minify = require('html-minifier').minify;

function minifyHTML(opts) {
    if (!opts) opts = {};

    function minifier(req, res, next) {

        var sendMinified = function (callback) {

            // No callbak specified, just minify and send to client.
            if (typeof callback === 'undefined') {
                return function (err, html) {
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
                }
            } else {

                // Custom callback specified by user, use that one
                return function (err, html) {
                    html = minify(html, opts.htmlMinifier);
                    callback(err, html);
                }
            }
        };

        if (opts.override === false) {
            res.renderMin = function (view, renderOpts, callback) {
                this.render(view, renderOpts, sendMinified(callback));
            }
        } else {
            res.oldRender = res.render;
            res.render = function (view, renderOpts, callback) {
                this.oldRender(view, renderOpts, sendMinified(callback));
            };
        }

        return next();
    }

    return (minifier);
}

module.exports = minifyHTML;

