var Argument = require('../lib/argument');

/**
 *  Get an object of hints for an argument parser.
 *
 *  @function build 
 */
function build() {
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

function hints(req, cb) {
  req.hints = build.call(req.conf);
  cb();
}

module.exports = hints;
