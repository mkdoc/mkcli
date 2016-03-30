var expect = require('chai').expect
  , fs = require('fs')
  , ast = require('mkast')
  , mkcli = require('../../index');

describe('mkcli:', function() {
  
  it('should parse command', function(done) {
    var source = 'test/fixtures/command.md'
      , target = 'target/command.json.log'
      , data = ast.parse('' + fs.readFileSync(source))

    // mock file for correct relative path
    // mkcat normally injects this info
    data.file = source;

    var input = ast.serialize(data)
      , output = fs.createWriteStream(target)
      , opts = {
          input: input,
          output: output
        };
    
    mkcli(opts);

    output.once('finish', function() {
      var result = JSON.parse('' + fs.readFileSync(target))
        , cmds = result.commands;

      expect(cmds.list).to.be.an('object');
      expect(cmds.list.type).to.eql('command');
      expect(cmds.list.key).to.eql('list');
      expect(cmds.list.names).to.eql(['ls', 'list']);

      done();
    })
  });

});
