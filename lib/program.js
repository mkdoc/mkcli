var Argument = require('./argument')
  , Command = require('./command')
  , Option = require('./option')
  , Flag = require('./flag');

var re = new RegExp(
  // optional leading key specification
  '^([^:]+:\\s*)?'
  // list of command/option names
  + '((?:-{0,2}[\\w\\[\\]]+(?:,\\s*)?)+)'
  // option value
  + '((?:=|\\s+)[\\[<][^\\]>]+[\\]>])?'
  // optional type and default value specification
  + '(?:\\s*\\{([^}]+)\\})?'
);

/**
 *  Convert an argument name to camelcase.
 *
 *  @param str {String} The string to convert.
 *  @param ptn {String|RegExp} The pattern to split on.
 */
function camelcase(str, ptn) {
  ptn = (ptn instanceof RegExp) || typeof(ptn) === 'string' ? ptn : /-+/;
  // always strip leading hyphens
  str = str.replace(/^-+/, '');
  var parts = str.split(ptn);
  return parts.map(function(p, i) {
    if(i && p) {
      return p.charAt(0).toUpperCase() + p.slice(1);
    }
    return p;
  }).join('');
}

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
 *  Parse a string literal to a command, flag or option.
 *
 *  @static {function} parse
 *  @param {String} input the option definition.
 *  @param {Object} [opts] parsing options.
 *
 *  @option {Boolean=false} command parse as a command.
 *  @option {Boolean=true} camelcase convert automatic keys to camelcase.
 */
function parse(input, opts) {
  opts = opts || {};

  var arg
    , res = {}
    , extra
    , pair;

  input.replace(re, function(match, key, names, value, info) {
    res.key = key;
    res.names = names;
    res.value = value;
    res.info = info;
  })

  if(!res.names) {
    throw new TypeError('command or option declaration has no names'); 
  }

  var names = res.names.split(/,\s*/)
    , keys;

  opts.camelcase = opts.camelcase !== undefined ? opts.camelcase : true;

  // work out automatic key generation from longest option name
  if(!res.key) {
    // strip leading hyphens from list of option names
    keys = names.map(function strip(nm) {
      return nm.replace(/^-{1,2}/, ''); 
    })

    // sort keys by longest to shortest on `length` property
    keys = keys.sort(function(a, b) {
      a = a.length;
      b = b.length;
      if(a === b) {
        return 0; 
      } 
      return a < b ? 1 : -1;
    })

    res.key = opts.camelcase ? camelcase(keys[0]) : keys[0];
  }else{
    res.key = res.key.replace(/:\s*$/, '');
  }

  // no value specification so create a flag option
  if(opts.command) {
    arg = new Command(); 
  }else if(!res.value) {
    arg = new Flag(); 
  }else{
    extra = res.value.trim();
    arg = new Option();
    arg.extra = res.value;
    arg.multiple = Boolean(~extra.indexOf('...'));
    arg.required = Boolean(~extra.indexOf('<') && ~extra.indexOf('>'))

    if(res.info) {
      // just the type info
      if(!~res.info.indexOf('=')) {
        arg.kind = res.info; 
      }else{
        pair = res.info.split('=');

        // set kind of option value
        if(pair[0]) {
          arg.kind = pair[0];
        }

        // set default value for option
        if(pair[1]) {
          arg.value = pair[1];
        }
      }
    }
  }

  arg.literal = input;
  arg.key = res.key;
  arg.names = names;

  return arg;
}

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

  var parser = opts.parser || require('cli-argparse')
    , args = parser(argv, opts.hints || this.hints())
    , target = opts.target || this
    , k;

  for(k in args.flags) {
    target[k] = args.flags[k];
  }

  for(k in args.options) {
    target[k] = args.options[k];
  }

  function done(err) {
    cb.call(target, err);
  }

  if(Array.isArray(opts.plugins)) {
    plugin(args, target, opts, done);
  }else{
    done();
  }
}

function plugin(args, target, opts, cb) {
  var plugins = opts.plugins.slice(0);
  function next(err) {
    if(err) {
      return cb(err); 
    }
    var func = plugins.shift(); 
    if(!func) {
      return cb(); 
    }
    if(!func.name) {
      return cb(new Error('plugins may not be anonymous functions')); 
    }

    func.call(target, opts[func.name], next);
  }
  next();
}

/**
 *  Get an object of hints for an argument parser.
 *
 *  @function hints
 */
function hints() {
  var o = {alias: {}, options: [], flags: []}
    , k
    , opt
    , names;

  function flag(nm) {
    if(/^-{2,}/.test(nm)) {
      o.flags.push(nm); 
    }
  }

  function option(nm) {
    if(/^-{1,1}[^-]/.test(nm)) {
      o.options.push(nm); 
    }
  }

  for(k in this.options) {
    opt = this.options[k];
    names = opt.names;
    o.alias[names.join(' ')] = opt.key;
    if(opt.type === Argument.FLAG) {
      names.forEach(flag);
    }else if(opt.type === Argument.OPTION) {
      names.forEach(option);
    }
  }

  return o;
}

Program.prototype.load = load;
Program.prototype.run = run;
Program.prototype.hints = hints;

Program.parse = parse;

module.exports = Program;
