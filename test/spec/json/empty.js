var expect = require('chai').expect
  , fs = require('fs')
  , ast = require('mkast')
  , cli = require('../../../index');

describe('json:', function() {
  
  it('should parse empty program', function(done) {
    var source = 'test/fixtures/empty.md'
      , target = 'target/empty.json.log'
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
      expect(result.type).to.eql('program');
      expect(result.name).to.eql(undefined);
      done();
    })
  });

});
