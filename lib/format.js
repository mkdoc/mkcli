/**
 *  Default format function invoked in the scope of the argument.
 *
 *  @private {function} formatter
 */
function formatter(opts) {
  var str = this.names.join(', ')
    , assign = opts.assign || '='
    , extra;

  if(this.extra) {
    extra = this.extra.trim();
    if(extra.indexOf(assign) !== 0) {
      extra = assign + extra;
    }
    str += extra;
  }

  return str;
}

/**
 *  Get a formatted argument string.
 *
 *  If no `fmt` function is supplied the default formatter is used.
 *
 *  The `fmt` function is invoked in the scope of the `arg`.
 *
 *  @function format
 *  @param {Object} arg the flag, option or command.
 *  @param {Function} [fmt] custom format function.
 *  @param {Object} [opts] formatting options.
 */
function format(arg, fmt, opts) {
  opts = opts || {};
  if(typeof fmt !== 'function') {
    fmt = formatter; 
  }
  return fmt.call(arg, opts);
}

module.exports = format;
