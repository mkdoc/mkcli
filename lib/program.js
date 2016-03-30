var Command = require('./command')
  , Option = require('./option')
  , Flag = require('./flag');

var re = new RegExp(
  // optional leading key specification
  '^([^:]+:\\s*)?'
  // list of command/option names
  + '((?:-{0,2}[\\w]+(?:,\\s*)?)+)'
  // option value
  + '((?:=|\\s+)[\\[<][^\\]>]+[\\]>])?'
  // optional type and default value specification
  + '(?:\\s*\\{([^}]+)\\})?'
);

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
 *  @private
 */
function getResult(input) {
  var res = {}

  input.replace(re, function(match, key, names, value, info) {
    res.key = key;
    res.names = names;
    res.value = value;
    res.info = info;
  })

  if(!res.names) {
    throw new TypeError('option declaration has no names'); 
  }

  return res;
}

/**
 *  Parse a string literal to a flag or option.
 *
 *  @function opt
 *  @param {String} input the option definition.
 */
function opt(input, Type) {
  var arg
    , res = this.getResult(input)
    , extra
    , pair;

  var names = res.names.split(/,\s*/)
    , keys;

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

    res.key = keys[0];
  }else{
    res.key = res.key.replace(/:\s*$/, '');
  }

  // no value specification so create a flag option
  if(Type) {
    arg = new Type(); 
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
 *  Parse a string literal to a command.
 *
 *  @function cmd
 *  @param {String} input the option definition.
 */
function cmd(input) {
  return this.opt(input, Command);
}

Program.opt = opt;
Program.cmd = cmd;

Program.getResult = getResult;

module.exports = Program;
