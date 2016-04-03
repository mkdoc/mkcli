var expect = require('chai').expect
  , fs = require('fs')
  , ast = require('mkast')
  , cli = require('../../../index');

describe('cli:', function() {
  
  it('should render option help', function(done) {
    var source = 'test/fixtures/option.md'
      , target = 'target/option.txt'
      , data = ast.parse('' + fs.readFileSync(source))

    // mock file for correct relative path
    // mkcat normally injects this info
    data.file = source;

    var input = ast.serialize(data)
      , output = fs.createWriteStream(target)
      , opts = {
          input: input,
          output: output,
          type: cli.HELP
        };
    
    cli(opts);

    output.once('finish', function() {
      var result = '' + fs.readFileSync(target)
      expect(Boolean(~result.indexOf('-f, --file'))).to.eql(true);
      done();
    })
  });

});
