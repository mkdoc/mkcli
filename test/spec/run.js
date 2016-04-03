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
  
  it('should run plugin that calls back with an error', function(done) {
    var argv = []
      , runtime = {
          plugins: [
            function mock(req, cb) {
              return cb(new Error('mock error')); 
            }
          ]
        };

    cli.run({}, argv, runtime, function(err) {
      function fn() {
        throw err;
      }
      expect(fn).throws(/mock error/);
      done();
    }) 
  });
  
  it('should run plugin that throws an error', function(done) {
    var argv = []
      , runtime = {
          plugins: [
            function mock() {
              throw new Error('mock error');
            }
          ]
        };

    cli.run({}, argv, runtime, function(err) {
      function fn() {
        throw err;
      }
      expect(fn).throws(/mock error/);
      done();
    }) 
  });
  
  it('should error with anonymous plugin function', function(done) {
    var argv = []
      , runtime = {
          plugins: [
            function(req, cb) {
              cb();
            }
          ]
        };

    cli.run({}, argv, runtime, function(err) {
      function fn() {
        throw err;
      }
      expect(fn).throws(/may not be anonymous/i);
      done();
    }) 
  });
  
});
