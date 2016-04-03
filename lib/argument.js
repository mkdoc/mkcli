/**
 *  Represents an argument to a command line program.
 *
 *  @constructor Argument
 */
function Argument() {
  this.literal = undefined;
  this.key = undefined;
  this.description = undefined;
  this.names = undefined;
}

Argument.FLAG = 'flag';
Argument.OPTION = 'option';

module.exports = Argument;
