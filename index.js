var types = {
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
    , ast = require('mkast')
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
  stream = ast.parser(opts.input)
    .pipe(stream)
    .pipe(renderer)
    .pipe(opts.output);

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
 *  @option {String=json} type the renderer type.
 *
 *  @returns a parser stream.
 */
function src(opts) {
  opts = opts || {};
  var type = opts.type || types.json
    , Parser = require('./lib/parser');

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
 *  @option {String=json} type the renderer type.
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
    throw new Error('unknown output type: ' + type);
  }

  var Type = require('./lib/render/' + type)
  return new Type(opts);
}

/**
 *  Load a program definition into a new program assigning the definition 
 *  properties to the program.
 *
 *  Properties are passed by reference so if you modify the definition the 
 *  program is also modified.
 *
 *  @function load
 *  @param {Object} def the program definition.
 *  @param {Object} [opts] program options.
 *
 *  @returns a new program.
 */
function load(def) {
  var Program = require('./lib/program')
    , prg = new Program();
  for(var k in def) {
    prg[k] = def[k];
  }
  return prg;
}

/**
 *  Load a program definition into a new program assigning the definition 
 *  properties to the program.
 *
 *  Properties are passed by reference so if you modify the definition the 
 *  program is also modified.
 *
 *  The callback function signature is `function(err, req)` where `req` is a 
 *  request object that contains state information for program execution.
 *
 *  Plugins may decorate the request object with pertinent information that 
 *  does not affect the `target` object that receives the parsed arguments.
 *
 *  @function run
 *  @param {Object} src the source program or definition.
 *  @param {Array} argv the program arguments.
 *  @param {Object} [runtime] runtime configuration.
 *  @param {Function} cb callback function.
 *
 *  @returns a new program.
 */
function run(src, argv, runtime, cb) {
  var Program = require('./lib/program')
    , runner = require('./lib/run');

  if(!(src instanceof Program)) {
    src = load(src); 
  }

  runner.call(src, argv, runtime, cb);
}

cli.load = load;
cli.types = types;
cli.src = src;
cli.dest = dest;
cli.run = run;
cli.camelcase = require('./lib/camelcase');

Object.keys(types).forEach(function(nm) {
  cli[nm.toUpperCase()] = nm;
});

module.exports = cli;
