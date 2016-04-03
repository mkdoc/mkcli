var expect = require('chai').expect
  , fs = require('fs')
  , ast = require('mkast')
  , cli = require('../../../index');

describe('cli:', function() {
  
  it('should parse option w/ type spec ({Number})', function(done) {
    var source = 'test/fixtures/option-type.md'
      , target = 'target/option-type.json.log'
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

      expect(opts.indent).to.be.an('object');
      expect(opts.indent.type).to.eql('option');
      expect(opts.indent.kind).to.eql('Number');
      expect(opts.indent.multiple).to.eql(false);
      expect(opts.indent.required).to.eql(false);
      expect(opts.indent.key).to.eql('indent');
      expect(opts.indent.names).to.eql(['-i', '--indent']);

      done();
    })
  });

});
