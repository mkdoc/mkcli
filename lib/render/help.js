var through = require('through3')
  , wordwrap = require('wordwrap')
  , repeat = require('string-repeater')
  , EOL = '\n'
  , SPACE = ' ';

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
  var k
    , arg
    , out = this.push.bind(this)
    , opts = Object.keys(chunk.options)
    , cmds = Object.keys(chunk.commands);

  function cr(num) {
    num = num || 1; 
    while(num--) {
      out(EOL);
    }
  }

  if(chunk.name) {
    out(chunk.name);
    if(chunk.synopsis) {
      out(SPACE + chunk.synopsis); 
    }
    cr();
  }

  //console.error(chunk.options)

  // print commands
  if(cmds.length) {
    cr();
    for(k in chunk.commands) {
      arg = chunk.commands[k];
      out(this.indent + arg.format());
      cr();
    }
  }

  // print options
  if(opts.length) {
    cr();
    this.columnify(chunk, chunk.options, out, cr);
  }

  cb();
}

function columnify(cmd, map, out, cr) {
  var columns
    , max
    , arg
    , len
    , wrap
    , pad;

  columns = cmd.getColumns(map);
  max = columns.max;

  wrap = wordwrap(
    0,
    this.cols - (max + this.indent.length + this.gap.length));

  for(var i = 0;i < columns.cols.length;i++) {
    arg = columns.cols[i].name;
    len = arg.length;

    pad = repeat(SPACE, max - arg.length);

    out(this.indent);
    out(arg); 
    out(pad);
    out(this.gap);
    out(wrap(columns.cols[i].description));

    cr();
  }
}

Help.prototype.columnify = columnify;

module.exports = through.transform(transform, {ctor: Help});
