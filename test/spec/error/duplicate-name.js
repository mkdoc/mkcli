var expect = require('chai').expect
  , fs = require('fs')
  , ast = require('mkast')
  , cli = require('../../../index');

describe('parser:', function() {
  
  it('should error with duplicate name', function(done) {
    var source = 'test/fixtures/duplicate-name.md'
      , target = 'target/duplicate-name.json.log'
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
    
    function onFinish(err) {
      function fn() {
        throw err;
      }
      expect(fn).throws(/duplicate options name detected/i);
      done();
    }

    cli(opts, onFinish);
  });

});
