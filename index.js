const path = require('path');
const url = require('url');

const R = require('ramda');
const debug = require('debug')('minimal-router');
const glob = require('glob');

const REQUIRED_EXPORTS = ['pathname', 'route', 'methods'];

// Copied and modified from https://github.com/tuckerconnelly/micro-open-api/blob/master/index.js

function minimalRouter(modulesDir) {
  /*** Load all the routes ***/

  const routes = {};

  glob.sync(path.join(modulesDir, '/**/*.js')).forEach(f => {
    console.log(f);
    const module = require(path.resolve(f));
    const difference = R.difference(
      REQUIRED_EXPORTS,
      Object.keys(module).filter(e => REQUIRED_EXPORTS.includes(e))
    );
    const hasAtLeastOneExport = difference.length < 3;
    if (hasAtLeastOneExport && difference.includes(REQUIRED_EXPORTS)) {
      console.warn(
        `minimal-router: missing exports ${JSON.stringify(difference)} in ${f}`
      );
      return;
    }

    routes[module.pathname] = module;
    routes[module.pathname].methods = routes[module.pathname].methods.map(m =>
      m.toLowerCase()
    );
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
