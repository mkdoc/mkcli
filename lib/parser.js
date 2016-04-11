var through = require('through3')
  , path = require('path')
  , fs = require('fs')
  , ast = require('mkast')
  , Node = ast.Node
  , walker = ast.NodeWalker
  , literal = walker.literal
  , collect = walker.collect
  , Compiler = require('./compiler')
  , State = require('./state')
  , optparse = require('./optparse')
  , format = require('./format')
  , states = State.states;

/**
 *  Reads the tree for a markdown document and pushes state information to 
 *  the stream.
 *
 *  @constructor Parser
 */
function Parser(opts) {
  opts = opts || {};
  // current state
  this.state = undefined;

  this.match = {};
  for(var k in states) {
    this.match[k.toLowerCase()] = new RegExp(states[k], 'im');
  }

  // secrion is defined for a string constant
  // we don't need to match on it
  delete this.match.section;

  // the state for the name section
  // so that we can test if it came first
  this.name = undefined;

  // current file being processed
  this.file = opts.file;

  // do we recursively load command definition files
  this.recursive = opts.recursive;

  // list of commands found - load subcommand definitions when available
  this.commands = undefined;
}

function transform(chunk, encoding, cb) {
  var lit
    , k;

  // start a section
  if(Node.is(chunk, Node.EOF)
    || Node.is(chunk, Node.DOCUMENT)
    || (Node.is(chunk, Node.HEADING) && chunk.level === 1)) {

    // finalize existing state on next level 1
    if(this.state) {

      if(!this.name) {
        return cb(new Error('name section must be declared first'));
      }

      try {
        this.finalize(this.state); 
      }catch(e) {
        return cb(e); 
      }
    }

    if(Node.is(chunk, Node.DOCUMENT) || Node.is(chunk, Node.EOF)) {
      this.push(chunk);

      // set on document
      if(chunk.file) {
        this.file = chunk.file;
      // clear on EOF
      }else{
        if(this.recursive && this.commands) {
          return this.command(this.commands, cb);
        }
      }

      return cb();
    }

    // does the header text match a known state?
    lit = literal(chunk);
    for(k in this.match) {
      if(this.match[k].test(lit)) {
        this.state = new State(k, chunk);
        break;
      } 
    }

    // so we can test that the name section has been declared first
    if(this.state && this.state.type === states.NAME) {
      this.name = this.state; 
    }

    // default state is custom man section
    if(!this.state) {
      this.state = new State(states.SECTION, chunk);
    }

  }else if(this.state) {
    this.state.nodes.push(chunk); 
  }else{
    return cb(new Error('content before name section'));
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
    // declaration is the first inline code block
    , declaration
    // resulting option definition
    , opt
    // collection of description nodes
    , description
    // collection of item blocks
    , blocks
    , map = {};


  function onItemChild(block) {
    // only paragraphs for the moment
    if(Node.is(block, Node.PARAGRAPH)) {

      var code
        , isFullNode = typeof block.unlink === 'function';

      // do not include the code specification
      // in the description
      if(block.firstChild === declaration) {
        code = block.firstChild;

        // NOTE: cannot delete firstChild when full AST node
        if(isFullNode) {
          code.unlink();
        }else{
          delete block.firstChild;
          block.firstChild = code.next;
        }
      }

      if(description.literal) {
        description.literal += '\n\n';
      }

      description.literal += literal(block);

      // restore code node in tree
      if(code) {
        if(isFullNode) {
          block.prependChild(code); 
        }else{
          block.firstChild = code; 
        }
      }
    }
  }

  for(i = 0;i < items.length;i++) {
    item = items[i];

    if(!Node.is(item.firstChild.firstChild, Node.CODE)) {
      throw new Error(
        'missing inline code specification for option or command'); 
    }

    declaration = collect(item, Node.CODE)[0];

    if(id === states.OPTIONS) {
      opt = optparse(declaration.literal);
    }else{
      opt = optparse(
        declaration.literal, {command: true});
    }

    // rewrite to formatted literal for output
    declaration.source = declaration.literal;
    declaration.literal = format(opt);

    description = {
      nodes: [],
      literal: ''
    }

    blocks = walker.children(item);
    blocks.forEach(onItemChild);
    opt.description = description;

    if(map[opt.key]) {
      throw new Error(
        'duplicate key \'' + opt.key + '\' in section: ' + id);
    }

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
    , items
    // collect all command/option names so we can check 
    // for duplicates
    , names = []
    , map;

  function onListItem(item) {
    state.data.names.push(literal(item)); 
  }

  function onName(nm) {
    if(~names.indexOf(nm)) {
      throw new Error(
        'duplicate ' + type + ' name detected:' + nm); 
    } 
  }

  if(state.nodes.length > 1) {
    state.data = {};
    switch(type) {
      case states.NAME:
        // skip the heading
        chunk = state.nodes[1];
        if(!Node.is(chunk, Node.PARAGRAPH)) {
          throw new Error('name section must begin with a paragraph');
        }

        state.data.name = literal(chunk);

        if(~state.data.name.indexOf(' - ')) {

          // extract short summary
          state.data.summary = 
            state.data.name.substr(state.data.name.indexOf(' - ') + 1);

          state.data.name =
            state.data.name.substr(0, state.data.name.indexOf(' - ')); 

          state.data.summary =
            state.data.summary.replace(/^\s*-\s*/, '').trim();
        }

        if(!state.data.summary) {
          throw new Error('program summary is required'); 
        }

        state.data.name = state.data.name.trim();
        state.data.names = [state.data.name];

        // skip the heading
        for(i = 1;i < state.nodes.length;i++) {
          chunk = state.nodes[i];
          if(Node.is(chunk, Node.LIST)) {
            items = collect(chunk, Node.ITEM);
            items.forEach(onListItem);
          }
        }

        break;
      case states.DESCRIPTION:
        chunks = state.nodes.slice(1);

        state.data.literal = [];

        // collect paragraph elements
        for(i = 0;i < chunks.length;i++) {
          if(Node.is(chunks[i], Node.PARAGRAPH)) {
            state.data.literal.push(literal(chunks[i]));
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
            state.data.synopsis.push(chunk.literal.replace(/\n$/, ''));
          }else{
            throw new Error('synopsis section may only contain code blocks');
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

              // check for duplicate key
              if(state.data[type][k]) {
                throw new Error(
                  'duplicate key \'' + k + '\' in section: ' + type); 
              }

              // check for duplicate command or option name
              map[k].names.forEach(onName);

              names = names.concat(map[k].names);
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
  }

  // keep reference so we can load sub-command definitions
  if(type === states.COMMANDS && state.data) {
    this.commands = state.data.commands; 
  }

  this.push(state);
  this.state = null;
}

function command(map, cb) {
  if(!this.file) {
    throw new Error('cannot load subcommands without file information'); 
  }

  var k
    , ptn = /(\w+)\.(.*)$/
    , file = this.file
    , name = path.basename(file)
    , dir = path.dirname(file)
    , id = name.replace(ptn, '$1')
    , ext = name.replace(ptn, '$2')
    , lookup = {}
    , files = []
    , readable = []
    , nm;

  // build list of potential subcommand files
  for(k in map) {
    nm = id + '-' + k + '.' + ext;
    nm = path.join(dir, nm);
    files.push(nm);
    // lookup table of files to command key
    lookup[nm] = k;
  }

  function load() {
    var file = readable.shift();
    if(!file) {
      return cb();
    }

    fs.readFile(file, function(err, contents) {
      if(err) {
        return cb(err); 
      }
      var reader = ast.src('' + contents)
        , Parser = module.exports
        , parser = new Parser({file: file, recursive: this.recursive})
        , compiler = new Compiler({program: map[lookup[file]]});
      reader.pipe(parser).pipe(compiler);
      parser.once('error', cb);
      compiler.once('finish', cb);
    });

  }

  function done(err) {
    if(err) {
      return cb(err); 
    }
    if(readable.length) {
      load();
    }else{
      cb();
    }
  }

  // test for command files that exist
  function test() {
    var file = files.shift();
    if(!file) {
      return done(); 
    }
    fs.stat(file, function(err, stats) {
      if(err && err.code !== 'ENOENT') {
        return done(err); 
      }else if(err) {
        return test(); 
      }

      if(stats.isFile()) {
        readable.push(file);
      }

      test();
    })
  }
  test();
}

Parser.prototype.parse = parse;
Parser.prototype.command = command;
Parser.prototype.finalize = finalize;

module.exports = through.transform(transform, {ctor: Parser});
