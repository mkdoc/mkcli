/**
 *  Performs formatting of the synopsis strings.
 *
 *  @function synopsis
 *  @param {Object} state synopsis state information.
 */
function synopsis(state, conf) {
  conf = conf || {};
  var literal = state.data.synopsis
    , name = state.name.data.name
    , opts = state.options.data.options
    , info
    , str = ''
    , fre = /(\[|<)?(flags)(\]|>)?/im
    , ore = /(\[|<)?(options)(\]|>)?/im
    , i
    , src;

  for(i = 0;i < literal.length;i++) {
    src = literal[i];

    info = gather(src, opts);

    if(fre.test(src)) {
      src = src.replace(fre, '$1' + flags(info) + '$3');
    }

    if(ore.test(src)) {
      src = src.replace(ore, options(info));
    }

    str += name + ' ' + (conf.wrap ? conf.wrap(src).replace(/^\s+/, '') : src);
  }

  return str;
}

function options(info) {
  var i
    , opt
    , extra
    , list = info.longFlags.concat(info.opts)
    , str = '';

  for(i = 0;i < list.length;i++) {
    opt = list[i];

    if(str) {
      str += ' '; 
    }

    str += '[' + opt.name

    extra = opt.extra;
    if(extra) {
      extra = extra.replace(/\[/, '<');
      extra = extra.replace(/\]/, '>');

      // make this configurable
      extra = extra.toLowerCase();

      str += extra; 
    }
      
    str += ']';
  }

  return str;
}

function flags(info) {
  var i
    , j
    , opt
    , str = '';

  for(i = 0;i < info.flags.length;i++) {
    opt = info.flags[i];
    for(j = 0;j < opt.names.length;j++) {
      // got short single character flag option
      if(/^-.$/.test(opt.names[j])) {
        if(!str) {
          str = '-';
        }
        str += opt.names[j].charAt(1);
        break;
      } 
    }
  }

  return str;
}

/**
 *  Gather options from the list that are not declared in the synopsis into 
 *  lists of flags and options.
 *
 *  @function gather
 *  @param {String} literal the synopsis declaration.
 *  @param {Object} options map of parsed options.
 */
function gather(literal, options) {
  var flags = []
    , longFlags = []
    , opts = []
    , k
    , opt
    , names
    , declared;

  function isDeclared(names) {
    var i
      , ptn
      , exists
      , diff;

    for(i = 0;i < names.length;i++) {
      ptn = new RegExp(names[i] + '[ \\|\\]\\)>]');
      if(ptn.test(literal)) {
        exists = true;
      }else{
        diff = diff || [];
        diff.push(names[i]);
      }
    } 

    return {diff: diff, exists: exists};
  }

  function hasLongFlag(names) {
    var i
      , ptn = /^--./;
    for(i = 0;i < names.length;i++) {
      if(ptn.test(names[i])) {
        return true; 
      }
    } 
    return false;
  }

  function hasShortFlag(names) {
    var i
      , ptn = /^-.$/;
    for(i = 0;i < names.length;i++) {
      if(ptn.test(names[i])) {
        return true; 
      }
    } 
    return false;
  }

  function add(names, opt) {
    if(opt.type === 'flag') {
      if(hasLongFlag(names)) {
        longFlags.push(opt); 
      }

      if(hasShortFlag(names)) {
        flags.push(opt); 
      }
    }else{
      opts.push(opt); 
    }
  }

  for(k in options) {
    opt = options[k];
    names = opt.names;
    declared = isDeclared(names);
    if(!declared.exists) {
      add(names, opt);
    }else if(declared.diff) {
      add(declared.diff, opt);
    }
  }

  return {flags: flags, opts: opts, longFlags: longFlags}
}

module.exports = synopsis;
