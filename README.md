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
    - [Commands](#commands)
    - [Identifiers](#identifiers)
    - [Manual Sections](#manual-sections)
- [Help](#help)
- [API](#api)
  - [src](#src)
  - [dest](#dest)
  - [load](#load)
- [License](#license)

---

## Usage

First define a [program as markdown](https://github.com/mkdoc/mkcli/blob/master/doc/example/argv.md) and compile the [program descriptor](https://github.com/mkdoc/mkcli/blob/master/doc/example/argv.json):

```shell
mkcat argv.md | mkcli > argv.json
```

Then create a [help file](https://github.com/mkdoc/mkcli/blob/master/doc/example/argv.txt):

```shell
mkcat argv.md | mkcli -t help > argv.txt
```

Write [a program](https://github.com/mkdoc/mkcli/blob/master/doc/example/argv.js) that can be executed and easily tested; then add [a minimal executable](https://github.com/mkdoc/mkcli/blob/master/doc/example/argv).

## Example

Compile a program definition:

```shell
mkcat argv.md | mkcli > argv.json
```

Create a help file:

```shell
mkcat argv.md | mkcli -t help > argv.txt
```

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

The parsed option will have the `required` flag set.

To signify that an option argument is repeatable include an ellipsis:

```markdown
* `-i, --input [FILE...]` Input files
```

The parsed option will have the `multiple` flag set.

You can associate some type information with the `{}` notation:

```markdown
* `-i, --indent [NUM] {Number} Amount of indentation
```

The parsed option will have the `kind` property set to `Number`.

To specify a default value for the option use the `=` operator in the type:

```markdown
* `-i, --indent [NUM] {Number=2} Amount of indentation
```

The parsed option will have the `kind` property set to `Number` and the  `value` property set to `2`.

You can just specify the default value using:

```markdown
* `-i, --indent [NUM] {=2} Amount of indentation
```

In which case the `kind` property will be `undefined` and the  `value` property is set to `2`.

#### Commands

Commands are declared in the same way as program arguments but under the `Commands` heading:

```markdown
# prg

## Commands

* `ls, list` List tasks
* `i, info` Print task information
```

They allow you to create complex programs with options specific to a command.

#### Identifiers

When a program is created from a source markdown document each argument and command is given a key for the resulting map. This key is generated automcatically by using the longest argument (or command) name and converting it to camel case.

If you wish to use a fixed key you can add an identifier followed by a colon (`:`) to the beginning of the specification:

```markdown
# prg

## Options

* `verbose: -v` Print more information

## Commands

* `tasks: ls, list` List tasks
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

  -p, --package=[FILE]    Use package descriptor
  -t, --type=[TYPE]       Output renderer type
  -h, --help              Display help and exit
  --version               Print the version and exit

Report bugs to https://github.com/mkdoc/mkcli/issues
```

## API

### src

```javascript
src([opts])
```

Gets a source parser stream that transforms the incoming tree nodes into
a program definition.

Returns a parser stream.

* `opts` Object parser options.

### dest

```javascript
dest([opts])
```

Gets a destination renderer stream.

When no type is specified the JSON renderer is assumed.

Returns a renderer stream of the specified type.

* `opts` Object renderer options.

### load

```javascript
load(def[, opts])
```

Load a program definition into a new program assigning the definition
properties to the program.

Returns a new program.

* `def` Object the program definition.
* `opts` Object program options.

## License

MIT

---

Created by [mkdoc](https://github.com/mkdoc/mkdoc) on April 3, 2016

[mkdoc]: https://github.com/mkdoc/mkdoc
[mkast]: https://github.com/mkdoc/mkast
[through]: https://github.com/tmpfs/through3
[commonmark]: http://commonmark.org
[jshint]: http://jshint.com
[jscs]: http://jscs.info

