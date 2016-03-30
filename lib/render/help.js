var through = require('through3')
  , EOL = '\n'
  , SPACE = ' ';

/**
 *  Transforms a program definition to plain text help.
 */
function Help(opts) {
  opts = opts || {};
  this.indent = opts.indent || SPACE + SPACE;
}

function transform(chunk, encoding, cb) {
  var k
    , arg
    , out = this.push.bind(this)
    , opts = Object.keys(chunk.options)
    , cmds = Object.keys(chunk.commands);

  function cr(num) {
    num = num || 1; 
    while(num--) {
      out(EOL);
    }
  }

  if(chunk.name) {
    out(chunk.name);
    if(chunk.synopsis) {
      out(SPACE + chunk.synopsis); 
    }
    cr();
  }

  //console.error(chunk.options)

  // print commands
  if(cmds.length) {
    cr();
    for(k in chunk.commands) {
      arg = chunk.commands[k];
      out(this.indent + arg.format());
      cr();
    }
  }

  // print options
  if(opts.length) {
    cr();
    for(k in chunk.options) {
      arg = chunk.options[k];
      out(this.indent + arg.format());
      cr();
    }
  }

  cb();
}

module.exports = through.transform(transform, {ctor: Help});
