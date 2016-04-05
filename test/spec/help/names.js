var expect = require('chai').expect
  , fs = require('fs')
  , ast = require('mkast')
  , cli = require('../../../index');

describe('help renderer:', function() {
  
  it('should render when multiple program names', function(done) {
    var source = 'test/fixtures/names.md'
      , target = 'target/names.txt'
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
      // verifies not adding a period when terminated with a period
      expect(Boolean(~result.indexOf('Mock description.'))).to.eql(true);
      done();
    })
  });

});
