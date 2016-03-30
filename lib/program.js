var Command = require('./command');

/**
 *  Represents a command line program.
 *
 *  @constructor Program
 */
function Program() {
  Command.apply(this, arguments);
}

Program.prototype = Object.create(Command.prototype);

module.exports = Program;
