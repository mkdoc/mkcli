var expect = require('chai').expect
  , mkcli = require('../../index');

describe('mkcli:', function() {
  
  it('should return stream with no options', function(done) {
    var stream = mkcli();
    expect(stream).to.be.an('object');
    done();
  });

});
