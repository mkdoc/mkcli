var through = require('through3')
  //, ast = require('mkast')
  //, Node = ast.Node
  , Program = require('./program')
  , State = require('./state')
  , states = State.states;

/**
 *  Compiles the parser state information to a single object.
 */
function Compiler(opts) {
  opts = opts || {};

  this.program = opts.program || new Program();

  // current command receiving options and commands
  this.command = this.program;
}

function transform(chunk, encoding, cb) {

  if(chunk.type === states.NAME) {
    if(chunk.data.name) {
      this.program.name = chunk.data.name;
    }
  }else if(chunk.type === states.SYNOPSIS) {
    this.program.synopsis = chunk.data.synopsis;
  }else if(chunk.type === states.DESCRIPTION) {
    this.program.description = chunk.data.literal;
  }else if(chunk.type === states.OPTIONS 
    || chunk.type === states.COMMANDS) {
    this.program[chunk.type] = chunk.data[chunk.type];
  }else if(chunk.type === states.SECTION) {
    this.program.sections = this.program.sections || [];
    this.program.sections.push(chunk);
  }

  cb();
}

function flush(cb) {
  this.push(this.program);
  cb();
}

module.exports = through.transform(transform, flush, {ctor: Compiler});
