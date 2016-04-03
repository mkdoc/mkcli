var expect = require('chai').expect
  , cli = require('../../index');

describe('src:', function() {
  
  it('should return stream', function(done) {
    var stream = cli.src();
    expect(stream).to.be.an('object');
    done();
  });

  it('should return stream with type option', function(done) {
    var stream = cli.src({type: 'help'});
    expect(stream).to.be.an('object');
    done();
  });

});
