var Command = require('./command');

/**
 *  Represents a command line program.
 *
 *  @constructor Program
 */
function Program() {
  Command.apply(this, arguments);
  this.type = Command.PROGRAM;
}

Program.prototype = Object.create(Command.prototype);

/**
 *  Load a program definition into this instance assigning the definition 
 *  properties to this program.
 *
 *  @function load
 *  @param {Object} def the program definition.
 */
function load(def) {
  for(var k in def) {
    this[k] = def[k];
  }
}

function run(argv, opts, cb) {
  if(typeof opts === 'function') {
    cb = opts;
    opts = null;
  }

  opts = opts || {};
  argv = argv || process.argv.slice(2);

  var target = opts.target || this;

  function done(err, req) {
    cb.call(target, err, req);
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
      return cb(new Error('plugins may not be anonymous functions')); 
    }

    // configuration for the middleware function
    // derived from the function name
    req.conf = opts[func.name] || {}

    func.call(target, req, next);
  }
  next();
}

Program.prototype.load = load;
Program.prototype.run = run;

module.exports = Program;
