var expect = require('chai').expect
  , fs = require('fs')
  , ast = require('mkast')
  , cli = require('../../../index');

describe('help renderer:', function() {
  
  it('should render program name', function(done) {
    var source = 'test/fixtures/name.md'
      , target = 'target/name.txt'
      , data = ast.parse('' + fs.readFileSync(source))

    // mock file for correct relative path
    // mkcat normally injects this info
    data.file = source;

    var input = ast.serialize(data)
      , output = fs.createWriteStream(target)
      , opts = {
          input: input,
          output: output,
          type: cli.HELP,
          header: true,
          footer: true,
          pkg: {
            name: 'foo',
            version: '1.0.0',
            homepage: 'http://example.com'
          }
        };
    
    cli(opts);

    output.once('finish', function() {
      var result = '' + fs.readFileSync(target)
      expect(Boolean(~result.indexOf('Program-Name'))).to.eql(true);
      expect(Boolean(~result.indexOf('foo@1.0.0')))
        .to.eql(true);
      expect(Boolean(~result.indexOf('http://example.com')))
        .to.eql(true);
      done();
    })
  });

});
