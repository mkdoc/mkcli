/**
 *  For each option given that has the `multiple` flag, if the option value is 
 *  not an array (specified only once) wrap it in an array. If the option is 
 *  `undefined` (not specified) create the empty array.
 *
 *  The argument parser has no knowledge of which options are allowed multiple 
 *  times which means the program implementation may get `undefined`, a string 
 *  literal or an array.
 *
 *  This plugin makes sure the option value is always an array regardless of 
 *  how many times the option was specified.
 *
 *  @function multiple
 *  @param {Object} req plugin request object.
 *  @param {Function} cb callback function.
 */
function multiple(req, cb) {
  var k
    , opt;
  if(req.conf && req.conf.options) {
    for(k in req.conf.options) {
      opt = req.conf.options[k];
      if(opt.multiple) {
        // not specified, create empty array
        if(this[opt.key] === undefined) {
          this[opt.key] = []; 
        // single option specified, wrap in an array
        }else if(this[opt.key] && !Array.isArray(this[opt.key])) {
          this[opt.key] = [this[opt.key]];
        }
      }
    }
  }
  cb();
}

module.exports = multiple;
