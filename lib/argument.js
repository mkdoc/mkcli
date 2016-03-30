/**
 *  Represents an argument to a command line program.
 *
 *  @constructor Argument
 */
function Argument() {
  this.literal = undefined;
  this.key = undefined;
  this.description = undefined;
  this.names = [];
}

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

function format(fmt, opts) {
  opts = opts || {};
  if(typeof fmt !== 'function') {
    fmt = formatter; 
  }
  return fmt.call(this, opts);
}

function getDescription() {
  return this.description.literal.replace(/:? /, '');
}

Argument.FLAG = 'flag';
Argument.OPTION = 'option';

Argument.prototype.format = format;
Argument.prototype.getDescription = getDescription;

module.exports = Argument;
