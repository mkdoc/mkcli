var fs = require('fs')
  , expect = require('chai').expect
  , cli = require('../../../index')
  , help = require('../../../plugin/help');

describe('help plugin:', function() {

  var source = 'test/fixtures/mock.txt'
    , target = 'target/mock-help.txt'
    , def = {
        options: {
          help: {
            type: 'flag',
            key: 'help',
            names: ['--help']
          }
        } 
      }
    , runtime = {
        base: __dirname + '/../../..',
        help: {
          file: source,
          output: fs.createWriteStream(target)
        },
        plugins: [
          require('../../../plugin/argv'),
          help
        ]
      };

  it('should print help file with --help', function(done) {
    var argv = ['--help'];

    cli.run(def, argv, runtime, function(err, req) {
      expect(req).to.be.an('object');
      expect(this.help).to.eql(true);
      var res = '' + fs.readFileSync(target);
      expect(res).to.eql('' + fs.readFileSync(source));
      done();
    }) 
  });

  it('should callback with no --help option', function(done) {
    var argv = ['--foo=bar'];
    cli.run(def, argv, runtime, function(err, req) {
      expect(req).to.be.an('object');
      expect(this.foo).to.eql('bar');
      done();
    });
  });

  it('should use print() helper method', function(done) {
    runtime.help.output = fs.createWriteStream(target);

    help.print(
      runtime.help.file,
      {runtime: runtime, conf: runtime.help},
      function() {
        var res = '' + fs.readFileSync(target);
        expect(res).to.eql('' + fs.readFileSync(source));
        done();                                                    
      });
  });

  it('should use print() helper method without base path', function(done) {

    delete runtime.base;

    runtime.help.output = fs.createWriteStream(target);

    help.print(
      __dirname + '/../../../' + source,
      {runtime: runtime, conf: runtime.help},
      function() {
        var res = '' + fs.readFileSync(target);
        expect(res).to.eql('' + fs.readFileSync(source));
        done();                                                    
      });
  });


  it('should use print() helper method without callback', function(done) {
    runtime.help.output = fs.createWriteStream(target);

    help.print(
      runtime.help.file,
      {runtime: runtime, conf: runtime.help});
    done();
  });
});
