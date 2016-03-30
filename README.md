# Command Line Interface

[![Build Status](https://travis-ci.org/mkdoc/mkcli.svg?v=3)](https://travis-ci.org/mkdoc/mkcli)
[![npm version](http://img.shields.io/npm/v/mkcli.svg?v=3)](https://npmjs.org/package/mkcli)
[![Coverage Status](https://coveralls.io/repos/mkdoc/mkcli/badge.svg?branch=master&service=github&v=3)](https://coveralls.io/github/mkdoc/mkcli?branch=master)

> Define command line interfaces as markdown

Creates a program definition from a markdown document and enables writing the program definition as JSON or javascript as well as creating man pages and help files for the program.

## Install

```
npm i mkcli --save
```

For the command line interface install [mkdoc][] globally (`npm i -g mkdoc`).

---

- [Install](#install)
- [Usage](#usage)
- [Example](#example)
- [Help](#help)
- [API](#api)
   - [cli](#cli)
- [License](#license)

---

## Usage

Create a stream and write the program description:

```javascript
var cli = require('mkcli')
  , ast = require('mkast');

ast.src('# Program\n\n```synopsis\n[options]\n```')
  .pipe(cli())
  .pipe(ast.stringify({indent: 2}))
  .pipe(process.stdout);
```

## Example

## Help

```
mkcli [options]

Markdown command line interface definition.

  -h, --help  Display this help and exit
  --version   Print the version and exit

Report bugs to https://github.com/mkdoc/mkcli/issues
```

## API

### cli

```javascript
cli([opts][, cb])
```

Creates documentation for command line interfaces.

Returns an output stream.

* `opts` Object processing options.
* `cb` Function callback function.

#### Options

* `input` Readable input stream.
* `output` Writable output stream.

## License

MIT

---

Created by [mkdoc](https://github.com/mkdoc/mkdoc) on March 30, 2016

[mkdoc]: https://github.com/mkdoc/mkdoc
[mkast]: https://github.com/mkdoc/mkast
[through]: https://github.com/tmpfs/through3
[commonmark]: http://commonmark.org
[jshint]: http://jshint.com
[jscs]: http://jscs.info

