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

function formatter() {
  return this.names.join(', ');
}

function format(fmt) {
  if(typeof fmt !== 'function') {
    fmt = formatter; 
  }
  return fmt.call(this);
}

Argument.FLAG = 'flag';
Argument.OPTION = 'option';

Argument.prototype.format = format;

module.exports = Argument;
