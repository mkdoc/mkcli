var ast = require('mkast')
  , Parser = require('./lib/parser')
  , types = {
      json: 'json',
      help: 'help'
    }

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

  if(opts.type === types.json) {
    opts.buffer = true; 
  }

  var stream = new Parser(opts)
    , type = opts.type
    , Type
    , renderer;

  if(!types[type]) {
    return cb(new Error('unknown output type: ' + type)); 
  }

  if(type) {
    try {
      Type = require('./lib/render/' + type)
    }catch(e) {
      return cb(e); 
    }
    renderer = new Type(opts);
  }

  if(!opts.input || !opts.output) {
    if(renderer) {
      return stream.pipe(renderer);
    }
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

cli.types = types;

module.exports = cli;
