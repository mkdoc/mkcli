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

  // program has no commands
  if(isSimple) {
    buf += this.args(this.optspec(chunk, chunk.options), this.indent);
  }else{
    buf += this.cmdspec(chunk, this.indent);
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

  return name + '(){' + EOL + this.indent
    + 'local curcontext="$curcontext" state line ret=1' + EOL;
}

function compdef(program) {
  return '#compdef ' + program.names.join(' ') + EOL;
}

function cmdspec(program, lead) {
  lead = lead || '';
  var indent = this.indent
    , commands = program.commands
    , keys = Object.keys(commands)
    , i
    , cmd
    , buf = '';

  buf += EOL;
  buf += lead + '_arguments -C \\' + EOL;
  buf += lead + indent + '"1:cmd:->cmds" \\' + EOL; 
  buf += lead+ indent + '"*::arg:->args" && ret=0' + EOL;
  buf += EOL;

  buf += lead + 'case $state in' + EOL;

  buf += lead + indent + '(cmds)' + EOL;
  buf += lead + indent + indent + '_values "commands" \\' + EOL;
  for(i = 0;i < keys.length;i++) {
    cmd = commands[keys[i]];
    //console.error(cmd);
    buf += lead + indent + indent + indent
      + '"' + cmd.name + '[' + cmd.description + ']' + '"'
    if(i < keys.length - 1) {
      buf += ' \\' + EOL;
    } 
  }

  buf += ' && ret=0;' + EOL;
  buf += lead + indent + indent + ';;' + EOL;

  buf += lead + indent + '(args)' + EOL;
  if(program.options) {
    buf += this.args(
      this.optspec(program, program.options), lead + indent + indent);
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

function optspec(program, options) {
  var k
    , opt
    , str
    , opts = []
    , isOption
    , i
    , actions;

  for(k in options) {
    opt = options[k];
    str = '';
    isOption = opt.type === 'option';

    if(opt.names.length > 1) {
      str += '"(' + opt.names.join(' ') + ')"';
      str += '{' + opt.names.join(isOption ? '=,' :  ',')
        + (isOption ? '=' : '') + '}';
      str += '"[' + opt.description + ']';
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

    // add to the optspec list
    opts.push(str);
  }

  actions = this.action(program.synopsis);
  if(actions.length) {
    for(i = 0;i < actions.length;i++) {
      opts.push('"*:' + actions[i] + '"');
    }
  }
    
  return opts;
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
