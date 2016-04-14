var through = require('through3')
  , ast = require('mkast')
  , Node = ast.Node
  , EOL = require('os').EOL
  , COMMAND = '<command>'
  , map = {
      user: ':user:_users',
      group: ':group:_groups',
      host: ':host:_hosts',
      domain: ':domain:_domains',
      file: ':file:_files',
      dir: ':directory:_directories',
      url: ':url:_urls'
    }
  , keys = Object.keys(map)
  , ptn = {};

// build patterns, iterating the action keys
keys.forEach(function(id) {
  ptn[id] = new RegExp(
    '((\\[|<)?' + id + 's?(\\.\\.\\.)?(>|\\])?)(.*)', 'i');
})

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
  var buf = this.compdef(chunk)
    , indent = this.indent
    , i
    , specs = chunk.zsh || []
    , locals = []
    , actions = [];

  var opts = {
    actions: true
  }

  for(i = 0;i < specs.length;i++) {
    if(/locals/.test(specs[i].info)) {
      locals.push(specs[i].literal); 
    }else{
      actions.push(specs[i].literal); 
    }
  }

  if(actions.length) {
    opts.actions = actions; 
  }

  // open function
  buf += this.main(chunk);

  function indentation(str) {
    return indent + str; 
  }

  // inject function locals defined in program definition (eg: zsh-locals)
  if(locals.length) {
    buf += EOL;
    for(i = 0;i < locals.length;i++) {
      buf += locals[i].split('\n').map(indentation).join('\n');
    }
    buf += EOL + EOL;
  }

  buf += this.cmdspec(chunk, this.indent, 0, opts);

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
    + 'typeset -A opt_args;' + EOL
    + this.indent
    + 'local actions options commands;' + EOL;
}

function compdef(program) {
  return '#compdef ' + program.names.join(' ') + EOL;
}

function esac(program, lead, depth, opts) {
  depth = depth || 1;

  var buf = ''
    , k
    , list
    , cmd
    , indent = this.indent
    , commands = program.commands;

  buf += lead + 'case "$words[1]" in' + EOL;

  for(k in commands) {
    cmd = commands[k];
    list = ['$options'];
    buf += lead + indent + cmd.names.join('|') + ')' + EOL;
    if(cmd.commands) {
      // recurse for nested commands
      buf += this.cmdspec(cmd, lead + indent + indent, depth); 
    }else{
      if(cmd.options) {
        list = this.optspec(cmd, cmd.options, opts);
        list.push('$options');
      }

      buf += this.args(list, lead + indent + indent);
    }

    buf += lead + indent + ';;' + EOL;
  }

  buf += lead + 'esac' + EOL;

  return buf;
}

function cmdspec(program, lead, depth, opts) {
  opts = opts || {};
  depth = depth || 0;
  lead = lead || '';

  var indent = this.indent
    , specs = []
    , list
    , actions = opts.actions
    , actors = []
    , buf = '';

  // global options
  if(!depth) {
    list = this.optspec(program, program.options, {actions: false})
    buf += EOL + lead + 'options=(' + EOL;
    buf += this.args(
      list, lead, {returns: false, keyword: false, esc: false});
    buf += EOL + lead + ')' + EOL;
  }

  if(program.commands) {
    specs.push('"1:cmd:->cmd"');
  }

  specs.push('"*::arg:->args"');

  // inspect synopsis for default actions
  if(!actions) {
    actions = this.action(program.synopsis);
  }

  if(actions.length) {
    actions.forEach(function(act) {
      actors.push('"' + act + '"');
    })
    buf += EOL + lead + 'actions=(' + EOL;
    buf += this.args(
      actors, lead, {returns: false, keyword: false, esc: false});
    buf += EOL + lead + ')' + EOL;
  }

  buf += EOL;
  buf += this.args(specs, lead);
  buf += EOL;

  buf += lead + 'case $state in' + EOL;

  // create command values list
  if(program.commands) {
    buf += lead + indent + '(cmd)' + EOL;
    list = this.describe(program, program.commands);

    buf += lead + indent + indent + 'commands=(' + EOL;
    buf += this.args(
      list, lead + indent + indent,
      {returns: false, keyword: false, esc: false});
    buf += EOL + lead + indent + indent + ')' + EOL;

    buf += lead + indent + indent
      + '_describe "' + program.name + ' commands" commands';
    buf += ' && ret=0';
    buf += EOL;

    // mix arguments when command is not required
    if(!this.required(program)) {
      buf += this.args(['$options'], lead + indent + indent, {returns: true});
    }

    // eof
    buf += lead + indent + indent + ';;' + EOL;
  }

  // arguments list
  buf += lead + indent + '(args)' + EOL;

  if(program.commands) {
    buf += this.esac(program, lead + indent + indent, depth + 1, opts);
  }else{
    buf += this.args(['$options'], lead + indent + indent);
  }

  // eof
  buf += lead + indent + indent + ';;' + EOL;

  buf += lead + 'esac' + EOL;

  return buf;
}

function args(list, lead, opts) {
  opts = opts || {};
  lead = lead || '';
  var keyword = opts.keyword || '_arguments'
    , buf = '';

  if(opts.keyword !== false) {
    buf = lead + keyword + ' \\' + EOL;
  }
  for(var i = 0;i < list.length;i++) {
    buf += lead + this.indent + list[i];
    if(i < list.length - 1) {
      buf += ' ' + (opts.esc !== false ? '\\' : '') + EOL;
    }else{
      if(opts.returns !== false) {
        buf += ' && ' + (opts.returns === true ? 'return 0' : 'ret=0');
        buf += ';' + EOL;
      }

    }
  }
  return buf;
}

function describe(program, map) {
  var spec = [];
  for(var k in map) {
    spec.push(
      '"' + map[k].name.replace(/:/g, '\\:') + ':' + map[k].description + '"'); 
  }
  return spec;
}

function optspec(program, map, opts) {
  opts = opts || {};

  var k
    , opt
    , str
    , spec = []
    , isOption
    , isCommand
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
      str += ':value:_values select ' + opt.kind.reduce(function(prev, item) {
        // quote values in case they contain spaces
        return prev + ' \'' + item + '\'';
      }, '');
    // files and directories
    }else if(opt.extra) {
      actions = this.action(opt.extra, {multiple: false, option: opt});
      if(actions.length) {
        str += actions[0];
      }
    }
  
    // close quotation
    str += '"';

    // add to the specpec list
    spec.push(str);
  }

  return spec;
}

function action(val, opts) {
  opts = opts || {};
  val = Array.isArray(val) ? val : [val];

  var actions = []
    , opt = opts.option;

  if(opt && opt.zaction) {
    return [opt.zaction];
  }

  val.forEach(function(value) {
    //console.error(value);
    var i
      , id
      , val
      , match;
    for(i = 0;i < keys.length;i++) {
      id = keys[i];
      if(ptn[id].test(value)) {
        val = map[id];
        if(opts.multiple !== false) {
          match = value.replace(ptn[id], '$1');
          if(~match.indexOf('...')) {
            // make completion repeatable
            val = '*' + val;
          }
        }
        actions.push(val);
      } 
    }
  });

  return actions;
}

function required(cmd) {
  if(!cmd.synopsis) {
    return; 
  }
  for(var i = 0;i < cmd.synopsis.length;i++) {
    if(~cmd.synopsis[i].indexOf(COMMAND)) {
      return true; 
    } 
  }
}

Zsh.prototype.main = main;
Zsh.prototype.compdef = compdef;
Zsh.prototype.cmdspec = cmdspec;
Zsh.prototype.optspec = optspec;
Zsh.prototype.args = args;
Zsh.prototype.esac = esac;
Zsh.prototype.action = action;
Zsh.prototype.describe = describe;
Zsh.prototype.required = required;

module.exports = through.transform(transform, {ctor: Zsh});

// expose actions map for documentation purposes
module.exports.actions = map;

