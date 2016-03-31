function State(type, attrs) {
  this.type = type;
  for(var k in attrs) {
    this[k] = attrs[k];
  }
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
