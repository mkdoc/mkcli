var through = require('through3');

/**
 *  Transforms parser state information to nodes that reflect a final man 
 *  page output for the program.
 *
 *  @constructor Man
 *  @param {Object} opts renderer options.
 *
 *  @option {Boolean=true} [upper] convert level one headings to upper case.
 */
function Man(opts) {
  this.upper = opts.upper !== undefined ? opts.upper : true;
}

function transform(chunk, encoding, cb) {
  this.push(chunk);
  cb();
}

module.exports = through.transform(transform, {ctor: Man});
