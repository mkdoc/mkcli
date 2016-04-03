var expect = require('chai').expect
  , fs = require('fs')
  , ast = require('mkast')
  , cli = require('../../../index');

describe('help renderer:', function() {
  
  it('should render command', function(done) {
    var source = 'test/fixtures/command.md'
      , target = 'target/command.txt'
      , data = ast.parse('' + fs.readFileSync(source))

    // mock file for correct relative path
    // mkcat normally injects this info
    data.file = source;

    var input = ast.serialize(data)
      , output = fs.createWriteStream(target)
      , called = false
      , opts = {
          input: input,
          output: output,
          type: cli.HELP,
          align: 'right',
          concise: true,
          usage: '',
          footer: function() {
            called = true; 
          }
        };
    
    cli(opts);

    output.once('finish', function() {
      // footer function
      expect(called).to.eql(true);

      var result = '' + fs.readFileSync(target)
      expect(Boolean(~result.indexOf('Commands\n'))).to.eql(true);
      done();
    })
  });

});
