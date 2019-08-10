const path = require('path');
const url = require('url');
const assert = require('assert');

const R = require('ramda');
const debug = require('debug')('minimal-router');
const glob = require('glob');

const REQUIRED_EXPORTS = ['route'];

// Copied and modified from https://github.com/tuckerconnelly/micro-open-api/blob/master/index.js

function minimalRouter(modulesDir) {
  /*** Load all the routes ***/

  const routes = {};

  glob.sync(path.join(modulesDir, '/**/*.js')).forEach(f => {
    const module = require(path.resolve(f));
    const difference = R.difference(
      REQUIRED_EXPORTS,
      Object.keys(module).filter(e => REQUIRED_EXPORTS.includes(e))
    );
    const hasAtLeastOneExport = difference.length < REQUIRED_EXPORTS.length;
    if (hasAtLeastOneExport && difference.includes(REQUIRED_EXPORTS)) {
      console.warn(
        `minimal-router: missing exports ${JSON.stringify(difference)} in ${f}`
      );
      return;
    }

    const pathname =
      module.pathname || f.match(new RegExp(`^${modulesDir}(.+).js$`))[1];

    assert(pathname, `minimal-router: couldn't resolve pathname for ${f}`);

    routes[pathname] = module;
    routes[pathname].methods = routes[pathname].methods
      ? routes[pathname].methods.map(m => m.toLowerCase())
      : ['post'];
  });

  debug('Found routes: %O', routes);

  /*** Middleware HOF ***/

  return next => async (req, res, ...args) => {
    const parsed = url.parse(req.url);
    debug(`${req.method} ${parsed.pathname}`);

    if (
      !routes[parsed.pathname] ||
      !routes[parsed.pathname].methods.includes(req.method.toLowerCase())
    )
      return next(req, res, ...args);

    return routes[parsed.pathname].route(req, res, ...args);
  };
}

module.exports = minimalRouter;
