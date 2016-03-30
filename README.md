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
     - [Name](#name)
     - [Description](#description)
     - [Synopsis](#synopsis)
     - [Arguments](#arguments)
       - [Flags](#flags)
       - [Options](#options)
     - [Manual Sections](#manual-sections)
- [Help](#help)
- [API](#api)
   - [cli](#cli)
     - [Options](#options-1)
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

#### Name

The program name is extracted from the first level one heading:

```markdown
# prg
```

Which creates a program named `prg`.

#### Description

The program description is created from all block level elements from the first level one heading until the next heading is encountered:

```markdown
# prg

Short description.

An extended description that can include paragraphs, lists, code blocks and other block level elements.
```

#### Synopsis

A program synopsis can be specified with a fenced code block that uses the info string `synopsis`.

    ```synopsis
    [options] [file...]
    ```
    

#### Arguments

Program arguments are declared with a level two heading matching `Options` and a list following the heading:

```markdown
# prg

## Options

* `-i, --input [FILE...]` Input files
* `-o, --output [FILE]` Output file
```

An argument is declared as a list item whose first child is an inline code element which defines a *specification*.

The specification is parsed into an object representing the argument which may be of type `flag`, `option` or `command`.

The remaining list item content after the specification is treated as a short description for the argument.

##### Flags

An argument specification with no value is treated as a flag option:

```markdown
* `-v, --verbose` Print more information
```

##### Options

To create an option argument specify a value in either `[]` or `<>`:

```markdown
* `-o, --output [FILE]` Output file
```

When the `<>` notation is used it indicates that that the option is required:

```markdown
* `-t, --type <TYPE>` Output format
```

#### Manual Sections

A level two heading that does not begin an options or commands list is treated as a section for man page output:

```markdown
# prg

## Environment

The environment variable FOO changes the behaviour to `bar`.
```

The section ends when the next heading is encountered.

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

