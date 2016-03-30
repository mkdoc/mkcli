var through = require('through3')
  , ast = require('mkast')
  , Node = ast.Node
  , literal = ast.NodeWalker.literal
  , collect = ast.NodeWalker.collect
  , Program = require('./program')
  , states = {
      // in the program name section
      NAME: 'name',
      // in an options declaration
      OPTIONS: 'options',
      // in a commands declaration
      COMMANDS: 'commands',
      // in a manual section entry
      SECTION: 'section'
    };

/**
 *  Reads the tree for a markdown document and creates an object that 
 *  represents a command line program.
 */
function CliParser(opts) {
  opts = opts || {};

  // current state
  this.state = undefined;
  this.program = new Program();

  // current command receiving options and commands
  this.command = this.program;
}

function transform(chunk, encoding, cb) {

  var lit;

  // ignore EOF chunks
  if(Node.is(chunk, Node.EOF)) {
    return cb(); 
  // get program name from first level 1 heading
  }else if(!this.program.name
    && Node.is(chunk, Node.HEADING)
    && chunk.level === 1) {
    this.program.name = literal(chunk);
    this.state = states.NAME;
  // get program synopsis
  }else if(!this.program.synopsis
    && Node.is(chunk, Node.CODE_BLOCK)
    && chunk.info
    && /^synopsis/.test(chunk.info)) {
    this.program.synopsis = chunk.literal.replace(/\n$/, '');
  // get program info chunks
  }else if(this.state === states.NAME
    && !Node.is(chunk, Node.HEADING)) {
    this.program.description = this.program.description || [];
    this.program.description.push(chunk);
  // set state for options and commands parsing
  }else if(Node.is(chunk, Node.HEADING) && chunk.level === 2) {
    lit = literal(chunk); 
    if(/^options$/i.test(lit)) {
      this.state = states.OPTIONS;
    }else if(/^commands$/i.test(lit)) {
      this.state = states.COMMANDS;
    }else{
      this.state = states.SECTION;
      this.section = [];
      this.section.push(chunk);
      this.command.sections.push(this.section);
    }
  }else if(this.state === states.SECTION && !Node.is(chunk, Node.HEADING)) {
    this.section.push(chunk);
  // parse options list declarations
  }else if((this.state === states.OPTIONS || this.state === states.COMMANDS)
    && Node.is(chunk, Node.LIST)) {
    try {
      this.parse(chunk, this.state);
    }catch(e) {
      return cb(e); 
    }
  // reset state on next heading
  }else if(Node.is(chunk, Node.HEADING)) {
    this.state = null; 
  }

  cb();
}

/**
 *  Parse options or commands into the current command.
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
    , next;

  for(i = 0;i < items.length;i++) {
    item = items[i];
    container = item.firstChild;
    definition = container.firstChild;
    declaration = definition.literal;

    if(id === states.OPTIONS) {
      opt = Program.parse(declaration);
    }else{
      opt = Program.parse(declaration, {command: true});
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

    // add to the current command being processed
    this.command[id][opt.key] = opt;
  }
}

function flush(cb) {
  this.push(this.program);
  cb();
}

CliParser.prototype.parse = parse;

module.exports = through.transform(transform, flush, {ctor: CliParser});
