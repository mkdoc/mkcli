function argv(req, cb) {
  var parser = req.conf.impl || require('cli-argparse')
    , args
    , conf = req.conf
    , k;

  // respect hints plugin
  for(k in req.hints) {
    conf[k] = req.hints[k];
  }

  args = parser(req.argv, conf);

  for(k in args.flags) {
    this[k] = args.flags[k];
  }

  for(k in args.options) {
    this[k] = args.options[k];
  }

  // give the raw parsed arguments 
  req.args = args;
  // shortcut to the list of unparsed arguments
  req.unparsed = args.unparsed;

  cb();
}

module.exports = argv;
