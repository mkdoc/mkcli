var expect = require('chai').expect
  , optparse = require('../../lib/optparse')
  , format = require('../../lib/format');

describe('format:', function() {

  it('should format flag argument', function(done) {
    var res = optparse('-v, --verbose')
      , str = format(res);
    expect(str).to.eql('-v, --verbose');
    done();
  });

  it('should format option argument', function(done) {
    var res = optparse('-o, --output=[FILE]')
      , str = format(res);
    expect(str).to.eql('-o, --output=[FILE]');
    done();
  });

  it('should format required option argument', function(done) {
    var res = optparse('-o, --output <FILE>')
      , str = format(res);
    expect(str).to.eql('-o, --output=<FILE>');
    done();
  });

  it('should use formatter function', function(done) {
    var res = optparse('-o, --output=[FILE]')
      , str = format(res, format.formatter);
    expect(str).to.eql('-o, --output=[FILE]');
    done();
  });

  it('should format option argument with delimiter and assign', function(done) {
    var res = optparse('-o, --output=[FILE]')
      , str = format(res, {delimiter: ' | ', assign: ' '});
    expect(str).to.eql('-o | --output [FILE]');
    done();
  });

});
