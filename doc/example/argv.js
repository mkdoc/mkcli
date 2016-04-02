var cli = require('../../index')
  , def = require('./argv.json')
  , pkg = require('../../package.json')
  , prg = cli.load(def);

/**
 *  @name argv
 *  @cli doc/example/argv.md
 */
function main(argv, cb) {

  if(typeof argv === 'function') {
    cb = argv;
    argv = null;
  }

  var scope = {}
    , runtime = {
        base: __dirname,
        target: scope,
        hints: prg,
        help: {
          file: 'argv.txt'
        },
        version: {
          name: pkg.name,
          version: pkg.version
        },
        plugins: [
          require('../../plugin/hints'),
          require('../../plugin/argv'),
          require('../../plugin/help'),
          require('../../plugin/version')
        ]
      };

  cli.run(prg, argv, runtime, function parsed(err, req) {
    if(err || req.aborted) {
      return cb(err); 
    }

    // respect the -e, --err option
    if(this.err) {
      return console.error(this); 
    }

    console.log(this);
  })
}

module.exports = main;
