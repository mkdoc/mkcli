var expect = require('chai').expect
  , fs = require('fs')
  , ast = require('mkast')
  , cli = require('../../../index');

describe('help renderer:', function() {
  
  it('should render option w/ value spec ({=stdout})', function(done) {
    var source = 'test/fixtures/option-value.md'
      , target = 'target/option-value.txt'
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
      expect(Boolean(~result.indexOf('(default: stdout)'))).to.eql(true);
      expect(Boolean(~result.indexOf('Default: foo'))).to.eql(true);
      done();
    })
  });

});
