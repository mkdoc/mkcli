var Argument = require('./argument')
  , OPTION = 'option';

/**
 *  Represents an option argument to a command line program.
 *
 *  @constructor Option
 */
function Option() {
  Argument.apply(this, arguments);
  this.type = OPTION;
}

Option.prototype = Object.create(Argument.prototype);

module.exports = Option;
