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

  this.options = {};
  this.commands = {};
  this.sections = [];
}


Command.prototype = Object.create(Argument.prototype);

function getColumns(target, fmt, opts) {
  var o = []
    , k
    , arg
    , name
    , max = 0;

  for(k in target) {
    arg = target[k];
    name = arg.format(fmt, opts);
    max = Math.max(max, name.length);
    o.push(
      {
        name: name,
        description: arg.getDescription(opts)
      }
    );
  }
  return {max: max, cols: o};
}

Command.COMMAND = 'command';
Command.PROGRAM = 'program';

Argument.prototype.getColumns = getColumns;

module.exports = Command;
