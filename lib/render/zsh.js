var through = require('through3')
  , EOL = require('os').EOL;

/**
 *  Render a program definition as a zsh completion file.
 *
 *  @constructor Zsh
 *  @param {Object} opts renderer options.
 */
function Zsh(opts) {
  this.indent = opts.indent || '  ';
}

function transform(chunk, encoding, cb) {
  this.render(chunk, cb);
}

function render(chunk, cb) {
  var isSimple = chunk.options && !chunk.commands
    , compdef = '#compdef ' + chunk.name + EOL
    , args = '_arguments \\' + EOL
    , indent = this.indent
    , buf = '';

  //function isLong(names) {
    //for(var i = 0;i < names.length;i++) {
      //if(!/^--/.test(names[i])) {
        //return false;
      //} 
    //}
    //return true;
  //}
  //
  function getOptName(names) {
    if(names.length === 1) {
      return names[0];
    }

    for(var i = 0;i < names.length;i++) {
      if(/^--/.test(names[i])) {
        return names[i];
      } 
    }

    return names[i-1];
  }

  function getOptionSpec(options) {
    var k
      , opt
      //, makeLong
      , inline = ''
      , opts = '';
    for(k in options) {
      inline = '';
      opt = options[k];
      opts += indent;
      opts += '"(' + opt.names.join(' ') + ')"';
      //if(opt.type === 'flag') {
        opts += '{' + opt.names.join(',')
          + (opt.type === 'option' ? '=' : '') + '}';
      //}
      //makeLong = isLong(opt.names);
      //if(!isLong) {
        //opts += '{' + opt.names.join(',') + '}'
      //}else if(isLong && opt.type === 'flag') {
        //inline = opt.names.join(',');
      //}else if(isLong) {
        //inline = opt.names.join(',') + '=-';
      //}
      //if(opt.type === 'option') {
        //inline =  getOptName(opt.names) + '=';
      //}
      opts += '"' + inline + '[' + opt.description + ']';
      if(opt.extra) {
        if(/\[file/i.test(opt.extra)) {
          opts += ':file:_files';
        }else if(/\[dir/i.test(opt.extra)) {
          opts += ':directory:_directories';
        }
      }
      opts += '" \\' + EOL;
    }
    //opts += '"*:: :->args" \\' + EOL
    opts += indent + '&& return 0;' + EOL;
    return opts;
  }

  if(isSimple) {
    buf += compdef;
    buf += args; 
    buf += getOptionSpec(chunk.options);
  }

  this.push(buf);

  cb();
}

Zsh.prototype.render = render;

module.exports = through.transform(transform, {ctor: Zsh});
