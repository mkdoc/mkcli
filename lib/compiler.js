var through = require('through3')
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
    this.program.name = chunk.data.name;
    // NOTE: don't overwrite command names when loading subcommands 
    if(!this.program.names) {
      this.program.names = chunk.data.names;
    }
    this.program.summary = chunk.data.summary; 
  }else if(chunk.type === states.SYNOPSIS) {
    this.program.synopsis = chunk.data.synopsis;
    this.program.zsh = chunk.data.zsh;
  }else if(chunk.type === states.DESCRIPTION) {
    this.program.description = chunk.data.literal;
  }else if(chunk.type === states.OPTIONS 
    || chunk.type === states.COMMANDS) {
    this.program[chunk.type] = chunk.data[chunk.type];
  // got section chunk
  }else{
    this.program.sections = this.program.sections || [];
    this.program.sections.push(chunk);
  }
  cb();
}

function exclusive() {
  var i
    , src
    , ptn
    , match
    , options = this.program.options
    , entry
    , names;

  // get the key for an option name
  function find(name) {
    for(var k in options) {
      if(~options[k].names.indexOf(name)) {
        return k; 
      } 
    }
  }

  function onName(name) {
    var key = find(name);
    if(!key) {
      throw new Error(
        'missing key for synopsis option: ' + name + ' (option not found)'); 
    }
    entry.keys.push(key);
  }

  // iterate all synopsis and extract exclusivity declarations
  if(this.program.synopsis) {
    for(i = 0;i < this.program.synopsis.length;i++) {
      src = this.program.synopsis[i];
      ptn = /(\[|<)([^\]>]+)(\]|>)/g;
      while((match = ptn.exec(src)) !== null) {
        if(match[2] && /[|]/.test(match[2])) {
          this.program.exclusive = this.program.exclusive || [];
          entry = {
            literal: match[0],
            keys: []
          }
          this.program.exclusive.push(entry);
          names = match[2].split(/\s*[|]\s*/);
          names.forEach(onName);
        }
      }
    } 
  }
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
  try {
    this.exclusive();
  }catch(e) {
    return cb(e); 
  }

  if(this.compact) {
    if(Array.isArray(this.program.description)) {
      this.program.description = this.program.description.join('\n\n');
    }
    this.program.commands = flatten(this.program.commands);
    this.program.options = flatten(this.program.options);
    delete this.program.sections; 
  }
  this.push(this.program);
  cb();
}

Compiler.prototype.exclusive = exclusive;

module.exports = through.transform(transform, flush, {ctor: Compiler});
