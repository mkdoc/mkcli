var expect = require('chai').expect
  , fs = require('fs')
  , ast = require('mkast')
  , mkcli = require('../../index');

describe('mkcli:', function() {
  
  it('should parse option w/ required spec (<>)', function(done) {
    var source = 'test/fixtures/required-option.md'
      , target = 'target/required-option.json.log'
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
        , opts = result.options;

      expect(opts.file).to.be.an('object');
      expect(opts.file.type).to.eql('option');
      expect(opts.file.multiple).to.eql(false);
      expect(opts.file.required).to.eql(true);
      expect(opts.file.key).to.eql('file');
      expect(opts.file.names).to.eql(['-f', '--file']);

      done();
    })
  });

});
