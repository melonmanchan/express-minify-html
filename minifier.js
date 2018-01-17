'use strict';

var objectMerge = require('lodash.merge'),
    minify = require('html-minifier').minify;

function minifyHTML(opts) {
	var default_opts = {
		override: false,
		exception_url: false,
		htmlMinifier: {
			removeComments: true,
			collapseWhitespace: true,
			collapseBooleanAttributes: true,
			removeAttributeQuotes: true,
			removeEmptyAttributes: true
		}
	};

	if (!opts) {
		opts = {};
  }

  opts = objectMerge(default_opts, opts);

  if (opts.exception_url.constructor !== Array) {
    opts.exception_url = [ opts.exception_url ];
  }

  function minifier(req, res, next) {
    var skip = false;

    opts.exception_url.every(function(exception){
      switch (true) {
        case exception.constructor === RegExp:
          skip = exception.test(req.url);
          break;
        case exception.constructor === Function:
          skip = exception(req, res) || false;
          break;
        case exception.constructor === String:
          skip = req.url.match(exception) ? true : false;
          break;
        default:
      }

      return !skip;
    });

    var sendMinified = function (callback) {

      // No callback specified, just minify and send to client.
        if (typeof callback === 'undefined') {
          return function (err, html) {
            if (err) {
              return next(err);
            }

            res.sendMin(html);
          }
        } else {

          // Custom callback specified by user, use that one
          return function (err, html) {
            if (html) {
              html = minify(html, opts.htmlMinifier);
            }

            callback(err, html);
          }
        }
    };

    res.renderMin = function (view, renderOpts, callback) {
      this.render(view, renderOpts, sendMinified(callback));
    };

    res.sendMin = function (html) {
      this.send(minify(html, opts.htmlMinifier));
	};

    if (opts.override && !skip) {
      res.oldRender = res.render;
      res.oldSend = res.send;

      res.render = function (view, renderOpts, callback) {
        this.oldRender(view, renderOpts, sendMinified(callback));
      };

	  res.send = function (html) {
		this.oldSend(minify(html, opts.htmlMinifier));
	  };
    }

    return next();
  }

  return (minifier);
}

module.exports = minifyHTML;
