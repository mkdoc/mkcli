var Argument = require('./argument');

/**
 *  Represents a command for a command line interface.
 *
 *  @constructor Command
 */
function Command() {
  Argument.apply(this, arguments);

  this.type = Command.COMMAND;
 
  // declarative but prefer undefined to null
  this.name = undefined;
  this.description = undefined;
  this.synopsis = undefined;

  this.options = undefined;
  this.commands = undefined;
  this.sections = undefined;
}


Command.prototype = Object.create(Argument.prototype);

Command.COMMAND = 'command';
Command.PROGRAM = 'program';

module.exports = Command;
