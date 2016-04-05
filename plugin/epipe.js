function listen(stream, cb) {
  stream = stream || process.stdout;
  cb = cb || process.exit;

  function listener(err) {
    if(err.code === 'EPIPE') {
      return cb();
    }

    stream.removeListener('error', listener);
    stream.emit('error', err);
    stream.on('error', listener);
  }

  // just in case the program is run multiple times
  stream.removeListener('error', listener);
  stream.on('error', listener);
}

/**
 *  Traps the EPIPE error on stdout.
 *
 *  @function epipe
 *  @param {Object} req plugin request object.
 *  @param {Function} cb callback function.
 */
function epipe(req, cb) {
  listen(req.conf.stream, req.conf.callback);
  cb();
}

module.exports = epipe;
