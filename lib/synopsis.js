/**
 *  Performs formatting of the synopsis strings.
 *
 *  @constructor Synopsis
 *  @param {Object} state synopsis state information.
 */
function Synopsis(state) {
  this.state = state;
  this.literal = state.data.synopsis;
  this.name = state.name.data.name;
  this.options = state.options.data.options;
}

function toString() {
  var str = ''
    , name = this.name
    , i
    , src;

  for(i = 0;i < this.literal.length;i++) {
    src = this.literal[i];

    str += name + ' ' + src;
  }

  return str;
}

Synopsis.prototype.toString = toString;

module.exports = Synopsis;
