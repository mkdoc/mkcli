var expect = require('chai').expect
  , cli = require('../../index');

describe('run:', function() {

  it('should run program with valid program instance', function(done) {
    var prg = cli.load({options: {}})
      , argv = ['--foo=bar', '-v'];
    cli.run(prg, argv, function(err, req) {
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

    cli.run(def, argv, runtime, function(err, req) {
      expect(req).to.be.an('object');
      expect(this.foo).to.eql('bar');
      expect(this.verbose).to.eql(true);
      done();
    }) 
  });

  it('should run program with plugins array', function(done) {
    var argv = ['-foo=bar', '-v']
      , runtime = {
          plugins: [
            require('../../plugin/argv')
          ]
        };

    cli.run({}, argv, runtime, function(err, req) {
      expect(req).to.be.an('object');
      expect(this.foo).to.eql('bar');
      expect(this.v).to.eql(true);
      done();
    }) 
  });
  
});
