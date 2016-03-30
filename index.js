var ast = require('mkast')
  , Parser = require('./lib/parser');

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

  var stream = new Parser(opts);

  if(!opts.input || !opts.output) {
    return stream;
  }

  // set up input stream
  ast.parser(opts.input)
    .pipe(stream)
    .pipe(ast.stringify())
    .pipe(opts.output);

  if(cb) {
    opts.output
      .once('error', cb)
      .once('finish', cb);
  }

  return opts.output;
}

module.exports = cli;
