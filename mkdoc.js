var mk = require('mktask')
  , fs = require('fs');

// @task actions build the zsh actions list
function actions(cb) {
  // get list of actions
  var map = require('./lib/render/zsh').actions
    , buf = ''
    , stream = fs.createWriteStream('doc/readme/actions.md');

  stream.once('finish', cb);

  // convert to markdown
  for(var k in map) {
    buf += '* ' + k + ': `' + map[k] + '`\n'; 
  }
  buf += '\n';
  stream.end(buf);
}

// @task readme build the readme file
function readme(cb) {
  mk.doc('doc/readme.md')
    .pipe(mk.pi())
    .pipe(mk.ref())
    .pipe(mk.abs())
    .pipe(mk.msg())
    .pipe(mk.toc({depth: 2}))
    .pipe(mk.out())
    .pipe(mk.dest('README.md'))
    .on('finish', cb);
}

mk.task(actions);
mk.task([actions], readme);
