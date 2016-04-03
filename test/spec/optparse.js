var expect = require('chai').expect
  , Argument = require('../../lib/argument')
  , optparse = require('../../lib/optparse');

describe('optparse:', function() {

  it('should error with no names', function(done) {
    function fn() {
      optparse('');
    }
    expect(fn).throws(/has no names/i);
    done();
  });
  
  it('should parse flag', function(done) {
    var res = optparse('-v, --verbose');
    expect(res.type).to.eql(Argument.FLAG);
    expect(res.key).to.eql('verbose');
    expect(res.names).to.eql(['-v', '--verbose']);
    done();
  });

  it('should parse flag with explicit key', function(done) {
    var res = optparse('more: -v, --verbose');
    expect(res.type).to.eql(Argument.FLAG);
    expect(res.key).to.eql('more');
    expect(res.names).to.eql(['-v', '--verbose']);
    done();
  });

  it('should parse option', function(done) {
    var res = optparse('-f, --file=[FILE]');
    expect(res.type).to.eql(Argument.OPTION);
    expect(res.key).to.eql('file');
    expect(res.names).to.eql(['-f', '--file']);
    done();
  });

  it('should parse option with explicit key', function(done) {
    var res = optparse('path: -f, --file=[FILE]');
    expect(res.type).to.eql(Argument.OPTION);
    expect(res.key).to.eql('path');
    expect(res.names).to.eql(['-f', '--file']);
    done();
  });

  it('should parse long option with hyphen', function(done) {
    var res = optparse('--file-path=[FILE]');
    expect(res.type).to.eql(Argument.OPTION);
    expect(res.key).to.eql('filePath');
    expect(res.names).to.eql(['--file-path']);
    done();
  });

  it('should parse long option with hyphen and camelcase disabled',
    function(done) {
      var res = optparse('--file-path=[FILE]', {camelcase: false});
      expect(res.type).to.eql(Argument.OPTION);
      expect(res.key).to.eql('--file-path');
      expect(res.names).to.eql(['--file-path']);
      done();
    }
  );

});
