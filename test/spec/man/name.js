var expect = require('chai').expect
  , fs = require('fs')
  , ast = require('mkast')
  , cli = require('../../../index')
  , utils = require('../../util');

describe('man renderer:', function() {
  
  it('should render program name', function(done) {
    var source = 'test/fixtures/name.md'
      , target = 'target/name-upper.json.log'
      , data = ast.parse('' + fs.readFileSync(source))

    // mock file for correct relative path
    // mkcat normally injects this info
    data.file = source;

    var input = ast.serialize(data)
      , output = fs.createWriteStream(target)
      , opts = {
          input: input,
          output: output,
          type: cli.MAN
        };
    
    cli(opts);

    output.once('finish', function() {
      var result = utils.result(target);
      // check conversion to upper case level one heading
      expect(result[1].firstChild.literal).to.eql('NAME');
      done();
    })
  });

  it('should render program name w/upper disabled', function(done) {
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
          output: output,
          type: cli.MAN,
          upper: false
        };
    
    cli(opts);

    output.once('finish', function() {
      var result = utils.result(target);
      expect(result[1].firstChild.literal).to.eql('Name');
      done();
    })
  });

});
