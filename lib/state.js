function State(type, chunk) {
  this.type = type;
  this.nodes = chunk ? [chunk] : [];
  this.data = undefined;
}

State.states = {
  // in the program name declaration
  NAME: 'name',
  // in the program description
  DESCRIPTION: 'description',
  // in the synposis declaration
  SYNOPSIS: 'synopsis',
  // in an options declaration
  OPTIONS: 'options',
  // in a commands declaration
  COMMANDS: 'commands',
  // in a manual section entry
  SECTION: 'section'
};

module.exports = State;
