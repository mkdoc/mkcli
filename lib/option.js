var Argument = require('./argument');

/**
 *  Represents an option argument to a command line program.
 *
 *  @constructor Option
 */
function Option() {
  Argument.apply(this, arguments);
  this.type = Argument.OPTION;
  this.extra = undefined;
  this.required = undefined;
  this.multiple = undefined;

  // a type specified in the literal, eg: {Number}
  this.kind = undefined

  // default value for the option, eg: {=stdout}
  this.value = undefined;
}

Option.prototype = Object.create(Argument.prototype);

module.exports = Option;
