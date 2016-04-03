var through = require('through3');

/**
 *  Transforms parser state information to nodes that reflect a final man 
 *  page output for the program.
 */
function Man(opts) {
  opts = opts || {};
}

function transform(chunk, encoding, cb) {
  this.push(chunk);
  cb();
}

module.exports = through.transform(transform, {ctor: Man});
