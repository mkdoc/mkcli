var Argument = require('./argument');

/**
 *  Represents a flag argument to a command line program.
 *
 *  @constructor Flag
 */
function Flag() {
  Argument.apply(this, arguments);
  this.type = Argument.FLAG;
}

Flag.prototype = Object.create(Argument.prototype);

module.exports = Flag;
