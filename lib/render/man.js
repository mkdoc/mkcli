var through = require('through3')
  , ast = require('mkast')
  , Node = ast.Node
  , walker = ast.NodeWalker;

/**
 *  Transforms parser state information to nodes that reflect a final man 
 *  page output for the program.
 *
 *  @constructor Man
 *  @param {Object} opts renderer options.
 *
 *  @option {Boolean=true} [upper] convert level one headings to upper case.
 */
function Man(opts) {
  this.upper = opts.upper !== undefined ? opts.upper : true;
}

function transform(chunk, encoding, cb) {
  var i
    , node
    , kids;

  if(chunk.nodes) {
    for(i = 0;i < chunk.nodes.length;i++) {
      node = chunk.nodes[i];
      if(this.upper && Node.is(node, Node.HEADING) && node.level === 1) {
        kids = walker.children(node);
        kids.forEach(function(node) {
          /* istanbul ignore next: tough to mock no literal, softbreak? */
          if(node.literal) {
            node.literal = node.literal.toUpperCase(); 
          } 
        })
      }
      this.push(node); 
    } 
  }else{
    this.push(chunk);
  }
  cb();
}

module.exports = through.transform(transform, {ctor: Man});