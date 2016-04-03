/**
 *  Convert an argument name to camelcase.
 *
 *  @param str {String} The string to convert.
 */
function camelcase(str) {
  // always strip leading hyphens
  str = str.replace(/^-+/, '');
  var ptn = /-+/
    , parts = str.split(ptn);
  return parts.map(function(p, i) {
    if(i && p) {
      return p.charAt(0).toUpperCase() + p.slice(1);
    }
    return p;
  }).join('');
}

module.exports = camelcase;
