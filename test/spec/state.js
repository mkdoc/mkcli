var expect = require('chai').expect
  , State = require('../../lib/state');

describe('state:', function() {

  it('should create state ', function(done) {
    var state = new State(State.NAME);
    expect(state).to.be.an('object');
    expect(state.nodes).to.eql([]);
    done();
  });
  
  it('should create state with chunk', function(done) {
    var state = new State(State.NAME, {foo: 'bar'});
    expect(state).to.be.an('object');
    expect(state.nodes).to.eql([{foo: 'bar'}]);
    done();
  });

});
