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
  , states = State.states
  , styles = {
      col: 'col',
      list: 'list',
      cmd: 'cmd'
    };

/**
 *  Transforms a program definition to plain text help.
 *
 *  @constructor Help
 *  @param {Object} opts renderer options.
 *  
 *  @option {String=col} [style] output style.
 *  @option {String} [indent] initial indent for options and commands.
 *  @option {String} [gap] gap between names and descriptions.
 *  @option {Number=80} [cols] maximum column width for the output.
 *  @option {Number=22} [split] column to split names and descriptions.
 *  @option {String=Usage: } [usage] prefix for usage output.
 *  @option {Object} [pkg] package descriptor with additional information.
 *  @option {Function|Boolean=false} header use custom or default header.
 *  @option {Function|Boolean=false} footer use custom or default footer.
 *  @option {Boolean=false} newline without a header print a leading newline.
 *  @option {Function} [footer] override default footer output.
 *  @option {String} [align] align argument names `left` or `right`.
 *  @option {Array} [section] list of regexp patterns for sections to include.
 *  @option {String} [eol] end of line character(s).
 */
function Help(opts) {

  this.pkg = opts.pkg;
  this.eol = opts.eol || EOL;
  this.indent = opts.indent || SPACE + SPACE;
  this.gap = opts.gap || SPACE;
  this.cols = opts.cols || 80;
  this.split = opts.split || 26;
  this.usage = opts.usage !== undefined ? '' + opts.usage : 'Usage: ';
  this.header = opts.header !== undefined ? opts.header : false;
  this.footer = opts.footer !== undefined ? opts.footer : false;
  this.newline = opts.newline !== undefined ? opts.newline : false;
  this.align = opts.align === LEFT || opts.align === RIGHT
    ? opts.align : LEFT;

  this.section = Array.isArray(opts.section) ? opts.section : [];

  this.style = opts.style !== undefined ? opts.style : styles.col;

  // use default on bad style id
  if(!styles[this.style]) {
    this.style = styles.col;
  }

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
  if(chunk.data) {
    if(chunk.type === states.NAME) {
      this.name = chunk.data.name;
      this.summary = chunk.data.summary;
      header.call(this);
    }else if(chunk.type === states.SYNOPSIS) {
      container = Node.createNode(Node.PARAGRAPH);

      // fixed synopsis for `cmd` style
      if(this.style === styles.cmd) {
        if(!this.header) {
          container.appendChild(Node.createNode(Node.LINEBREAK));
        }
        container.appendChild(
          Node.createNode(Node.TEXT,
            {literal: this.usage + this.name + ' <command>'}));
      }else{
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
      }
      this.push(container);
    }else if(chunk.type === states.DESCRIPTION && this.style !== styles.cmd) {
      wrap = wordwrap(this.indent.length, this.cols);
      container = Node.createNode(Node.PARAGRAPH);
      for(i = 0;i < chunk.data.literal.length;i++) {
        container.appendChild(
          Node.createNode(Node.TEXT, {literal: wrap(chunk.data.literal[i])}));
        this.push(container);
      }
    }else if(chunk.type === states.OPTIONS 
      || chunk.type === states.COMMANDS) {

      // do not print options when `cmd` style
      if(this.style === styles.cmd && chunk.type === states.OPTIONS) {
        return cb(); 
      }

      // print header
      if(this.style === styles.cmd) {
        this.push(Node.createNode(
          Node.TEXT, {literal: 'where <command> is one of:'}));
        this.push(Node.createNode(Node.LINEBREAK));
      }else{
        this.push(Node.createNode(
          Node.TEXT, {literal: literal(chunk.nodes[0])}));
        this.push(Node.createNode(Node.LINEBREAK));
      }

      // print option of command list
      container = Node.createNode(Node.PARAGRAPH);
      container.appendChild(
        Node.createNode(Node.TEXT,
          {literal: this.render(chunk.data[chunk.type], chunk)}));
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

function render(map, node) {
  return this[this.style](map, node);
}

function col(map) {
  var columns
    , max
    , name
    , desc
    , len
    , wrap
    , pad
    , over
    , maximum = this.split
    , buf = '';

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

    buf += this.indent;
    if(this.align === LEFT) {
      buf += name;
      buf += pad;
    }else{
      buf += pad;
      buf += name;
    }
    if(!over) {
      buf += this.gap;
    }else{
      buf += this.eol;
    }
    buf += desc;
    if(i < columns.cols.length - 1) {
      buf += this.eol;
    }
  }

  return buf;
}

function list(map) {
  var buf = ''
    , wrap = wordwrap(this.indent.length * 2, this.cols)
    , columns = this.getColumns(map)
    , i
    , name
    , desc;

  for(i = 0;i < columns.cols.length;i++) {
    name = columns.cols[i].name;
    desc = columns.cols[i].description;
    desc = desc.replace(/^ /, '');
    desc = desc.replace(/\n$/, '');
    buf += this.indent + name + this.eol;
    buf += wrap(desc);
    if(i < columns.cols.length - 1) {
      buf += this.eol + this.eol; 
    }
  }
  return buf;
}

function cmd(map) {
  var buf = ''
    , list = []
    , wrap = wordwrap(this.indent.length * 2, this.cols)
 
  // order with longest command names first
  for(var k in map) {
    list = list.concat(map[k].names);
  }

  // sort alphabetically
  list = list.sort();

  buf = wrap(list.join(', '));

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

  if(typeof this.header === 'function') {
    return this.header.call(this); 
  }else if(!this.header) {
    if(this.newline) {
      this.push(Node.createNode(Node.TEXT, {literal: '\n'}));
    }
    return; 
  }

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

  if(typeof this.footer === 'function') {
    return this.footer.call(this); 
  }else if(!this.footer || !this.pkg) {
    return; 
  }

  var hasInfo = this.pkg.name && this.pkg.version;

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
  footer.call(this);
  cb();
}

Help.prototype.render = render;
Help.prototype.col = col;
Help.prototype.list = list;
Help.prototype.cmd = cmd;
Help.prototype.getColumns = getColumns;

module.exports = through.transform(transform, flush, {ctor: Help});
