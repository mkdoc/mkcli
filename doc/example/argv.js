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

  // we want to be able to accept arguments
  // for testing purposes but when they are not specified
  // it is ok becuase process.argv is used by default
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
        // configure plugins for program execution
        plugins: [
          require('../../plugin/hints'),
          require('../../plugin/argv'),
          require('../../plugin/help'),
          require('../../plugin/version')
        ]
      };

  // run the program passing the program, raw arguments and the 
  // runtime configuration
  cli.run(prg, argv, runtime, function parsed(err, req) {

    // handle errors and aborted request
    // the request will have been aborted if --help or 
    // the --version option was specified
    if(err || req.aborted) {
      return cb(err); 
    }

    // `this` is the `scope` object passed as the `target`
    // parsed arguments are available using `this`
    // more information is available on the `req` object
    // of particular interest is `req.args` which is the argument
    // parser result object and `req.unparsed` which contains 
    // any unparsed arguments

    // respect the -e, --err option
    if(this.err) {
      return console.error(this); 
    }

    console.log(this);
  })
}

module.exports = main;
