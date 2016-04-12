var through = require('through3')
  , ast = require('mkast')
  , Node = ast.Node
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
    , args = '_arguments \\' + EOL
    , indent = this.indent
    , i
    , fre = /(\[|<)file/i
    , dre = /(\[|<)dir/i
    , synopsis
    , hasFiles = false
    , buf = '';

  if(chunk.synopsis) {
    for(i = 0;i < chunk.synopsis.length;i++) {
      synopsis = chunk.synopsis[i];
      if(fre.test(synopsis)) {
        hasFiles = true;
        break;
      }
    } 
  }

  function getOptionSpec(options) {
    var k
      , opt
      , opts = '';
    for(k in options) {
      opt = options[k];
      opts += indent;
      if(opt.names.length > 1) {
        opts += '"(' + opt.names.join(' ') + ')"';
        opts += '{' + opt.names.join(',')
          + (opt.type === 'option' ? '=' : '') + '}';
        opts += '"[' + opt.description + ']';
      }else{
        opts += '"' + opt.names[0] + (opt.type === 'option' ? '=' : '');
        opts += '[' + opt.description + ']';
      }

      if(opt.extra) {
        if(fre.test(opt.extra)) {
          opts += ':file:_files';
        }else if(dre.test(opt.extra)) {
          opts += ':directory:_directories';
        }
      }
      opts += '" \\' + EOL;
    }
    opts += indent;

    if(hasFiles) {
      opts += '"::files:_files" '; 
    }
      
    opts += '&& return 0;' + EOL;
    return opts;
  }

  if(isSimple) {
    buf += compdef;
    buf += args; 
    buf += getOptionSpec(chunk.options);
  }

  this.push(Node.createNode(Node.TEXT, {literal: buf}));

  cb();
}

Zsh.prototype.render = render;

module.exports = through.transform(transform, {ctor: Zsh});
