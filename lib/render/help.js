var through = require('through3')
  , wordwrap = require('wordwrap')
  , repeat = require('string-repeater')
  , ast = require('mkast')
  , Node = ast.Node
  , literal = ast.NodeWalker.literal
  , EOL = require('os').EOL
  , SPACE = ' '
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
 */
function Help(opts) {
  opts = opts || {};
  this.eol = opts.eol || EOL;
  this.indent = opts.indent || SPACE + SPACE;
  this.gap = opts.gap || SPACE;
  this.cols = opts.cols || 80;
  this.split = opts.split || 22;
  this.concise = opts.concise !== undefined ? opts.concise : true;
  this.pkg = opts.pkg;
  this.footer = typeof opts.footer === 'function'
    ? opts.footer : footer;
  this.options = typeof opts.options === 'string'
    ? opts.options : '';
  this.commands = typeof opts.commands === 'string'
    ? opts.commands : '';
}

function transform(chunk, encoding, cb) {
  var out = this.push.bind(this)
    , eol = this.eol;

  function cr(num) {
    num = num || 1; 
    while(num--) {
      out(eol);
    }
  }

  if(chunk.type === states.NAME) {
    if(chunk.name) {
      out(chunk.name);
      if(chunk.synopsis) {
        out(SPACE + chunk.synopsis); 
      }
      cr(2);

      if(chunk.description) {
        this.description(chunk, out, cr);
      }
    }
  }else if(chunk.type === states.OPTIONS 
    || chunk.type === states.COMMANDS) {

    if(chunk.type === states.OPTIONS && this.options) {
      out(this.options); 
      cr();
    }else if(chunk.type === states.COMMANDS && this.commands) {
      out(this.commands); 
      cr();
    }
    this.columnify(chunk, chunk.map, out, cr);
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

    over = this.indent.length + name.length > maximum;

    wrap = wordwrap(
      this.split,
      this.cols);

    desc = wrap(desc);

    // over the maximum length
    if(!over) {
      desc = desc.replace(/^\s+/, '');
    }

    out(this.indent);
    out(name); 
    out(pad);
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
    name = arg.format(fmt, opts);
    max = Math.max(max, name.length);
    o.push(
      {
        name: name,
        description: arg.getDescription(opts)
      }
    );
  }
  return {max: max, cols: o};
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

Help.prototype.description = description;
Help.prototype.columnify = columnify;
Help.prototype.getColumns = getColumns;

module.exports = through.transform(transform, flush, {ctor: Help});
