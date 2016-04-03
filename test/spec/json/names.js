var expect = require('chai').expect
  , fs = require('fs')
  , ast = require('mkast')
  , cli = require('../../../index');

describe('json:', function() {
  
  it('should parse multiple program names', function(done) {
    var source = 'test/fixtures/names.md'
      , target = 'target/names.json.log'
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
      var result = JSON.parse('' + fs.readFileSync(target));
      expect(result.name).to.eql('prg');
      expect(result.names).to.eql(['prg', 'prg-alias', 'prg-another-alias']);
      done();
    })
  });

});
