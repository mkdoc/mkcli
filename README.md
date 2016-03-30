# Command Line Interface

[![Build Status](https://travis-ci.org/mkdoc/mkcli.svg?v=3)](https://travis-ci.org/mkdoc/mkcli)
[![npm version](http://img.shields.io/npm/v/mkcli.svg?v=3)](https://npmjs.org/package/mkcli)
[![Coverage Status](https://coveralls.io/repos/mkdoc/mkcli/badge.svg?branch=master&service=github&v=3)](https://coveralls.io/github/mkdoc/mkcli?branch=master)

> Define command line interfaces as markdown

Creates a program definition from a markdown document and writes the program definition as JSON.

Generated program definitions may be converted to man pages and help files.

## Install

```
npm i mkcli --save
```

For the command line interface install [mkdoc][] globally (`npm i -g mkdoc`).

---

- [Install](#install)
- [Usage](#usage)
- [Example](#example)
- [Guide](#guide)
   - [Defining Programs](#defining-programs)
     - [Program Name](#program-name)
     - [Program Description](#program-description)
     - [Program Synopsis](#program-synopsis)
     - [Program Options](#program-options)
- [Help](#help)
- [API](#api)
   - [cli](#cli)
     - [Options](#options)
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

## Guide

### Defining Programs

This section covers what you need to know to define a program as markdown, the important rules to remember are:

* The first level one heading sets the program name
* A fenced code block with the info string `synopsis` sets the program synopsis
* A level two heading of `Options` declares the program options
* A level two heading of `Commands` declares the program commands

#### Program Name

The program name is extracted from the first level one heading:

```markdown
# prg
```

Which creates a program named `prg`.

#### Program Description

The program description is created from all block level elements from the first level one heading until the next heading is encountered:

```markdown
# prg

Short description.

An extended description that can include paragraphs, lists, code blocks and other block level elements.
```

#### Program Synopsis

A program synopsis can be specified with a fenced code block that uses the info string `synopsis`:

```
```synopsis
[options] [file...]
```
```

#### Program Options

Program options are declared with a level two heading matching `Options` and a list following the heading:

```markdown
# prg

## Options

* `-i, --input [FILE...]` Input files
* `-o, --output [FILE]` Output file
```

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

