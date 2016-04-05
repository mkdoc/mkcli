var expect = require('chai').expect
  , fs = require('fs')
  , ast = require('mkast')
  , cli = require('../../../index');

describe('parser:', function() {
  
  it('should error with bad name section', function(done) {
    var source = 'test/fixtures/bad-name.md'
      , target = 'target/bad-name.json.log'
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
      expect(fn).throws(/name section must begin with/i);
      done();
    }

    cli(opts, onFinish);
  });

});
