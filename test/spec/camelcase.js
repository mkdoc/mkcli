var expect = require('chai').expect
  , cli = require('../../index');

describe('cli:', function() {
  
  it('should convert option to camelcase', function(done) {
    expect(cli.camelcase('--file--path')).to.eql('filePath');
    done();
  });

});
