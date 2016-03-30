var through = require('through3')
  , ast = require('mkast')
  , Node = ast.Node
  , literal = ast.NodeWalker.literal
  , Program = require('./program');

/**
 *  Reads the tree for a markdown document and creates an object that 
 *  represents a command line program.
 */
function CliParser(opts) {
  opts = opts || {};
  this.program = new Program();
}

function transform(chunk, encoding, cb) {

  // get program name from first level 1 heading
  if(!this.program.name
    && Node.is(chunk, Node.HEADING)
    && chunk.level === 1) {
    this.program.name = literal(chunk);
  }else if(!this.program.synopsis
    && Node.is(chunk, Node.CODE_BLOCK)
    && chunk.info
    && /^synopsis/.test(chunk.info)) {
    this.program.synopsis = chunk.literal;
  }

  cb();
}

function flush(cb) {
  this.push(this.program);
  cb();
}

module.exports = through.transform(transform, flush, {ctor: CliParser});
