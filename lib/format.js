/**
 *  Default format function invoked in the scope of the argument.
 *
 *  @function formatter
 */
function formatter(opts) {
  var delimiter = opts.delimiter || ', '
    , assign = opts.assign || '='
    , str = this.names.join(delimiter)
    , extra;

  if(this.extra) {
    extra = this.extra.trim();
    extra = extra.replace(/^=/, '');
    extra = assign + extra;
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

  if(typeof fmt === 'object') {
    opts = fmt;
    fmt = null;
  }
  
  if(typeof fmt !== 'function') {
    fmt = formatter; 
  }
  return fmt.call(arg, opts);
}

format.formatter = formatter;

module.exports = format;
