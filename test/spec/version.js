var fs = require('fs')
  , expect = require('chai').expect
  , cli = require('../../index')
  , version = require('../../plugin/version');

describe('version plugin:', function() {

  var target = 'target/mock-version.txt'
    , def = {
        options: {
          version: {
            type: 'flag',
            key: 'version',
            names: ['--version']
          }
        } 
      }
    , runtime = {
        version: {
          name: 'mock',
          version: '1.0.0',
          output: fs.createWriteStream(target)
        },
        plugins: [
          require('../../plugin/argv'),
          version
        ]
      };

  it('should print version info with --version', function(done) {
    var argv = ['--version'];

    cli.run(def, argv, runtime, function(err, req) {
      expect(req).to.be.an('object');
      expect(this.version).to.eql(true);
      var res = '' + fs.readFileSync(target);
      expect(res).to.eql('mock 1.0.0\n');
      done();
    }) 
  });

  it('should print version number without name', function(done) {
    var argv = ['--version'];

    runtime.version.output = fs.createWriteStream(target);

    delete runtime.version.name;

    cli.run(def, argv, runtime, function(err, req) {
      expect(req).to.be.an('object');
      expect(this.version).to.eql(true);
      var res = '' + fs.readFileSync(target);
      expect(res).to.eql('1.0.0\n');
      done();
    }) 
  });

  it('should print newline without name and version', function(done) {
    var argv = ['--version'];

    runtime.version.output = fs.createWriteStream(target);

    delete runtime.version.version;

    cli.run(def, argv, runtime, function(err, req) {
      expect(req).to.be.an('object');
      expect(this.version).to.eql(true);
      var res = '' + fs.readFileSync(target);
      expect(res).to.eql('\n');
      done();
    }) 
  });

  it('should print message literal when available', function(done) {
    var argv = ['--version'];

    runtime.version.output = fs.createWriteStream(target);

    runtime.version.literal = 'mock 1.0.0';

    cli.run(def, argv, runtime, function(err, req) {
      expect(req).to.be.an('object');
      expect(this.version).to.eql(true);
      var res = '' + fs.readFileSync(target);
      expect(res).to.eql('mock 1.0.0\n');
      done();
    }) 
  });


  it('should callback without --version', function(done) {
    var argv = [];

    cli.run(def, argv, runtime, function(err, req) {
      expect(req).to.be.an('object');
      expect(this.version).to.eql(undefined);
      done();
    }) 
  });

});
