var fs = require('fs')
  , path = require('path');

function help(req, cb) {
  var conf = req.conf
    , file = conf.file;
  if(this.help === true && file) {
    if(req.runtime.base) {
      file = path.join(req.runtime.base, file);
    }
    fs.createReadStream(file).pipe(process.stdout);
    // NOTE: don't call the callback
  }else{
    cb();
  }
}

module.exports = help;
