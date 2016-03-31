function version(req, cb) {
  var conf = req.conf;
  if(this.version === true && conf.name && conf.version) {
    process.stdout.write(conf.name + ' ' + conf.version + '\n');
    // NOTE: don't call the callback
  }else{
    cb();
  }
}

module.exports = version;
