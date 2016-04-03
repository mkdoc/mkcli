function version(req, cb) {
  var conf = req.conf;
  if(this.version === true) {

    /* istanbul ignore next: never write to stdout in test env */
    var output = conf && conf.output
      ? conf.output : process.stdout;

    print(conf, output, function() {
      req.abort();
    });
  }else{
    cb();
  }
}

function print(conf, output, cb) {
  if(conf.literal) {
    output.write(conf.literal);
  }else{
    if(conf.name) {
      output.write(conf.name + ' ');
    }
    if(conf.version) {
      output.write(conf.version);
    }
  }
  output.write(require('os').EOL, cb);
}

version.print = print;

module.exports = version;
