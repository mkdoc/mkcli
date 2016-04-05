var stream
  , callback;

function listener(err) {
  if(err.code === 'EPIPE') {
    return callback();
  }
  this.removeListener('error', listener);
  this.emit('error', err);
  this.on('error', listener);
}

/**
 *  Traps the EPIPE error on stdout.
 *
 *  @function epipe
 *  @param {Object} req plugin request object.
 *  @param {Function} cb callback function.
 */
function epipe(req, cb) {
  stream = req.conf.stream || process.stdout;
  callback = req.conf.callback || process.exit;

  // just in case the program is run multiple times
  stream.removeListener('error', listener);
  stream.on('error', listener);
  cb();
}

module.exports = epipe;
