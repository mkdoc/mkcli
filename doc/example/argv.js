var cli = require('../../index')
  // load the compiled program descriptor
  , def = require('./argv.json')
  , pkg = require('../../package.json')
  // create a program with the descriptor information
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

  // target for parsed command line options
  var scope = {}
    // runtime configuration for program execution
    , runtime = {
        // resolve paths relative to this directory
        base: __dirname,
        // pass the scope
        target: scope,
        // give the argument parser some hints
        hints: prg,
        // configure the help plugin to show the help file
        help: {
          file: 'argv.txt'
        },
        // configure the version plugin
        version: {
          name: pkg.name,
          version: pkg.version
        },
        // configure plugins
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
