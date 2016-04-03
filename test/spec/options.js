var expect = require('chai').expect
  , mkcli = require('../../index');

describe('mkcli:', function() {
  
  it('should return stream with no options', function(done) {
    var stream = mkcli();
    expect(stream).to.be.an('object');
    done();
  });

  it('should callback with error on bad type', function(done) {
    mkcli({type: 'foo'}, function(err) {
      function fn() {
        throw err;
      }
      expect(fn).throws(Error);
      done();
    });
  });

  it('should throw error on bad type without a callback', function(done) {
    function fn() {
      mkcli({type: 'foo'});
    }
    expect(fn).throws(Error);
    done();
  });

});
