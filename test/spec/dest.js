var expect = require('chai').expect
  , cli = require('../../index');

describe('dest:', function() {
  
  it('should return stream', function(done) {
    var stream = cli.dest();
    expect(stream).to.be.an('object');
    done();
  });

  it('should return stream with type option', function(done) {
    var stream = cli.dest({type: 'help'});
    expect(stream).to.be.an('object');
    done();
  });

  it('should error with unsupported type', function(done) {
    function fn() {
      cli.dest({type: 'foo'});
    }
    expect(fn).throws(/unknown output type/i);
    done();
  });

});
