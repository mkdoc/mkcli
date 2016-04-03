function run(argv, opts, cb) {
  if(typeof opts === 'function') {
    cb = opts;
    opts = null;
  }

  opts = opts || {};

  /* istanbul ignore next: always pass argv in test env */
  argv = argv || process.argv.slice(2);

  var target = opts.target || this;

  function done(err, req) {
    cb.call(target, err || null, req);
  }

  if(!Array.isArray(opts.plugins)) {
    opts.plugins = [
      require('../plugin/hints'),
      require('../plugin/argv')
    ]
  }

  plugin(argv, target, opts, done);
}

function plugin(argv, target, opts, cb) {
  var plugins = opts.plugins.slice(0);

  var req = {
    argv: argv,
    runtime: opts
  };

  // aborts processing, no more plugin functions are executed
  // but control is returned to the callback
  function abort(err) {
    req.aborted = true;
    cb(err || null, req); 
  }

  req.abort = abort;

  function next(err) {
    if(err) {
      return cb(err); 
    }

    var func = plugins.shift();

    if(!func) {
      return cb(null, req); 
    }

    if(!func.name) {
      return cb(new Error('plugins may not be anonymous functions'), req);
    }

    // configuration for the middleware function
    // derived from the function name
    req.conf = opts[func.name] || {}

    try {
      func.call(target, req, next);
    }catch(e) {
      next(e); 
    }
  }
  next();
}

module.exports = run;
