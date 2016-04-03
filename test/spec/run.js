var expect = require('chai').expect
  , mkcli = require('../../index');

describe('mkcli:', function() {

  it('should run program with definition object', function(done) {
    var argv = ['--foo=bar'];
    mkcli.run({options: {}}, argv, function(err, req) {
      expect(req).to.be.an('object');
      expect(this.foo).to.eql('bar');
      done();
    }) 
  });

  
  it('should run program with valid program instance', function(done) {
    var prg = mkcli.load({options: {}})
      , argv = ['--foo=bar'];
    mkcli.run(prg, argv, function(err, req) {
      expect(req).to.be.an('object');
      expect(this.foo).to.eql('bar');
      done();
    }) 
  });

});
