var expect = require('chai').expect
  , fs = require('fs')
  , ast = require('mkast')
  , cli = require('../../../index');

describe('help renderer:', function() {
  
  it('should render cmd style', function(done) {
    var source = 'test/fixtures/program.md'
      , target = 'target/program.txt'
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
          style: 'cmd'
        };
    
    cli(opts);

    output.once('finish', function() {
      var result = '' + fs.readFileSync(target)
      expect(Boolean(~result.indexOf('<command>'))).to.eql(true);
      expect(Boolean(~result.indexOf('i, info'))).to.eql(true);
      expect(Boolean(~result.indexOf('list, ls'))).to.eql(true);
      done();
    })
  });

});
