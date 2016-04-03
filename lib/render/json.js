var through = require('through3')
  , EOL = require('os').EOL;

/**
 *  Transforms a program definition to JSON.
 */
function Json(opts) {
  opts = opts || {};
  this.indent = opts.indent !== undefined ? opts.indent : 2;
}

function transform(chunk, encoding, cb) {
  this.push(JSON.stringify(chunk, undefined, this.indent) + EOL);
  cb();
}

module.exports = through.transform(transform, {ctor: Json});
