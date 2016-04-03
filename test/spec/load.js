var expect = require('chai').expect
  , mkcli = require('../../index');

describe('mkcli:', function() {
  
  it('should return empty program from load()', function(done) {
    var prg = mkcli.load();
    expect(prg).to.be.an('object');
    done();
  });

  it('should return program from load()', function(done) {
    var def = {options: {foo:{}}}
      , prg = mkcli.load(def);
    expect(prg).to.be.an('object');
    expect(prg.options.foo).to.be.an('object');
    done();
  });

});
