var expect = require('chai').expect
  , mkcli = require('../../index');

describe('mkcli:', function() {
  
  it('should return stream from dest()', function(done) {
    var stream = mkcli.dest();
    expect(stream).to.be.an('object');
    done();
  });

  it('should return stream from dest() and type option', function(done) {
    var stream = mkcli.dest({type: 'help'});
    expect(stream).to.be.an('object');
    done();
  });

  it('should error with unsupporte type in dest()', function(done) {
    function fn() {
      mkcli.dest({type: 'foo'});
    }
    expect(fn).throws(/unknown output type/i);
    done();
  });

});
