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
    , name
    , desc
    , len
    , wrap
    , pad
    , over;

  columns = cmd.getColumns(map);
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

Help.prototype.columnify = columnify;

module.exports = through.transform(transform, {ctor: Help});
