function version(opts, cb) {
  if(this.version === true && opts.name && opts.version) {
    process.stdout.write(opts.name + ' ' + opts.version + '\n');
    // NOTE: don't call the callback
  }else{
    cb();
  }
}

module.exports = version;
