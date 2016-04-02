var ast = require('mkast')
  , Program = require('./lib/program')
  , Parser = require('./lib/parser')
  , types = {
      json: 'json',
      help: 'help'
    };

/**
 *  Creates documentation for command line interfaces.
 *
 *  @private {function} cli
 *  @param {Object} [opts] processing options.
 *  @param {Function} [cb] callback function.
 *
 *  @option {Readable} [input] input stream.
 *  @option {Writable} [output] output stream.
 *
 *  @returns an output stream.
 */
function cli(opts, cb) {
  opts = opts || {};

  opts.type = opts.type || types.json;

  var stream = src(opts)
    , renderer;

  try {
    renderer = dest(opts)
  }catch(e) {

    if(typeof cb === 'function') {
      return cb(e); 
    }
    throw e;
  }

  if(!opts.input || !opts.output) {
    return stream;
  }

  // set up input stream
  stream = ast.parser(opts.input).pipe(stream)

  if(renderer) {
    stream = stream.pipe(renderer);
  // print as JSON with no renderer
  }else{
    stream = stream.pipe(ast.stringify());
  }

  stream.pipe(opts.output);

  if(cb) {
    opts.output
      .once('error', cb)
      .once('finish', cb);
  }

  return opts.output;
}

/**
 *  Gets a source parser stream that transforms the incoming tree nodes into 
 *  a program definition.
 *
 *  @function src
 *  @param {Object} [opts] parser options.
 *
 *  @returns a parser stream.
 */
function src(opts) {
  var type = opts.type;

  if(type === types.json) {
    opts.buffer = true; 
  }

  return new Parser(opts);
}

/**
 *  Gets a destination renderer stream.
 *
 *  When no type is specified the JSON renderer is assumed.
 *
 *  @function dest
 *  @param {Object} [opts] renderer options.
 *
 *  @returns a renderer stream of the specified type.
 */
function dest(opts) {
  opts = opts || {};
  var type = opts.type || types.json

  if(type === types.json) {
    opts.buffer = true; 
  }

  if(!types[type]) {
    var err = new Error('unknown output type: ' + type);
    throw err;
  }

  var Type
    , renderer;

  if(type) {
    Type = require('./lib/render/' + type)
    renderer = new Type(opts);
  }

  return renderer;
}

/**
 *  Load a program definition into a new program assigning the definition 
 *  properties to the program.
 *
 *  @function load
 *  @param {Object} def the program definition.
 *  @param {Object} [opts] program options.
 *
 *  @returns a new program.
 */
function load(def) {
  var prg = new Program();
  for(var k in def) {
    prg[k] = def[k];
  }
  return prg;
}

function run(src, argv, opts, cb) {
  if(!(src instanceof Program)) {
    src = load(src); 
  }

  var runner = require('./lib/run');
  runner.call(src, argv, opts, cb);
}

cli.load = load;
cli.types = types;
cli.src = src;
cli.dest = dest;
cli.run = run;
cli.camelcase = require('./lib/camelcase');

module.exports = cli;
