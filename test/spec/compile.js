var expect = require('chai').expect
  , cli = require('../../index');

describe('compile:', function() {
  
  it('should return stream', function(done) {
    var stream = cli.compile();
    expect(stream).to.be.an('object');
    done();
  });

});
