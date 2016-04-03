var expect = require('chai').expect
  , mkcli = require('../../index');

describe('mkcli:', function() {
  
  it('should return stream from src()', function(done) {
    var stream = mkcli.src();
    expect(stream).to.be.an('object');
    done();
  });

  it('should return stream from src() and type option', function(done) {
    var stream = mkcli.src({type: 'help'});
    expect(stream).to.be.an('object');
    done();
  });

});
