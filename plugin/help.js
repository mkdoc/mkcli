var fs = require('fs')
  , path = require('path');

function help(req, cb) {
  var conf = req.conf
    , file = conf.file;
  if(this.help === true && file) {
    print(file, req)
    // NOTE: don't call the callback
  }else{
    cb();
  }
}

function print(file, req) {
  if(req.runtime.base) {
    file = path.join(req.runtime.base, file);
  }
  fs.createReadStream(file).pipe(process.stdout);
}

help.print = print;

module.exports = help;