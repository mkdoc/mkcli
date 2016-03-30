var through = require('through3')
  , EOL = '\n';

/**
 *  Transforms a program description to plain text help.
 */
function Help(opts) {
  opts = opts || {};
}

function transform(chunk, encoding, cb) {
  //console.error(chunk.name);
  console.error(chunk.synopsis);
  if(chunk.name) {
    this.push(chunk.name);
    if(chunk.synopsis) {
      this.push(chunk.synopsis); 
    }
    this.push(EOL);
  }
  cb();
}

module.exports = through.transform(transform, {ctor: Help});
