var expect = require('chai').expect
  , fs = require('fs')
  , ast = require('mkast')
  , cli = require('../../../index');

describe('help renderer:', function() {
  
  it('should render section', function(done) {
    var source = 'test/fixtures/section.md'
      , target = 'target/section.txt'
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
          newline: true,
          section: [
            /env/i
          ]
        };
    
    cli(opts);

    output.once('finish', function() {
      var result = '' + fs.readFileSync(target)
      expect(Boolean(~result.indexOf('Environment'))).to.eql(true);
      done();
    })
  });

});
