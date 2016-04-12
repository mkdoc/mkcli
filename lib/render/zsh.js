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
    , compdef = '#compdef ' + chunk.names.join(' ') + EOL
    , buf = compdef;

  if(isSimple) {
    buf += this.getArgumentSpec(chunk, chunk.options);
  }

  this.push(Node.createNode(Node.TEXT, {literal: buf}));

  cb();
}

function getArgumentSpec(chunk, options) {
  var k
    , opt
    , opts = '_arguments \\' + EOL
    , isOption
    , indent = this.indent
    , i
    , fre = /(\[|<)file/i
    , dre = /(\[|<)dir/i
    , synopsis
    , hasFiles = false;

  if(chunk.synopsis) {
    for(i = 0;i < chunk.synopsis.length;i++) {
      synopsis = chunk.synopsis[i];
      if(fre.test(synopsis)) {
        hasFiles = true;
        break;
      }
    } 
  }

  for(k in options) {
    opt = options[k];
    isOption = opt.type === 'option';

    // initial indentation for each argument
    opts += indent;

    if(opt.names.length > 1) {
      opts += '"(' + opt.names.join(' ') + ')"';
      opts += '{' + opt.names.join(',') + (isOption ? '=' : '') + '}';
      opts += '"[' + opt.description + ']';
    }else{
      opts += '"' + opt.names[0] + (isOption ? '=' : '');
      opts += '[' + opt.description + ']';
    }

    // enum style values
    if(opt.kind && Array.isArray(opt.kind)) {
      opts += ':value:_values' + opt.kind.reduce(function(prev, item) {
        // quote values in case they contain spaces
        return prev + ' \'' + item + '\'';
      }, '');
    // files and directories
    }else if(opt.extra) {
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

Zsh.prototype.render = render;
Zsh.prototype.getArgumentSpec = getArgumentSpec;

module.exports = through.transform(transform, {ctor: Zsh});
