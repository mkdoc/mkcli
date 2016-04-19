var through = require('through3')
  , ast = require('mkast')
  , Node = ast.Node
  , walker = ast.NodeWalker
  , wordwrap = require('wordwrap')
  , states = require('../state').states
  , synopsis = require('../synopsis')

/**
 *  Transforms parser state information to nodes that reflect a final man 
 *  page output for the program.
 *
 *  @constructor Man
 *  @param {Object} opts renderer options.
 *
 *  @option {Boolean=false} [preserve] do not upper case level one headings.
 *  @option {Number=80} [cols] column to wrap synopsis.
 */
function Man(opts) {
  this.preserve = opts.preserve !== undefined ? opts.preserve : false;
  this.cols = opts.cols || 80;
}

function transform(chunk, encoding, cb) {
  var i
    , nodes
    , node
    , para = Node.createNode(Node.PARAGRAPH)
    , text
    , wrap;

  if(chunk.nodes) {
    nodes = chunk.nodes;
    if(chunk.type === states.SYNOPSIS) {
      // push the heading
      if(!this.preserve) {
        this.upper(nodes[0]);
      }
      this.push(nodes[0]);

      wrap = wordwrap(
        chunk.name.data.name.length + 1, this.cols);

      // perform synopsis expansion
      if(chunk.options) {
        text = Node.createNode(
          Node.TEXT, {literal: synopsis(chunk, {wrap: wrap})});
        para.appendChild(text);

        console.error(text);

        this.push(para);
      // raw synopsis - no expansion
      }else{
        // use synopsis nodes (don't include zsh completion blocks)
        nodes = chunk.data.synopsis; 
        for(i = 0;i < nodes.length;i++) {
          node = chunk.name.data.name + ' ' + nodes[i];
          para = Node.createNode(Node.PARAGRAPH);
          text = Node.createNode(Node.TEXT, {literal: node});
          para.appendChild(text);
          this.push(para);
        }
      }
    }else if(chunk.type === states.OPTIONS) {
      this.options(chunk);
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

function options(state) {
  var nodes = state.nodes
    , i
    , j
    , list
    , item
    , para
    , opt;

  // push the heading
  if(!this.preserve) {
    this.upper(nodes[0]);
  }
  this.push(nodes[0]); 

  // push the rewritten nodes on to the stream
  for(i = 1;i < nodes.length;i++) {
    list = nodes[i];
    if(!(list instanceof Node)) {
      list = Node.deserialize(nodes[i]);
    }
    j = 0;
    item = list.firstChild;
    while(item) {

      para = item.firstChild;

      // get parsed option declaration
      opt = nodes[i].options.list[j];

      // NOTE: must rewrite the literal - do not remove the node!
      para.firstChild.literal = opt.names.join(', ');

      if(opt.extra) {
        var extra = Node.createNode(Node.EMPH)
          , ptn = /^([^\w]+)(\w+)([^\w].*)$/;

        if(!ptn.test(opt.extra)) {
          para.firstChild.insertAfter(
            Node.createNode(Node.TEXT, {literal: opt.extra}));

          para.firstChild.next.insertAfter(Node.createNode(Node.LINEBREAK))
        }else{

          para.firstChild.insertAfter(Node.createNode(Node.SOFTBREAK));

          // final plain text part
          para.firstChild.insertAfter(
            Node.createNode(
              Node.TEXT, {literal: opt.extra.replace(ptn, '$3')}));

          // add emphasis - underline FILE etc
          extra.appendChild(
            Node.createNode(
              Node.TEXT,
              {literal: opt.extra.replace(ptn, '$2')}
            )
          )

          para.firstChild.insertAfter(extra);

          // initial plain text part
          para.firstChild.insertAfter(
            Node.createNode(
              Node.TEXT, {literal: opt.extra.replace(ptn, '$1')}));
        }
      }else{
        para.firstChild.insertAfter(Node.createNode(Node.SOFTBREAK));
      }

      item = item.next; 
      j++;
    }

    this.push(list);
  }
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

Man.prototype.options = options;
Man.prototype.upper = upper;

module.exports = through.transform(transform, {ctor: Man});
