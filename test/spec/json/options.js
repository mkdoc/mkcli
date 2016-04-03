var expect = require('chai').expect
  , cli = require('../../../index');

describe('cli:', function() {
  
  it('should return stream with no options', function(done) {
    var stream = cli();
    expect(stream).to.be.an('object');
    done();
  });

  it('should callback with error on bad type', function(done) {
    cli({type: 'foo'}, function(err) {
      function fn() {
        throw err;
      }
      expect(fn).throws(Error);
      done();
    });
  });

  it('should throw error on bad type without a callback', function(done) {
    function fn() {
      cli({type: 'foo'});
    }
    expect(fn).throws(Error);
    done();
  });

});
