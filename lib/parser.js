var through = require('through3')
  , ast = require('mkast')
  , Node = ast.Node
  , literal = ast.NodeWalker.literal
  , collect = ast.NodeWalker.collect
  , State = require('./state')
  , optparse = require('./optparse')
  , states = State.states;

/**
 *  Reads the tree for a markdown document and pushes state information to 
 *  the stream.
 *
 *  @constructor Parser
 *  @param {Object} [opts] processing options.
 *
 *  @option {Object} match map of header regular expressions.
 */
function Parser(opts) {
  opts = opts || {};

  // current state
  this.state = undefined;

  this.match = opts.match && typeof opts.match === 'object'
    ? opts.match : null;

  if(!this.match) {
    this.match = {};
    for(var k in states) {
      this.match[k.toLowerCase()] = new RegExp(states[k], 'im');
    }
    delete this.match.section;
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

    // default is custom man section
    if(!this.state) {
      this.state = new State(states.SECTION, chunk);
    }

  }else if(this.state) {
    this.state.nodes.push(chunk); 
  }

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

    opt.description = description;

    // remove first space from description literal
    opt.description.literal = opt.description.literal.replace(/^ /, '');
  
    map[opt.key] = opt;
  }

  return map;
}

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
    default:
      // NOTE: no custom parsing for other sections
      break;
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

Parser.prototype.parse = parse;

Parser.prototype.finalize = finalize;

module.exports = through.transform(transform, flush, {ctor: Parser});
