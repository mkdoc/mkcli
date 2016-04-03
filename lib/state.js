function State(type, attrs) {
  for(var k in attrs) {
    this[k] = attrs[k];
  }
  this.type = type;
}

State.states = {
  // in the program name section
  NAME: 'name',
  // in an options declaration
  OPTIONS: 'options',
  // in a commands declaration
  COMMANDS: 'commands',
  // in a manual section entry
  SECTION: 'section'
};

module.exports = State;
