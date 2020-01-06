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
    // Ignore __tests__ when NODE_ENV !== test
    if (
      process.env.NODE_ENV !== 'test' &&
      (f.includes('__tests__') || f.includes('__mocks__'))
    )
      return;

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

    if (module.pathname) {
      console.warn(
        `${f}: Exporting pathname is deprecated and will be removed in a future version.`
      );
    }

    if (module.route) {
      console.warn(
        `${f}: exports.route is deprecated and will be removed in a future version. Use exports.default now.`
      );
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

    const fn = routes[parsed.pathname].default || routes[parsed.pathname].route;

    return fn(req, res, ...args);
  };
}

module.exports = minimalRouter;
