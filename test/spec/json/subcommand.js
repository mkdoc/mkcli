var expect = require('chai').expect
  , fs = require('fs')
  , ast = require('mkast')
  , cli = require('../../../index');

describe('json:', function() {
  
  it('should parse subcommand (recursive)', function(done) {
    var source = 'test/fixtures/subcommand.md'
      , target = 'target/subcommand.json.log'
      , data = ast.parse('' + fs.readFileSync(source))

    // mock file for correct relative path
    // mkcat normally injects this info
    data.file = source;

    var input = ast.serialize(data)
      , output = fs.createWriteStream(target)
      , opts = {
          input: input,
          output: output,
          // no need to specify this, it tests a code path
          recursive: true
        };
    
    cli(opts);

    output.once('finish', function() {
      var result = JSON.parse('' + fs.readFileSync(target))
        , cmds = result.commands;

      expect(cmds.list).to.be.an('object');
      expect(cmds.list.type).to.eql('command');
      expect(cmds.list.key).to.eql('list');
      expect(cmds.list.names).to.eql(['ls', 'list']);

      // loaded sub-commands
      expect(cmds.list.commands).to.be.an('object');
      expect(cmds.list.commands.tasks).to.be.an('object');
      expect(cmds.list.commands.notes).to.be.an('object');
      expect(cmds.list.commands.tracks).to.be.an('object');

      // loaded command-specific options
      expect(cmds.list.options).to.be.an('object');
      expect(cmds.list.options.subOption).to.be.an('object');

      done();
    })
  });

});
