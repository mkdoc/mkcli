var through = require('through3')
  , EOL = require('os').EOL;

/**
 *  Render a program definition to JSON.
 *
 *  @constructor Json
 *  @param {Object} opts renderer options.
 *
 *  @option {Number=2} [indent] number of spaces to indent.
 */
function Json(opts) {
  this.indent = opts.indent !== undefined ? opts.indent : 2;
}

function transform(chunk, encoding, cb) {
  this.push(JSON.stringify(chunk, undefined, this.indent) + EOL);
  cb();
}

module.exports = through.transform(transform, {ctor: Json});
