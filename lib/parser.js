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

  // get program name from first level 1 heading
  if(!this.program.name
    && Node.is(chunk, Node.HEADING)
    && chunk.level === 1) {
    this.program.name = literal(chunk);
    this.state = states.NAME;
  // get program description paragraphs
  }else if(this.state === states.NAME
    && Node.is(chunk, Node.PARAGRAPH)) {
    this.program.description = this.program.description || [];
    this.program.description.push(chunk);
  }else if(!this.program.synopsis
    && Node.is(chunk, Node.CODE_BLOCK)
    && chunk.info
    && /^synopsis/.test(chunk.info)) {
    this.program.synopsis = chunk.literal.replace(/\n$/, '');
  // set state for options and commands parsing
  }else if(Node.is(chunk, Node.HEADING)
    && chunk.level === 2 || chunk.level === 3) {
    lit = literal(chunk); 
    if(/^options$/i.test(lit)) {
      this.state = states.OPTIONS;
    }else if(/^commands$/i.test(lit)) {
      console.error('in commands');
      this.state = states.COMMANDS;
    }
  // parse options list declarations
  }else if(this.state === states.OPTIONS
    && Node.is(chunk, Node.LIST)) {
    try {
      this.options(chunk);
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
 *  Parse options into the current command.
 */
function options(list) {
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
    , opt;

  for(i = 0;i < items.length;i++) {
    item = items[i];
    container = item.firstChild;
    definition = container.firstChild;
    declaration = definition.literal;
    opt = Program.opt(declaration);

    // add to the current command being processed
    this.command.options[opt.key] = opt;
  }
}

function flush(cb) {
  this.push(this.program);
  cb();
}

CliParser.prototype.options = options;

module.exports = through.transform(transform, flush, {ctor: CliParser});
