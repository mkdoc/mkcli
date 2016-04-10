var expect = require('chai').expect
  , fs = require('fs')
  , ast = require('mkast')
  , utils = require('../../util')
  , cli = require('../../../index');

describe('help renderer:', function() {
  
  it('should render empty definition', function(done) {
    var source = 'test/fixtures/empty.md'
      , target = 'target/empty.txt'
      , data = ast.parse('' + fs.readFileSync(source))

    // mock file for correct relative path
    // mkcat normally injects this info
    data.file = source;

    var input = ast.serialize(data)
      , output = fs.createWriteStream(target)
      , opts = {
          input: input,
          output: output,
          type: cli.HELP
        };
    
    cli(opts);

    output.once('finish', function() {
      var result = utils.result(target)
      expect(result).to.be.an('array');
      expect(result[0].type).to.eql('document');
      expect(result[1].type).to.eql('name');
      expect(result[2].type).to.eql('synopsis');
      expect(result[3].type).to.eql('description');
      expect(result[4].type).to.eql('commands');
      expect(result[5].type).to.eql('options');
      expect(result[6].type).to.eql('eof');
      done();
    })
  });

});
