var expect = require('chai').expect
  , mkcli = require('../../index');

describe('mkcli:', function() {

  it('should run program with valid program instance', function(done) {
    var prg = mkcli.load({options: {}})
      , argv = ['--foo=bar', '-v'];
    mkcli.run(prg, argv, function(err, req) {
      expect(req).to.be.an('object');
      expect(this.foo).to.eql('bar');
      expect(this.v).to.eql(true);
      done();
    }) 
  });

  it('should run program with definition object and runtime', function(done) {
    var def = {
          options: {
            verbose: {
              type: 'flag',
              key: 'verbose',
              names: ['-v', '--verbose']
            },
            foo: {
              type: 'option',
              key: 'foo',
              names: ['-f', '--foo']
            },
            invalid: {
              type: 'unknown'
            }
          } 
        }
      , argv = ['-f=bar', '-v']
      , runtime = {
          hints: def
        };

    mkcli.run(def, argv, runtime, function(err, req) {
      expect(req).to.be.an('object');
      expect(this.foo).to.eql('bar');
      expect(this.verbose).to.eql(true);
      done();
    }) 
  });

  

});
