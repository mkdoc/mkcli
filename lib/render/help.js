var through = require('through3')
  , wordwrap = require('wordwrap')
  , repeat = require('string-repeater')
  , EOL = '\n'
  , SPACE = ' '
  , State = require('../state')
  , states = State.states;

/**
 *  Transforms a program definition to plain text help.
 */
function Help(opts) {
  opts = opts || {};
  this.indent = opts.indent || SPACE + SPACE;
  this.gap = opts.gap || SPACE + SPACE;
  this.cols = opts.cols || 80;
  this.split = opts.split || 22;
}

function transform(chunk, encoding, cb) {
  var out = this.push.bind(this);

  function cr(num) {
    num = num || 1; 
    while(num--) {
      out(EOL);
    }
  }

  if(chunk.type === states.NAME) {
    if(chunk.name) {
      out(chunk.name);
      if(chunk.synopsis) {
        out(SPACE + chunk.synopsis); 
      }
      cr();
    }
  }else if(chunk.type === states.OPTIONS || chunk.type === states.COMMANDS) {
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
    , over;

  columns = this.getColumns(map);
  max = columns.max;

  //console.error(this.cols - this.split);

  for(var i = 0;i < columns.cols.length;i++) {
    name = columns.cols[i].name;
    desc = columns.cols[i].description;
    len = name.length;

    pad = repeat(SPACE,
      this.split - name.length - this.indent.length - this.gap.length);

    over = this.indent.length + name.length > this.split;

    // over the maximum length
    if(over) {
      wrap = wordwrap(
        this.split,
        this.cols - this.split);

      desc = wrap(desc);
    }else{
      wrap = wordwrap(
        this.split,
        this.cols - this.split);

      desc = wrap(desc);
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

Help.prototype.columnify = columnify;
Help.prototype.getColumns = getColumns;

module.exports = through.transform(transform, {ctor: Help});
