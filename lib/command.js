/**
 *  Represents a command for a command line interface.
 *
 *  @constructor Command
 */
function Command() {
 
  // declarative but prefer undefined to null
  this.name = undefined;
  this.description = undefined;
  this.synopsis = undefined;

  this.options = {};
  this.commands = {};
}

module.exports = Command;
