var expect = require('chai').expect
  , State = require('../../lib/state');

describe('state:', function() {
  
  it('should create state with attributes', function(done) {
    var state = new State(State.NAME, {foo: 'bar'});
    expect(state).to.be.an('object');
    expect(state.foo).to.eql('bar');
    done();
  });

});
