var fs = require('fs');

function help(opts, cb) {
  if(this.help === true && opts.file) {
    fs.createReadStream(opts.file).pipe(process.stdout);
    // NOTE: don't call the callback
  }else{
    cb();
  }
}

module.exports = help;
