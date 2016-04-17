var through = require('through3')
  , ast = require('mkast')
  , Node = ast.Node
  , walker = ast.NodeWalker
  , states = require('../state').states;

/**
 *  Transforms parser state information to nodes that reflect a final man 
 *  page output for the program.
 *
 *  @constructor Man
 *  @param {Object} opts renderer options.
 *
 *  @option {Boolean=false} [preserve] do not upper case level one headings.
 */
function Man(opts) {
  this.preserve = opts.preserve !== undefined ? opts.preserve : false;
}

function transform(chunk, encoding, cb) {
  var i
    , nodes
    , node;

  if(chunk.nodes) {
    nodes = chunk.nodes;
    if(chunk.type === states.SYNOPSIS) {
      // push the heading
      if(!this.preserve) {
        this.upper(nodes[0]);
      }
      this.push(nodes[0]);

      // use synopsis nodes (don't include zsh completion blocks)
      nodes = chunk.data.synopsis; 
      for(i = 0;i < nodes.length;i++) {
        node = nodes[i];
        this.push(Node.createNode(Node.CODE_BLOCK, {literal: node}));
      }
    }else{
      for(i = 0;i < nodes.length;i++) {
        node = nodes[i];
        if(!this.preserve && Node.is(node, Node.HEADING) && node.level === 1) {
          this.upper(node);
        }
        this.push(node); 
      }
    }
  }else{
    this.push(chunk);
  }
  cb();
}

function upper(node) {
  var kids = walker.children(node);
  kids.forEach(function(node) {
    /* istanbul ignore next: tough to mock no literal, softbreak? */
    if(node.literal) {
      node.literal = node.literal.toUpperCase(); 
    } 
  })
}

Man.prototype.upper = upper;

module.exports = through.transform(transform, {ctor: Man});
