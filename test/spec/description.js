var expect = require('chai').expect
  , fs = require('fs')
  , ast = require('mkast')
  , mkcli = require('../../index');

describe('mkcli:', function() {
  
  it('should parse program description', function(done) {
    var source = 'test/fixtures/description.md'
      , target = 'target/description.json.log'
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
      var result = JSON.parse('' + fs.readFileSync(target));
      expect(result.name).to.eql('Program Name');
      expect(result.description).to.be.an('array')
        .to.have.length(2);
      done();
    })
  });

});
