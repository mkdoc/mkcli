var expect = require('chai').expect
  , fs = require('fs')
  , ast = require('mkast')
  , cli = require('../../../index');

describe('cli:', function() {
  
  it('should parse option w/ value spec ({=stdout})', function(done) {
    var source = 'test/fixtures/option-value.md'
      , target = 'target/option-value.json.log'
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
        , opts = result.options;

      expect(opts.output).to.be.an('object');
      expect(opts.output.type).to.eql('option');
      expect(opts.output.kind).to.eql(undefined);
      expect(opts.output.value).to.eql('stdout');
      expect(opts.output.multiple).to.eql(false);
      expect(opts.output.required).to.eql(false);
      expect(opts.output.key).to.eql('output');
      expect(opts.output.names).to.eql(['-o', '--output']);

      done();
    })
  });

});
