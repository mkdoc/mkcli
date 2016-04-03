var expect = require('chai').expect
  , fs = require('fs')
  , ast = require('mkast')
  , cli = require('../../index');

describe('cli:', function() {
  
  it('should parse program synopsis', function(done) {
    var source = 'test/fixtures/synopsis.md'
      , target = 'target/synopsis.json.log'
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
      expect(result.synopsis).to.eql('[options]');
      done();
    })
  });

});
