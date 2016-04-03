var expect = require('chai').expect
  , cli = require('../../index');

describe('cli:', function() {
  
  it('should return empty program from load()', function(done) {
    var prg = cli.load();
    expect(prg).to.be.an('object');
    done();
  });

  it('should return program from load()', function(done) {
    var def = {options: {foo:{}}}
      , prg = cli.load(def);
    expect(prg).to.be.an('object');
    expect(prg.options.foo).to.be.an('object');
    done();
  });

});
