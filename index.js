var ast = require('mkast')
  , Parser = require('./lib/parser')
  , types = {
      json: 'json',
      help: 'help'
    };

/**
 *  Creates documentation for command line interfaces.
 *
 *  @function cli
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

function src(opts) {
  return new Parser(opts);
}

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

cli.types = types;
cli.src = src;
cli.dest = dest;

module.exports = cli;
