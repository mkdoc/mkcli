var through = require('through3')
  , wordwrap = require('wordwrap')
  , repeat = require('string-repeater')
  , ast = require('mkast')
  , Node = ast.Node
  , literal = ast.NodeWalker.literal
  , EOL = require('os').EOL
  , LEFT = 'left'
  , RIGHT = 'right'
  , SPACE = ' '
  , format = require('../format')
  , State = require('../state')
  , states = State.states;

/**
 *  Transforms a program definition to plain text help.
 *
 *  @constructor Help
 *  @param {Object} [opts] renderer options.
 *
 *  @option {String} [eol] end of line character(s).
 *  @option {String} [indent] initial indent for options and commands.
 *  @option {String} [gap] gap between names and descriptions.
 *  @option {Number=80} [cols] maximum column width for the output.
 *  @option {Number=22} [split] column to split names and descriptions.
 *  @option {Boolean=true} [concise] show short description only.
 *  @option {Object} [pkg] package descriptor with additional information.
 *  @option {Function} [footer] override default footer output.
 *  @option {String} [align] align argument names `left` or `right`.
 */
function Help(opts) {
  opts = opts || {};
  this.eol = opts.eol || EOL;
  this.indent = opts.indent || SPACE + SPACE;
  this.gap = opts.gap || SPACE;
  this.cols = opts.cols || 80;
  this.split = opts.split || 26;
  this.usage = opts.usage ? '' + opts.usage : 'Usage: ';
  this.concise = opts.concise !== undefined ? opts.concise : true;
  this.pkg = opts.pkg;
  this.footer = typeof opts.footer === 'function'
    ? opts.footer : footer;

  this.align = opts.align === LEFT || opts.align === RIGHT
    ? opts.align : LEFT;

  this.name = undefined;
}

function transform(chunk, encoding, cb) {
  var out = this.push.bind(this)
    , eol = this.eol
    , i
    , synopsis
    , wrap = wordwrap(0, this.cols);

  function cr(num) {
    num = num || 1; 
    while(num--) {
      out(eol);
    }
  }

  if(chunk.type === states.NAME) {
    if(chunk.data.name) {
      this.name = chunk.data.name;
      out(this.name);
      cr(2);
    }
  }else if(chunk.type === states.SYNOPSIS) {
    for(i = 0;i < chunk.data.synopsis.length;i++) {
      synopsis = chunk.data.synopsis[i].trim();
      if(this.name) {
        synopsis = this.name + ' ' + synopsis;
      }
      if(!i) {
        synopsis = this.usage + synopsis;
      }else{
        wrap = wordwrap(this.usage.length, this.cols);
      }
      out(wrap(synopsis));
      cr();
    }
    if(chunk.data.synopsis.length) {
      cr();
    }
  }else if(chunk.type === states.DESCRIPTION) {
    wrap = wordwrap(this.indent.length, this.cols);
    for(i = 0;i < chunk.data.literal.length;i++) {
      out(wrap(chunk.data.literal[i]));
      cr(2);
    }
  }else if(chunk.type === states.OPTIONS 
    || chunk.type === states.COMMANDS) {
    out(literal(chunk.nodes[0])); 
    cr();
    this.columnify(chunk, chunk.data[chunk.type], out, cr);
  }

  cb();
}

function columnify(cmd, map, out, cr) {
  var columns
    , max
    , name
    , desc
    , len
    , wrap
    , pad
    , over
    , maximum = this.split;

  columns = this.getColumns(map);
  max = columns.max;

  for(var i = 0;i < columns.cols.length;i++) {
    name = columns.cols[i].name;
    desc = columns.cols[i].description;
    len = name.length;

    pad = repeat(SPACE,
      this.split - name.length - this.indent.length - this.gap.length);

    over = this.indent.length + name.length + this.gap.length > maximum;

    wrap = wordwrap(
      this.split,
      this.cols);

    desc = wrap(desc);

    // over the maximum length
    if(!over) {
      desc = desc.replace(/^\s+/, '');
    }

    out(this.indent);
    if(this.align === LEFT) {
      out(name); 
      out(pad);
    }else{
      out(pad);
      out(name); 
    }
    if(!over) {
      out(this.gap);
    }else{
      cr();
    }
    out(desc);
    cr();
  }

  cr();
}

function getColumns(target, fmt, opts) {
  var o = []
    , k
    , arg
    , name
    , max = 0;

  for(k in target) {
    arg = target[k];
    name = format(arg, fmt, opts);
    max = Math.max(max, name.length);
    o.push(
      {
        name: name,
        description: getDescription(arg)
      }
    );
  }
  return {max: max, cols: o};
}

function getDescription(arg) {
  var desc = arg.description.literal;
  // append default value to option description
  if(arg.value) {
    desc = value(arg, desc, arg.value);
  }
  return desc;
}

function description(chunk, out, cr) {
  var len = chunk.description.length
    , i
    , lit
    , wrap = wordwrap(0, this.cols);

  if(this.concise) {
    len = 1; 
  }

  for(i = 0;i < len;i++) {
    // only render paragraphs for the moment
    if(Node.is(chunk.description[i], Node.PARAGRAPH)) {
      lit = literal(chunk.description[i]);
      out(wrap(lit));
      cr(2);
    }
  }
}

function flush(cb) {
  this.footer.call(this);
  cb();
}

function footer() {
  if(this.pkg && this.pkg.bugs && this.pkg.bugs.url) {
    this.push('Report bugs to ' + this.pkg.bugs.url + this.eol);
  }
}

function value(opt, description, value) {
  var desc = description
    , re = /\.$/;
  if(re.test(desc)) {
    desc += '\nDefault: ' + value;
  }else{
    desc += ' (default: ' + value + ')';
  }
  return desc;
}


Help.prototype.description = description;
Help.prototype.columnify = columnify;
Help.prototype.getColumns = getColumns;

module.exports = through.transform(transform, flush, {ctor: Help});
