/**
 *  Represents a command for a command line interface.
 *
 *  @constructor Command
 */
function Command() {

  this.type = Command.COMMAND;
 
  // declarative but prefer undefined to null
  this.name = undefined;
  this.description = undefined;
  this.synopsis = undefined;

  this.options = {};
  this.commands = {};
  this.sections = [];
}

Command.COMMAND = 'command';
Command.PROGRAM = 'program';

module.exports = Command;
