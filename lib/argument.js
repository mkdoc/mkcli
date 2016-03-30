/**
 *  Represents an argument to a command line program.
 *
 *  @constructor Argument
 */
function Argument() {
  this.literal = undefined;
  this.key = undefined;
  this.name = undefined;
  this.description = undefined;
  this.names = [];
}

module.exports = Argument;
