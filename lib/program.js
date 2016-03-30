var Command = require('./command')
  , Option = require('./option')
  , Flag = require('./flag');

var re = {
  opt: new RegExp(
    // optional leading key specification
    '^([^:]+:\\s*)?'
    // list of option names
    + '((?:-{1,2}[\\w]+(?:,\\s*)?)+)'
    // option value
    + '((?:=|\s+)[\[<]{1,1}[^\]>]+[\]>])?'
  )
}

/**
 *  Represents a command line program.
 *
 *  @constructor Program
 */
function Program() {
  Command.apply(this, arguments);
}

Program.prototype = Object.create(Command.prototype);

/**
 *  Parse a string to a flag or option.
 *
 *  @function opt
 *  @param {String} input the option definition.
 */
function opt(input) {
  var arg
    , res = {};

  //console.dir(input);

  input.replace(re.opt, function(match, key, names, value) {
    //console.error('got match');
    //console.error(arguments);
    res.key = key;
    res.names = names;
    res.value = value;
  })

  if(!res.names) {
    throw new TypeError('option declaration has no names'); 
  }

  var names = res.names.split(/,\s*/)
    , keys;

  // work out automatic key generation from longest option name
  if(!res.key) {
    // strip leading hyphens from list of option names
    keys = names.map(function strip(nm) {
      return nm.replace(/^-{1,2}/, ''); 
    })

    // sort keys by longest to shortest
    keys = keys.sort(function(a, b) {
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
  if(!res.value) {
    arg = new Flag(); 
  }else{
    arg = new Option();
  }

  arg.literal = input;
  arg.key = res.key;
  arg.names = names;

  return arg;
}

Program.opt = opt;

module.exports = Program;
