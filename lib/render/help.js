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
 *  @param {Object} opts renderer options.
 *
 *  @option {String} [eol] end of line character(s).
 *  @option {String} [indent] initial indent for options and commands.
 *  @option {String} [gap] gap between names and descriptions.
 *  @option {Number=80} [cols] maximum column width for the output.
 *  @option {Number=22} [split] column to split names and descriptions.
 *  @option {String=Usage: } [usage] prefix for usage output.
 *  @option {Boolean=true} [concise] show short description only.
 *  @option {Object} [pkg] package descriptor with additional information.
 *  @option {Function} [footer] override default footer output.
 *  @option {String} [align] align argument names `left` or `right`.
 *  @option {Array} [section] list of regexp patterns for sections to include.
 */
function Help(opts) {
  this.eol = opts.eol || EOL;
  this.indent = opts.indent || SPACE + SPACE;
  this.gap = opts.gap || SPACE;
  this.cols = opts.cols || 80;
  this.split = opts.split || 26;
  this.usage = opts.usage !== undefined ? '' + opts.usage : 'Usage: ';
  this.concise = opts.concise !== undefined ? opts.concise : true;
  this.pkg = opts.pkg;
  this.header = typeof opts.header === 'function'
    ? opts.header : header;
  this.footer = typeof opts.footer === 'function'
    ? opts.footer : footer;
  this.align = opts.align === LEFT || opts.align === RIGHT
    ? opts.align : LEFT;

  this.section = Array.isArray(opts.section) ? opts.section : [];

  // state variables
  this.name = undefined;

  // default wordwrap
  this.wrap = wordwrap(0, this.cols);
}

function transform(chunk, encoding, cb) {

  var i
    , synopsis
    , container
    , wrap = this.wrap;

  // got state info
  if(chunk.nodes) {
    if(chunk.type === states.NAME) {
      this.name = chunk.data.name;
      this.summary = chunk.data.summary;
      header.call(this);
    }else if(chunk.type === states.SYNOPSIS) {
      container = Node.createNode(Node.PARAGRAPH);
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
        container.appendChild(
          Node.createNode(Node.TEXT, {literal: wrap(synopsis)}));

        if(i < chunk.data.synopsis.length - 1) {
          container.appendChild(Node.createNode(Node.LINEBREAK));
        }
      }
      this.push(container);
    }else if(chunk.type === states.DESCRIPTION) {
      wrap = wordwrap(this.indent.length, this.cols);
      container = Node.createNode(Node.PARAGRAPH);
      for(i = 0;i < chunk.data.literal.length;i++) {
        container.appendChild(
          Node.createNode(Node.TEXT, {literal: wrap(chunk.data.literal[i])}));
        this.push(container);
      }
    }else if(chunk.type === states.OPTIONS 
      || chunk.type === states.COMMANDS) {

      // print header
      this.push(Node.createNode(Node.TEXT, {literal: literal(chunk.nodes[0])}));
      this.push(Node.createNode(Node.LINEBREAK));

      // print option of command list
      container = Node.createNode(Node.PARAGRAPH);
      container.appendChild(
        Node.createNode(Node.TEXT,
          {literal: this.columnify(chunk, chunk.data[chunk.type])}));
      this.push(container);
    }else if(chunk.type === states.SECTION && chunk.nodes.length) {
      var include = false;
      for(i = 0;i < this.section.length;i++) {
        if((this.section[i] instanceof RegExp)
          && this.section[i].test(literal(chunk.nodes[0]))) {
          include = true;
          break;
        } 
      }
      if(include) {
        wrap  = wordwrap(this.indent.length, this.cols);
        for(i = 0;i < chunk.nodes.length;i++) {
          if(Node.is(chunk.nodes[i], Node.HEADING)) {
            // print heading
            this.push(
              Node.createNode(Node.TEXT, {literal: literal(chunk.nodes[i])}));
            this.push(Node.createNode(Node.LINEBREAK));
          }else{
            container = Node.createNode(Node.PARAGRAPH);
            container.appendChild(
              Node.createNode(Node.TEXT,
                {literal: wrap(literal(chunk.nodes[i]))}));
            this.push(container);
          }
        }
      }
    }
  // got raw ast chunk: document, eof etc.
  }else{
    this.push(chunk);
  }

  cb();
}

function columnify(cmd, map) {
  var columns
    , max
    , name
    , desc
    , len
    , wrap
    , pad
    , over
    , maximum = this.split
    , eol = this.eol
    , buf = '';

  function out(str) {
    buf += str;
  }

  function cr() {
    buf += eol; 
  }

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
    }else{
      desc = desc.replace(/^ /, '');
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
    if(i < columns.cols.length - 1) {
      cr();
    }
  }
  return buf;
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

function header() {
  var wrap = this.wrap
    , container = Node.createNode(Node.PARAGRAPH)
    , summary;
  container.appendChild(Node.createNode(Node.TEXT, {literal: this.name}));
  this.push(container);

  if(this.summary) {
    // title case summary
    summary = this.summary.charAt(0).toUpperCase() + this.summary.substr(1);
    if(!/\.$/.test(summary)) {
      summary += '.'; 
    }
    container = Node.createNode(Node.PARAGRAPH);
    container.appendChild(
      Node.createNode(Node.TEXT, {literal: wrap(summary)}));
    this.push(container);
  }
}

function footer() {
  var hasInfo
    , lit
    , wrap = this.wrap;
  if(this.pkg) {

    hasInfo = this.pkg.name && this.pkg.version;

    if(this.pkg.bugs && this.pkg.bugs.url) {
      lit = 'Report bugs to ' + this.pkg.bugs.url;
      if(hasInfo) {
        lit = this.indent + lit;
        wrap = wordwrap(this.indent.length, this.cols);
      }
      this.push(
        Node.createNode(
          Node.TEXT, {literal: lit}));
      this.push(Node.createNode(Node.LINEBREAK));

      // additional newline when printing package info
      if(hasInfo) {
        this.push(Node.createNode(Node.LINEBREAK));
      }
    }

    if(hasInfo) {
      this.push(
        Node.createNode(
          Node.TEXT, {literal: this.pkg.name + '@' + this.pkg.version}));
      if(this.pkg.homepage) {
        this.push(
          Node.createNode(
            Node.TEXT, {literal: ' ' + this.pkg.homepage}));
      }
      this.push(Node.createNode(Node.LINEBREAK));
    }
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

function flush(cb) {
  this.footer.call(this);
  cb();
}

Help.prototype.columnify = columnify;
Help.prototype.getColumns = getColumns;

module.exports = through.transform(transform, flush, {ctor: Help});
