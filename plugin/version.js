function version(req, cb) {
  var conf = req.conf;
  if(this.version === true && conf.name && conf.version) {
    var output = req.conf && req.conf.output
      ? req.conf.output : process.stdout;
    output.write(conf.name + ' ' + conf.version + '\n', function() {
      req.abort();
    });
  }else{
    cb();
  }
}

module.exports = version;
