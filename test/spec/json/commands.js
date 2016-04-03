var expect = require('chai').expect
  , fs = require('fs')
  , ast = require('mkast')
  , cli = require('../../../index');

describe('json:', function() {
  
  it('should parse multiple commands', function(done) {
    var source = 'test/fixtures/commands.md'
      , target = 'target/commands.json.log'
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
    
    cli(opts);

    output.once('finish', function() {
      var result = JSON.parse('' + fs.readFileSync(target))
        , cmds = result.commands
        , keys = Object.keys(cmds);

      expect(keys.length).to.eql(2);

      expect(cmds.list).to.be.an('object');
      expect(cmds.list.type).to.eql('command');
      expect(cmds.list.key).to.eql('list');
      expect(cmds.list.names).to.eql(['ls', 'list']);

      expect(cmds.info).to.be.an('object');
      expect(cmds.info.type).to.eql('command');
      expect(cmds.info.key).to.eql('info');
      expect(cmds.info.names).to.eql(['i', 'info']);

      done();
    })
  });

});
