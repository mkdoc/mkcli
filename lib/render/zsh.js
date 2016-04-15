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
 *
 *  @option {String} indent indentation for the output script.
 */
function Zsh(opts) {
  this.indent = opts.indent || '  ';
}

/**
 *  Stream transform implementation.
 *  
 *  @private {function} transform
 */
function transform(chunk, encoding, cb) {
  var buf = this.compdef(chunk)

  // open function
  buf += this.main(chunk);

  // render body
  buf += this.command(chunk, this.indent, 0);

  // close function
  buf += this.main(chunk, true);

  // push as a plain text node
  this.push(Node.createNode(Node.TEXT, {literal: buf}));

  cb();
}

/**
 *  Get the main program completion function.
 *
 *  @function main
 *  @param {Object} program program descriptor.
 *  @param {Boolean} end whether to close the function.
 *
 *  @returns String function declaration.
 */
function main(program, end) {
  var name = '_' + program.name
    , buf = '';

  if(end) {
    // default catch all when nothing else matched
    buf += this.indent + '(( $ret == 1 )) && ';
    buf += this.args(this.options({}), this.indent).replace(/^\s+/, '');

    // close the function
    buf += this.indent + 'return $ret;' + EOL + '}'

    // invoke the function
    buf += EOL + EOL + name + ' "$@"';
  }else{

    // function head - declare local variables
    buf = name + '(){' + EOL
      + this.indent
      + 'typeset -A opt_args;' + EOL
      + this.indent
      + 'local context state state_descr line ret=1;' + EOL
      + this.indent
      + 'local actions options commands;' + EOL;
  }
  return buf;
}

/**
 *  Get the completion definition heading.
 *
 *  @function compdef
 *  @param {Object} program program descriptor.
 *
 *  @returns String completion definition.
 */
function compdef(program) {
  return '#compdef ' + program.names.join(' ') + EOL;
}

/**
 *  Get an array declaration with the specified name and list body content.
 *
 *  @function array
 *  @param {String} name variable name.
 *  @param {Array} list body contents.
 *  @param {String} lead leading whitespace.
 *
 *  @returns String array variable declaration.
 */
function array(name, list, lead, append) {
  var buf = ''
    , opts = {returns: false, keyword: false, esc: false};

  buf += lead + name + '=(' + EOL;
  buf += this.args(list, lead, opts);
  if(append) {
    buf += EOL + lead + this.indent + '$' + name; 
  }
  buf += EOL + lead + ')' + EOL;

  return buf;
}

function command(program, lead, depth, opts) {
  opts = opts || {};
  depth = depth || 0;
  lead = lead || '';

  var indent = this.indent
    , specs = []
    , list
    , info = this.collect(program)
    , buf = '';

  // global options
  if(!depth) {
    list = this.optspec(program, program.options, {actions: false});
    buf += EOL + this.array('options', list, lead);
  }

  if(info.locals.length) {
    buf += this.locals(info.locals, lead); 
    if(depth) {
      buf += EOL; 
    }
  }

  if(program.commands) {
    specs.push(this.quote('1:cmd:->cmd'));
  }

  specs.push(this.quote('*::arg:->args'));

  // inspect synopsis for default actions at main program level
  if(!info.actions.length && !depth) {
    info.actions = this.action(program.synopsis);
  }

  if(info.actions.length) {
    buf += EOL + this.array('actions', this.quote(info.actions), lead);
  }

  // cascade options for deeper commands
  if(program.options && depth) {
    buf += this.array(
      'options',
      this.optspec(program, program.options), lead, true);
  }

  buf += EOL;
  buf += this.args(specs, lead);
  buf += EOL;

  buf += lead + 'case $state in' + EOL;

  // create command values list
  if(program.commands) {
    buf += lead + indent + '(cmd)' + EOL;
    list = this.describe(program, program.commands);

    buf += this.array('commands', list, lead + indent + indent);

    buf += lead + indent + indent
      + '_describe "' + program.name + ' commands" commands';
    buf += ' && ret=0';
    buf += EOL;

    // mix arguments when command is not required
    if(!this.required(program)) {
      list = this.options({});
      buf += this.args(list, lead + indent + indent, {returns: true});
    }

    // eof
    buf += lead + indent + indent + ';;' + EOL;
  }

  // arguments list
  buf += lead + indent + '(args)' + EOL;

  if(program.commands) {
    buf += this.esac(
      program.commands, lead + indent + indent, depth + 1);
  }else{
    buf += this.array(
      'options',
      this.optspec(program, program.options), lead + indent + indent, true);
    //buf += this.args(this.options(program), lead + indent + indent);
  }

  // eof switch
  buf += lead + indent + indent + ';;' + EOL;

  // eof case
  buf += lead + 'esac' + EOL;

  return buf;
}

/**
 *  Gets a case statement that switches on command names.
 *
 *  @function esac
 *  @param {Object} commands command map.
 *  @param {String} lead leading whitespace.
 *  @param {Number} depth current depth in the command tree.
 *
 *  @returns String case statement.
 */
function esac(commands, lead, depth) {
  var buf = ''
    , k
    , list
    , cmd
    , info
    , indent = this.indent;

  buf += lead + 'case "$words[1]" in' + EOL;

  for(k in commands) {
    cmd = commands[k];
    buf += lead + indent + cmd.names.join('|') + ')' + EOL;
    if(cmd.zsh) {
      info = this.collect(cmd, lead); 
      if(info.actions.length) {
        buf += EOL
          + this.array('actions', this.quote(info.actions)
              , lead + indent + indent);
      }
    }
    if(cmd.commands) {
      // recurse for nested commands
      buf += this.command(cmd, lead + indent + indent, depth); 
    }else if(cmd.options) {
      list = this.optspec(cmd, cmd.options);
      //buf += this.args(list, lead + indent + indent);
      buf += this.array(
        'options',
        list, lead + indent + indent, true);
    }
    buf += lead + indent + ';;' + EOL;
  }

  buf += lead + 'esac' + EOL;
  return buf;
}

/**
 *  Get a string for a list of specifications.
 *
 *  Typically used to call `_arguments` but is also used to build array 
 *  declarations.
 *
 *  @function args
 *  @param {Array} list command or option specifications.
 *  @param {String} lead leading whitespace.
 *  @param {Object} [opts] processing options.
 *
 *  @option {String=_arguments} keyword function name to call.
 *  @option {Boolean} esc whether to escape newlines with a backslash.
 *  @option {Boolean} returns whether to hard `return 0` or set `ret=0`.
 *
 *  @returns String function call or array body.
 */
function args(list, lead, opts) {
  opts = opts || {};
  lead = lead || '';
  var keyword = opts.keyword || '_arguments'
    , buf = ''
    , i;

  // print keywords - disable with `keyword` false, used for array declarations
  if(opts.keyword !== false) {
    buf = lead + keyword + ' \\' + EOL;
  }

  for(i = 0;i < list.length;i++) {
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

function optspec(program, map, opts) {
  opts = opts || {};

  var k
    , opt
    , str
    , spec = []
    , names
    , isOption
    , isCommand
    , actions;

  for(k in map) {
    opt = map[k];
    names = opt.names.slice(0);
    str = '';
    isOption = opt.type === 'option';
    isCommand = opt.type === 'command';

    names = names.reduce(expand, []);

    if(names.length > 1) {
      if(opt.multiple) {
        str += '"*"';
      }else{
        str += '"(' + names.join(' ') + ')"';
      }
      str += '{' + names.join(isOption ? '=,' :  ',')
        + (isOption ? '=' : '') + '}';
      str += '"';
      str += '[' + opt.description + ']';
    }else{
      names[0] = names[0].replace(/(\[|\])/g, '\\$1');
      str += '"' + names[0] + (isOption ? '=' : '');
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

    // add to the spec list
    spec.push(str);
  }

  return spec;
}

/**
 *  Get completion actions list for string candidates.
 *
 *  When an `option` is passed and it has a parsed `zaction` it is returned.
 *
 *  @function action
 *  @param {String|Array} val values to inspect.
 *  @param {Object} [opts] processing options.
 *
 *  @option {Boolean} multiple whether ellipsis matches have wildcards (*).
 *  @option {Object} option current option.
 *
 *  @returns Array of completion actions.
 */
function action(val, opts) {
  opts = opts || {};
  val = Array.isArray(val) ? val : [val];

  var actions = []
    , opt = opts.option;

  if(opt && opt.zaction) {
    return [opt.zaction];
  }

  val.forEach(function(value) {
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

/**
 *  Determine if a subcommand is required for a command.
 *
 *  Inspects the synopsis list for the command and if the string 
 *  `<command>` is found in any of the synopsis declarations treat 
 *  the command as requiring a subcommand.
 *
 *  @function required
 *  @param {Object} cmd parent command.
 *
 *  @returns Boolean true if a subcommand is required.
 */
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

/**
 *  Get a list of commands suitable for passing to `_describe`.
 *
 *  Command names are mapped to command descriptions delimited by a colon and 
 *  wrapped in double quotes.
 *
 *  Any colons in the command name are escaped with a backslash.
 *
 *  @function describe
 *  @param {Object} cmd current command.
 *  @param {Object} map command map.
 *
 *  @returns Array of command definitions.
 */
function describe(cmd, map) {
  var spec = []
    , k
    , name;
  for(k in map) {
    if(map[k].names.length === 1) {
      name = map[k].name.replace(/:/g, '\\:');
      spec.push(this.quote(name + ':' + map[k].description));
    }else{
      name = '{' + map[k].names.join(',') + '}';
      spec.push(name + this.quote(':' + map[k].description));
    }
  }
  return spec;
}

/**
 *  Enclose a string in double quotes.
 *
 *  @function quote
 *  @param {Array|String} val value to quote.
 *
 *  @returns String enclosed in double quotes.
 */
function quote(val) {
  if(Array.isArray(val)) {
    return val.map(function(value) {
      return '"' + value + '"';
    }) 
  }
  return '"' + val + '"';
}

/**
 *  Get an options list for a command.
 *
 *  @function options
 *  @param {Object} cmd the current command.
 *
 *  @returns Array of option specifications.
 */
function options(cmd) {
  var list = [];
  if(cmd.options) {
    list = this.optspec(cmd, cmd.options);
  }
  list.push('$options', '$actions');
  return list;
}

/**
 *  Helper function to expand --[no]- and --no- option names.
 *
 *  @private {function} expand
 */
function expand(prev, item) {
  var re = /\[?no\]?-/
    , yes
    , no;
  if(re.test(item)) {
    yes = item.replace(re, '');
    no = item.replace(re, 'no-');
    return prev.concat([yes, no]);
  }
  return prev.concat(item); 
}

/**
 *  Get collections of locals and actions.
 *
 *  @function collect
 *  @param {Object} cmd current command.
 *
 *  @returns Object map with `actions` and `locals` arrays.
 */
function collect(cmd) {
  var specs = cmd.zsh || []
    , i
    , locals = []
    , actions = [];

  for(i = 0;i < specs.length;i++) {
    if(/locals/.test(specs[i].info)) {
      locals.push(specs[i].literal); 
    }else{
      actions.push(specs[i].literal); 
    }
  }

  return {locals: locals, actions: actions};
}

function locals(list, lead) {
  var buf = ''
    , i;

  function indentation(str) {
    return lead + str; 
  }

  // inject function locals defined in program definition (eg: zsh-locals)
  if(list.length) {
    buf += EOL;
    for(i = 0;i < list.length;i++) {
      buf += list[i].split('\n').map(indentation).join('\n');
    }
    buf += EOL;
  }

  return buf;
}

Zsh.prototype.main = main;
Zsh.prototype.compdef = compdef;
Zsh.prototype.command = command;
Zsh.prototype.optspec = optspec;
Zsh.prototype.args = args;
Zsh.prototype.esac = esac;
Zsh.prototype.action = action;
Zsh.prototype.options = options;
Zsh.prototype.describe = describe;
Zsh.prototype.required = required;
Zsh.prototype.array = array;
Zsh.prototype.quote = quote;
Zsh.prototype.collect = collect;
Zsh.prototype.locals = locals;

module.exports = through.transform(transform, {ctor: Zsh});

// expose actions map for documentation purposes
module.exports.actions = map;

