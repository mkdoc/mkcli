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
  var isSimple = chunk.options && !chunk.commands
    , buf = this.compdef(chunk);

  // program has no commands
  if(isSimple) {
    buf += this.optspec(chunk, chunk.options);
  }else{
    buf += this.cmdspec(chunk);
  }

  // push as a plain text node
  this.push(Node.createNode(Node.TEXT, {literal: buf}));

  cb();
}

function compdef(program) {
  return '#compdef ' + program.names.join(' ') + EOL;
}

function cmdspec(program) {
  var header = 'local curcontext="$curcontext" state line ret=1' + EOL
    , footer = 'return ret;' + EOL
    , indent = this.indent
    , commands = program.commands
    , k
    , cmd
    , buf = '';

  buf += header;

  buf += '_arguments \\' + EOL;
  buf += indent + '"1: :->cmds" \\' + EOL; 
  buf += indent + '"*:: :->args" && ret=0' + EOL;

  buf += 'case $state in' + EOL;
  buf += indent + 'cmds)' + EOL;

  buf += indent + indent + '_values \\' + EOL;
  for(k in commands) {
    cmd = commands[k];
    //console.error(cmd);
    buf += indent + indent + indent
      + '"' + cmd.name + '[' + cmd.description + ']' + '" \\' + EOL; 
  }
  buf += indent + indent + 'ret=0' + EOL;

  buf += indent + indent + ';;' + EOL;
  buf += 'esac' + EOL;

  buf += footer;

  return buf;
}

function optspec(chunk, options) {
  var k
    , opt
    , opts = '_arguments \\' + EOL
    , isOption
    , indent = this.indent
    , i
    , fre = /(\[|<)file/i
    , dre = /(\[|<)dir/i
    , ure = /(\[|<)url/i
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
      }else if(ure.test(opt.extra)) {
        opts += ':url:_urls';
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

Zsh.prototype.compdef = compdef;
Zsh.prototype.cmdspec = cmdspec;
Zsh.prototype.optspec = optspec;

module.exports = through.transform(transform, {ctor: Zsh});
