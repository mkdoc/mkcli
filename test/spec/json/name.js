var expect = require('chai').expect
  , fs = require('fs')
  , ast = require('mkast')
  , cli = require('../../../index');

describe('json:', function() {
  
  it('should parse program name', function(done) {
    var source = 'test/fixtures/name.md'
      , target = 'target/name.json.log'
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
      expect(result.name).to.eql('Program Name');
      done();
    })
  });

  it('should parse program name w/ callback', function(done) {
    var source = 'test/fixtures/name.md'
      , target = 'target/name.json.log'
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
    
    function onFinish() {
      var result = JSON.parse('' + fs.readFileSync(target));
      expect(result.name).to.eql('Program Name');
      done();
    }

    cli(opts, onFinish);
  });

});
