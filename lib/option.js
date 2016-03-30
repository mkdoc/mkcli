var Argument = require('./argument');

/**
 *  Represents an option argument to a command line program.
 *
 *  @constructor Option
 */
function Option() {
  Argument.apply(this, arguments);
}

Option.prototype = Object.create(Argument.prototype);

module.exports = Option;
