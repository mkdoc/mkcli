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
  var isSimple = chunk.options && !chunk.commands
    , compdef = '#compdef ' + chunk.name + EOL
    , args = '_arguments -C \\' + EOL
    , indent = this.indent
    , buf = '';

  function isLong(names) {
    for(var i = 0;i < names.length;i++) {
      if(!/^--/.test(names[i])) {
        return false;
      } 
    }
    return true;
  }

  function getOptionSpec(options) {
    var k
      , opt
      , makeLong
      , inline = ''
      , opts = '';
    for(k in options) {
      inline = '';
      opt = options[k];
      opts += indent;
      makeLong = isLong(opt.names);
      if(!isLong) {
        opts += '{' + opt.names.join(',') + '}'
      }else if(isLong && opt.type === 'flag') {
        inline = opt.names.join(',');
      }else if(isLong) {
        inline = opt.names.join(',') + '=-';
      }
      opts += '\'' + inline + '[' + opt.description + ']\''
      opts += ' \\' + EOL;
    }
    opts += indent + '\'*::arguments:_files\' && return 0;' + EOL;
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
