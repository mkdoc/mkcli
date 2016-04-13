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

  // open function
  buf += this.main(chunk);

  //console.error(chunk.zsh);

  var opts = {
    actions: true
  }

  if(chunk.zsh) {
    opts.actions = chunk.zsh; 
  }

  // program has no commands
  if(isSimple) {
    buf += this.args(this.optspec(chunk, chunk.options, opts), this.indent);
  }else{
    buf += this.cmdspec(chunk, this.indent, opts);
  }

  // close function
  buf += this.main(chunk, true);

  // push as a plain text node
  this.push(Node.createNode(Node.TEXT, {literal: buf}));

  cb();
}

function main(program, end) {
  var name = '_' + program.name;

  if(end) {
    return this.indent + 'return $ret;' + EOL + '}'
      + EOL + EOL + name + ' "$@"';
  }

  return name + '(){' + EOL
    + this.indent
    + 'local context="$curcontext" state state_descr line ret=1;' + EOL
    + this.indent
    + 'typeset -A opt_args;' + EOL;
}

function compdef(program) {
  return '#compdef ' + program.names.join(' ') + EOL;
}

function cmdspec(program, lead, opts) {
  lead = lead || '';

  var indent = this.indent
    , list
    , buf = '';

  buf += EOL;
  buf += lead + '_arguments -C \\' + EOL;
  buf += lead + indent + '"1:cmd:->cmds" \\' + EOL; 
  buf += lead + indent + '"*::arg:->args" && ret=0' + EOL;
  buf += EOL;

  buf += lead + 'case $state in' + EOL;

  buf += lead + indent + '(cmds)' + EOL;

  // create command values list
  list = this.optspec(program, program.commands, {actions: false});
  list.unshift('"' + program.name + ' commands"');
  buf += this.args(list, lead + indent + indent, '_values');

  buf += lead + indent + indent + ';;' + EOL;

  buf += lead + indent + '(args)' + EOL;
  if(program.options) {
    buf += this.args(
      this.optspec(program, program.options, opts), lead + indent + indent);
  }
  buf += lead + indent + indent + ';;' + EOL;

  buf += lead + 'esac' + EOL;

  return buf;
}

function args(list, lead, keyword) {
  lead = lead || '';
  keyword = keyword || '_arguments';
  var buf = lead + keyword + ' \\' + EOL;
  for(var i = 0;i < list.length;i++) {
    buf += lead + this.indent + list[i];
    if(i < list.length - 1) {
      buf += ' \\' + EOL;
    }else{
      buf += ' && ret=0;' + EOL;
    }
  }
  return buf;
}

function optspec(program, map, opts) {
  opts = opts || {};

  var k
    , opt
    , str
    , spec = []
    , isOption
    , isCommand
    , i
    , actions;

  for(k in map) {
    opt = map[k];
    str = '';
    isOption = opt.type === 'option';
    isCommand = opt.type === 'command';

    if(opt.names.length > 1) {
      if(opt.multiple) {
        str += '"*"';
      }else{
        str += '"(' + opt.names.join(' ') + ')"';
      }
      str += '{' + opt.names.join(isOption ? '=,' :  ',')
        + (isOption ? '=' : '') + '}';
      str += '"';
      str += '[' + opt.description + ']';
    }else{
      str += '"' + opt.names[0] + (isOption ? '=' : '');
      str += '[' + opt.description + ']';
    }

    // enum style values
    if(opt.kind && Array.isArray(opt.kind)) {
      str += ':value:_values' + opt.kind.reduce(function(prev, item) {
        // quote values in case they contain spaces
        return prev + ' \'' + item + '\'';
      }, '');
    // files and directories
    }else if(opt.extra) {
      actions = this.action(opt.extra);
      if(actions.length) {
        str += actions[0];
      }
    }
  
    // close quotation
    str += '"';

    // add to the specpec list
    spec.push(str);
  }

  if(opts.actions !== false) {
    actions = Array.isArray(opts.actions)
      ? opts.actions : this.action(program.synopsis);
    for(i = 0;i < actions.length;i++) {
      spec.push('"*:' + actions[i] + '"');
    }
  }
    
  return spec;
}

function action(val) {
  var actions = []
    , sre = /(\[|<)user/i
    , hre = /(\[|<)host/i
    , fre = /(\[|<)file/i
    , dre = /(\[|<)dir/i
    , ure = /(\[|<)url/i;

  val = Array.isArray(val) ? val : [val];

  val.forEach(function(value) {
    if(sre.test(value)) {
      actions.push(':user:_users');
    }else if(hre.test(value)) {
      actions.push(':host:_hosts');
    }else if(fre.test(value)) {
      actions.push(':file:_files');
    }else if(dre.test(value)) {
      actions.push(':directory:_directories');
    }else if(ure.test(value)) {
      actions.push(':url:_urls');
    }
  });

  return actions;
}

Zsh.prototype.main = main;
Zsh.prototype.compdef = compdef;
Zsh.prototype.cmdspec = cmdspec;
Zsh.prototype.optspec = optspec;
Zsh.prototype.args = args;
Zsh.prototype.action = action;

module.exports = through.transform(transform, {ctor: Zsh});
