# Command Line Interface

[![Build Status](https://travis-ci.org/mkdoc/mkcli.svg?v=3)](https://travis-ci.org/mkdoc/mkcli)
[![npm version](http://img.shields.io/npm/v/mkcli.svg?v=3)](https://npmjs.org/package/mkcli)
[![Coverage Status](https://coveralls.io/repos/mkdoc/mkcli/badge.svg?branch=master&service=github&v=3)](https://coveralls.io/github/mkdoc/mkcli?branch=master)

> Define command line interfaces as markdown

Compiles a markdown program definition to a JSON program descriptor.

Program definitions may be converted to man pages and help files.

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
        - [Required](#required)
        - [Multiple](#multiple)
        - [Type Info](#type-info)
        - [Default Value](#default-value)
    - [Commands](#commands)
    - [Identifiers](#identifiers)
    - [Manual Sections](#manual-sections)
- [Help](#help)
- [API](#api)
  - [src](#src)
  - [compile](#compile)
  - [dest](#dest)
    - [Options](#options-1)
  - [load](#load)
  - [run](#run)
- [License](#license)

---

## Usage

First define a [program as markdown](https://github.com/mkdoc/mkcli/blob/master/doc/example/argv.md) and compile the [program descriptor](https://github.com/mkdoc/mkcli/blob/master/doc/example/argv.json):

```shell
mkcat argv.md | mkcli > argv.json
```

Then create a [help file](https://github.com/mkdoc/mkcli/blob/master/doc/example/argv.txt) and a [man page](https://github.com/mkdoc/mkcli/blob/master/doc/example/argv.1):

```shell
mkcat argv.md | mkcli -t help | mktext > argv.txt
mkcat argv.md | mkcli -t man | mkman --title argv > argv.1
```

Write [a program](https://github.com/mkdoc/mkcli/blob/master/doc/example/argv.js) that can be executed and easily tested and add [a minimal executable](https://github.com/mkdoc/mkcli/blob/master/doc/example/argv).

## Example

Compile a program definition:

```shell
mkcat argv.md | mkcli > argv.json
```

Create a help text file:

```shell
mkcat argv.md | mkcli -t help | mktext > argv.txt
```

Create a man page:

```shell
mkcat argv.md | mkcli -t man | mkman > argv.1
```

## Guide

### Defining Programs

This section covers what you need to know to define a program as markdown.

#### Name

Like man pages the *Name* section is required and it **must** include a brief summary of the program after the program name. Delimit the program name from the short summary using a hyphen surrounded by spaces as shown below.

The program name and summary is extracted from the first paragraph under the *Name* heading:

```markdown
# Name

prg - short program description
```

Add a list when a program can have multiple names:

```markdown
# Name

prg - short program description

+ prg-alias
```

#### Description

The program description is created from all block level elements under the *Description* heading:

```markdown
# Name

prg - short program description

# Description

An extended description that can include paragraphs, lists, code blocks and other block level elements.
```

#### Synopsis

The program synopsis is created from all code block elements under the *Synopsis* heading:

    ```
    [options] [file...]
    ```
    

#### Arguments

Program arguments are declared with a heading of *Options* and a list following the heading:

```markdown
# Name

prg - short program description

# Options

* `-i, --input [FILE...]` Input files
* `-o, --output [FILE]` Output file
```

An argument is declared as a list item whose first child is an inline code element which defines a *specification*.

The specification is parsed into an object representing the argument which may be of type `flag`, `option` or `command`.

The remaining list item content after the specification is treated as a description for the argument.

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

###### Required

When the `<>` notation is used it indicates that that the option is required:

```markdown
* `-t, --type <TYPE>` Output format
```

The parsed option will have the `required` flag set.

###### Multiple

To signify that an option argument is repeatable include an ellipsis:

```markdown
* `-i, --input [FILE...]` Input files
```

The parsed option will have the `multiple` flag set.

###### Type Info

You can associate some type information with the `{}` notation:

```markdown
* `-i, --indent [NUM] {Number}` Amount of indentation
```

The parsed option will have the `kind` property set to `Number`.

You can delimit multiple types with `|` and `kind` is expanded to an array. This is useful to indicate an argument may be of multiple types or if you want to treat an argument value as an enum:

```markdown
* `-t, --type [VAL] {json|help|man}` Renderer type
```

###### Default Value

To specify a default value for the option use the `=` operator in the type:

```markdown
* `-i, --indent [NUM] {Number=2}` Amount of indentation
```

The parsed option will have the `kind` property set to `Number` and the  `value` property set to `2`.

You can just specify the default value using:

```markdown
* `-i, --indent [NUM] {=2}` Amount of indentation
```

In which case the `kind` property will be `undefined` and the  `value` property is set to `2`.

#### Commands

Commands are declared in the same way as program arguments but under the `Commands` heading:

```markdown
# Name

prg - short program description

# Commands

* `ls, list` List tasks
* `i, info` Print task information
```

They allow you to create complex programs with options specific to a command.

#### Identifiers

When a program is created from a source markdown document each argument and command is given a key for the resulting map. This key is generated automcatically by using the longest argument (or command) name and converting it to camel case.

If you wish to use a fixed key you can add an identifier followed by a colon (`:`) to the beginning of the specification:

```markdown
# Name

prg - short program description

# Commands

* `tasks: ls, list` List tasks

# Options

* `verbose: -v` Print more information
```

#### Manual Sections

A heading that is not matched by any of the rules above is a treated as a manual section:

```markdown
# Name

prg - short program description

# Environment

The environment variable FOO changes the behaviour to `bar`.
```

The section ends when the next level one heading is encountered or the end of the file is reached.

## Help

```
Usage: mkcli [options]

  Compiles markdown command line interface definitions to JSON and supplies
  renderers for converting the definitions to help files and man pages.

Options
  -p, --package=[FILE]    Use package descriptor
  -t, --type=[TYPE]       Output renderer type
  -c, --cols=[NUM]        Wrap help output at NUM (default: 80)
  -s, --split=[NUM]       Split help columns at NUM (default: 26)
  -i, --indent=[NUM]      Number of spaces for help indentation (default: 2)
  -a, --align=[TYPE]      Align first help column left or right (default: left)
  -u, --usage=[VAL]       Set usage message for help synopsis (default: Usage:)
  -S, --section=[PTN...]  Include sections matching patterns in help output
  -H, --header            Include default header in help output
  -F, --footer            Include default footer in help output
  -N, --newline           Print leading newline when no header
  -P, --preserve          Do not upper case headings in man output
  -h, --help              Display help and exit
  --version               Print the version and exit

mkcli@1.0.14 https://github.com/mkdoc/mkcli
```

## API

### src

```javascript
src([opts])
```

Gets a source parser stream that transforms the incoming tree nodes into
a state information.

Returns a parser stream.

* `opts` Object parser options.

### compile

```javascript
compile([opts])
```

Gets a compiler stream that transforms the parser state information to
a program definition.

Returns a compiler stream.

* `opts` Object compiler options.

### dest

```javascript
dest([opts])
```

Gets a destination renderer stream.

When no type is specified the JSON renderer is assumed.

Returns a renderer stream of the specified type.

* `opts` Object renderer options.

#### Options

* `type` String=json the renderer type.

### load

```javascript
load(def[, opts])
```

Load a program definition into a new program assigning the definition
properties to the program.

Properties are passed by reference so if you modify the definition the
program is also modified.

Returns a new program.

* `def` Object the program definition.
* `opts` Object program options.

### run

```javascript
run(src, argv[, runtime], cb)
```

Load a program definition into a new program assigning the definition
properties to the program.

Properties are passed by reference so if you modify the definition the
program is also modified.

The callback function signature is `function(err, req)` where `req` is a
request object that contains state information for program execution.

Plugins may decorate the request object with pertinent information that
does not affect the `target` object that receives the parsed arguments.

Returns a new program.

* `src` Object the source program or definition.
* `argv` Array the program arguments.
* `runtime` Object runtime configuration.
* `cb` Function callback function.

## License

MIT

---

Created by [mkdoc](https://github.com/mkdoc/mkdoc) on April 4, 2016

[mkdoc]: https://github.com/mkdoc/mkdoc
[mkast]: https://github.com/mkdoc/mkast
[through]: https://github.com/tmpfs/through3
[commonmark]: http://commonmark.org
[jshint]: http://jshint.com
[jscs]: http://jscs.info

