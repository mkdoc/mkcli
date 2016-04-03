var through = require('through3')
  , ast = require('mkast')
  , Node = ast.Node
  , literal = ast.NodeWalker.literal
  , collect = ast.NodeWalker.collect
  , Program = require('./program')
  , State = require('./state')
  , optparse = require('./optparse')
  , states = State.states;

/**
 *  Reads the tree for a markdown document and creates an object that 
 *  represents a command line program.
 */
function CliParser(opts) {
  opts = opts || {};

  // current state
  this.state = undefined;
  this.program = opts.program || new Program();

  // current command receiving options and commands
  this.command = this.program;

  this.buffer = opts.buffer;

  this.match = opts.match && typeof opts.match === 'object'
    ? opts.match : null;

  if(!this.match) {
    this.match = {};
    for(var k in states) {
      this.match[k.toLowerCase()] = new RegExp(states[k], 'im');
    }
  }
}

function transform(chunk, encoding, cb) {
  var lit
    , k;

  // ignore EOF chunks
  if(Node.is(chunk, Node.EOF)) {
    return cb(); 
  // start a section
  }else if(Node.is(chunk, Node.HEADING) && chunk.level === 1) {

    // finalize existing state on next level 1
    if(this.state) {
      try {
        this.finalize(this.state); 
      }catch(e) {
        return cb(e); 
      }
    }

    lit = literal(chunk);

    for(k in this.match) {
      if(this.match[k].test(lit)) {
        this.state = new State(k, chunk);
        break;
      } 
    }

  }else if(this.state) {
    this.state.nodes.push(chunk); 
  }

  // get program name from first level 1 heading
  //}else if(!this.program.name
    //&& Node.is(chunk, Node.HEADING)
    //&& chunk.level === 1) {
    //this.program.name = literal(chunk);
    //this.state = states.NAME;
  //// get program synopsis
  //}else if(!this.program.synopsis
    //&& Node.is(chunk, Node.CODE_BLOCK)
    //&& chunk.info
    //&& /^synopsis/.test(chunk.info)) {
    //this.program.synopsis = chunk.literal.replace(/\n$/, '');
  //// get program info chunks
  //}else if(this.state === states.NAME
    //&& !Node.is(chunk, Node.HEADING)) {
    //if(!this.buffer) {
      //this.program.description = this.program.description || [];
      //this.program.description.push(chunk);
    //}else {
      //this.program.description = this.program.description || '';
      //this.program.description += literal(chunk);
    //}
  //// set state for options and commands parsing
  //}else if(Node.is(chunk, Node.HEADING) && chunk.level === 2) {

    //this.send();

    //lit = literal(chunk); 
    //if(/^options$/i.test(lit)) {
      //this.state = states.OPTIONS;
    //}else if(/^commands$/i.test(lit)) {
      //this.state = states.COMMANDS;
    //}else{
      //this.state = states.SECTION;
      //this.section = [];
      //this.section.push(chunk);
      //this.command.sections = this.command.sections || [];
      //this.command.sections.push(this.section);
    //}
  //}else if(this.state === states.SECTION && !Node.is(chunk, Node.HEADING)) {
    //this.section.push(chunk);
  //// parse options list declarations
  //}else if((this.state === states.OPTIONS || this.state === states.COMMANDS)
    //&& Node.is(chunk, Node.LIST)) {
    //try {
      //this.parse(chunk, this.state);
    //}catch(e) {
      //return cb(e); 
    //}

    //// send the options of commands chunk
    //this.send();

  //// reset state on next heading
  //}else if(Node.is(chunk, Node.HEADING) && chunk.level === 2) {
    //this.send();
  //}

  cb();
}

/**
 *  Parse options or commands.
 *
 *  @private
 */
function parse(list, id) {
  var items = collect(list, Node.ITEM)
    , i
    // list item
    , item
    // container element: paragraph
    , container
    // definition is the first child inline code block
    , definition
    // declaration is the string literal for the inline code block
    , declaration
    // resulting option definition
    , opt
    // collection of description nodes
    , description
    , next
    , map = {};

  for(i = 0;i < items.length;i++) {
    item = items[i];
    container = item.firstChild;
    definition = container.firstChild;
    declaration = definition.literal;

    if(id === states.OPTIONS) {
      opt = optparse(declaration);
    }else{
      opt = optparse(declaration, {command: true});
    }

    description = {
      nodes: [],
      literal: ''
    }

    next = definition.next;

    while(next) {
      description.nodes.push(next);
      description.literal += literal(next);
      next = next.next; 
    }
  
    if(!this.buffer) {
      opt.description = description;
    }else{
      opt.description = description.literal;

      // remove single leading space from description
      opt.description = opt.description.replace(/^ /, '');
    }


    // add to the current command being processed
    map[opt.key] = opt;
  }

  return map;
}

//function send() {

  //if(this.buffer) {
    //return; 
  //}

  //var state;
  //if(this.state === states.NAME) {
    //state = new State(
      //states.NAME,
      //{
        //name: this.program.name,
        //description: this.program.description,
        //synopsis: this.program.synopsis
      //}
    //); 
  //}else if(this.state === states.OPTIONS
    //|| this.state === states.COMMANDS) {
    //state = new State(
      //this.state,
      //{
        //map: this.command[this.state]
      //}
    //); 
  //}

  //if(state) {
    //this.push(state);
  //}

  //this.state = null; 
//}

function finalize(state) {
  var type = state.type
    , i
    , k
    , chunk
    , chunks
    , map;

  switch(type) {
    case states.NAME:
      // skip the heading
      chunk = state.nodes[1];
      if(Node.is(chunk, Node.PARAGRAPH)) {
        state.data.name = literal(chunk);
        state.data.names = [state.data.name];
      }
      // TODO: support lists for multiple names
      break;
    case states.DESCRIPTION:
      chunks = state.nodes.slice(1);

      state.data.literal = [];

      // collect paragraph literals
      for(i = 0;i < chunks.length;i++) {
        chunk = chunks[i];
        if(Node.is(chunk, Node.PARAGRAPH)) {
          state.data.literal.push(literal(chunk));
        }
      }

      // all data without the heading
      state.data.nodes = chunks;
      break;
    case states.SYNOPSIS:
      chunks = state.nodes.slice(1);

      // collect code blocks for synopsis
      state.data.synopsis = [];

      // collect paragraph literals
      for(i = 0;i < chunks.length;i++) {
        chunk = chunks[i];
        if(Node.is(chunk, Node.CODE_BLOCK)) {
          state.data.synopsis.push(chunk.literal);
        }
      }

      // all data without the heading
      state.data.nodes = chunks;
      break;
    case states.COMMANDS:
    case states.OPTIONS:
      chunks = state.nodes.slice(1);

      // collect lists for commands and options
      state.data[type] = {};

      // collect paragraph literals
      for(i = 0;i < chunks.length;i++) {
        chunk = chunks[i];
        if(Node.is(chunk, Node.LIST)) {
          map = this.parse(chunk, type);
          for(k in map) {
            state.data[type][k] = map[k];
          }
          
        }
      }

      // all data without the heading
      state.data.nodes = chunks;
      break;
    case states.SECTION:
      // NOTE: no custom parsing for other sections
      break;
    default:
      throw new Error('unknown state type: ' + type);
  }

  this.push(state);
  this.state = null;
}

function flush(cb) {
  // finalize any trailing state data
  if(this.state) {
    try {
      this.finalize(this.state); 
    }catch(e) {
      return cb(e); 
    }
  }
  cb();
}

CliParser.prototype.parse = parse;
//CliParser.prototype.send = send;

CliParser.prototype.finalize = finalize;

module.exports = through.transform(transform, flush, {ctor: CliParser});
