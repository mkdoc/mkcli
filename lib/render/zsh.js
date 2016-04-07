var through = require('through3')
  , EOL = require('os').EOL;

/**
 *  Render a program definition as a zsh completion file.
 *
 *  @constructor Zsh
 *  @param {Object} opts renderer options.
 */
function Zsh(opts) {
  this.indent = opts.indent || '  ';
}

function transform(chunk, encoding, cb) {
  this.render(chunk, cb);
}

function render(chunk, cb) {
  console.error(chunk);
  var isSimple = chunk.options && !chunk.commands
    , compdef = '#compdef ' + chunk.name + EOL
    , args = 'integer NORMARG\n_arguments -n -C -s \\' + EOL
    , indent = this.indent
    , buf = '';

  function getOptionSpec(options) {
    var k
      , opt
      , opts = '';
    for(k in options) {
      opt = options[k];
      opts += indent;
      opts += '\'(' + opt.names.join(' ') + ')\''
      opts += '{' + opt.names.join(' ') + '}'
      opts += '\'[' + opt.description + ']\''
      opts += ' \\' + EOL;
    } 
    return opts;
  }

  if(isSimple) {
    buf += compdef;
    buf += args; 
    buf += getOptionSpec(chunk.options);
  }

  this.push(buf);

  cb();
}

Zsh.prototype.render = render;

module.exports = through.transform(transform, {ctor: Zsh});
