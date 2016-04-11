var through = require('through3')
  , path = require('path')
  , Program = require('./program')
  , State = require('./state')
  , states = State.states;

/**
 *  Compiles the parser state information to a program definition.
 *
 *  @constructor Compiler
 *  @param {Object} opts processing options.
 *
 *  @option {Object} program existing program or command.
 */
function Compiler(opts) {
  this.program = opts.program || new Program();
  this.compact = opts.compact !== undefined ? opts.compact : true;
}

function transform(chunk, encoding, cb) {

  if(!chunk.data) {
    return cb(); 
  }

  if(chunk.type === states.NAME) {
    this.program.file = chunk.file;
    this.program.name = chunk.data.name;
    this.program.names = chunk.data.names;
    if(chunk.data.summary) {
      this.program.summary = chunk.data.summary; 
    }
  }else if(chunk.type === states.SYNOPSIS) {
    this.program.synopsis = chunk.data.synopsis;
  }else if(chunk.type === states.DESCRIPTION) {
    this.program.description = chunk.data.literal;
  }else if(chunk.type === states.OPTIONS 
    || chunk.type === states.COMMANDS) {
    this.program[chunk.type] = chunk.data[chunk.type];
    if(chunk.type === states.COMMANDS) {
      return this.command(chunk.data[chunk.type], cb); 
    }
  // got section chunk
  }else{
    this.program.sections = this.program.sections || [];
    this.program.sections.push(chunk);
  }
  cb();
}


function command(map, cb) {
  if(!this.program.file) {
    throw new Error('cannot load subcommands without file information'); 
  }

  var k
    , ptn = /(\w+)\.(.*)$/
    , file = this.program.file
    , name = path.basename(file)
    , dir = path.dirname(file)
    , id = name.replace(ptn, '$1')
    , ext = name.replace(ptn, '$2')
    , files = []
    , nm;

  //console.error('check for subcommand: ' + file);
  //console.error('check for subcommand: ' + name);
  //console.error('check for subcommand: ' + dir);
  //console.error('check for subcommand: ' + ext);
  //console.error('check for subcommand: ' + id);
  //console.error('check for subcommand: ' + Object.keys(map));

  // build list of potential subcommand files
  for(k in map) {
    nm = id + '-' + k + '.' + ext;
    files.push(path.join(dir, nm));
  }

  console.error(files);
  cb();
}

function flatten(map) {
  for(var k in map) {
    delete map[k].literal;
    /* istanbul ignore else: guard against invalid literal */
    if(map[k].description && map[k].description.literal !== undefined) {
      // remove first space from description literal
      map[k].description = map[k].description.literal.replace(/^ /, '');
    } 
  }
  return map;
}

function flush(cb) {
  if(this.compact) {
    if(this.program.description) {
      this.program.description = this.program.description.join('\n\n');
    }
    this.program.commands = flatten(this.program.commands);
    this.program.options = flatten(this.program.options);
    delete this.program.sections; 
  }
  this.push(this.program);
  cb();
}

Compiler.prototype.command = command;

module.exports = through.transform(transform, flush, {ctor: Compiler});
