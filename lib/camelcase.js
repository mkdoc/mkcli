/**
 *  Convert an argument name to camelcase.
 *
 *  @param str {String} The string to convert.
 *  @param ptn {String|RegExp} The pattern to split on.
 */
function camelcase(str, ptn) {
  ptn = (ptn instanceof RegExp) || typeof(ptn) === 'string' ? ptn : /-+/;
  // always strip leading hyphens
  str = str.replace(/^-+/, '');
  var parts = str.split(ptn);
  return parts.map(function(p, i) {
    if(i && p) {
      return p.charAt(0).toUpperCase() + p.slice(1);
    }
    return p;
  }).join('');
}

module.exports = camelcase;
