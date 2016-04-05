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
      , valueCalled = false
      , headerCalled = false
      , footerCalled = false
      , opts = {
          input: input,
          output: output,
          type: cli.HELP,
          style: 'foo',
          align: 'right',
          usage: '',
          value: function() {
            valueCalled = true; 
          },
          header: function() {
            headerCalled = true; 
          },
          footer: function() {
            footerCalled = true; 
          }
        };
    
    cli(opts);

    output.once('finish', function() {

      expect(valueCalled).to.eql(true);
      expect(headerCalled).to.eql(true);
      expect(footerCalled).to.eql(true);

      var result = '' + fs.readFileSync(target)
      expect(Boolean(~result.indexOf('Commands'))).to.eql(true);
      done();
    })
  });

});
