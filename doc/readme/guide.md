## Guide

### Defining Programs

The markdown document defines sections that start with a level one heading and continue until the next level one heading or the end of file is reached.

The sections that have special meaning to the compiler are:

* [NAME](#name)
* [SYNOPSIS](#synopsis)
* [DESCRIPTION](#description)
* [COMMANDS](#commands)
* [OPTIONS](#arguments)

It is considered best practice to declare these sections in the order listed.

All other sections are deemed to be man page sections they are ignored from help output by default (but may be included at compile time) and are always included when generating man pages.

Section headings are not case-sensitive so you can use upper case, title case or lower case. 

#### Name

Like man pages the name section is required and it **must** include a brief summary of the program after the program name. Delimit the program name from the short summary using a hyphen surrounded by spaces as shown below.

The program name and summary is extracted from the first paragraph under the *Name* heading:

```markdown
# Name

prg - short program summary
```

Add a list when a program can have multiple names:

```markdown
# Name

prg - short program summary

+ prg-alias
```

The name section must be the first section in the file otherwise the compiler will error.

#### Synopsis

The program synopsis is created from all code block elements under the *Synopsis* heading:

```markdown
# Name

prg - short program summary

# Synopsis

    [options] [file...]
```

It is a compiler error if any other type is declared in the synopsis section.

#### Description

The program description is created from all block level elements under the *Description* heading:

```markdown
# Name

prg - short program summary

# Description

An extended description that can include paragraphs, lists, code blocks and other block level elements.
```

Note that the help output only includes paragraphs so some meaning may be lost if you include lists, code blocks or block quotes. For this reason it is recommended that the description section only contain paragraphs.

If you mix content in the description section you can use the `-d, --desc` option when generating the help file to restrict the number of paragraphs included in the help output.

Consider this example:

```markdown
# Name

prg - short program summary

# Description

Simple program.

Run with:

    cat file.md | prg
```

Context would be lost on the second paragraph because the code block would not be included in the help output, whilst it would make perfect sense in the man output.

To prevent this loss of context just include the first paragraph in the help output:

```shell
mkcat program.md | mkcli --desc 1 | mktext
```

#### Arguments

Program arguments are declared with a heading of *Options* and a list following the heading:

```markdown
# Name

prg - short program summary

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

prg - short program summary

# Commands

* `ls, list` List tasks
* `i, info` Print task information
```

They allow you to create complex programs with options specific to a command.

Command files are loaded and compiled automatically following a naming convention. Using the above example to define the `list` command create a file named `prg-list.md`:

```markdown
# Name

list - list tasks

# Options

* `-a, --all` List all tasks
* `-t=[TYPE...]` List tasks of TYPE
```

Will result in the compiled tree containing options specific to the `list` command.

#### Identifiers

When a program is created from a source markdown document each argument and command is given a key for the resulting map. This key is generated automcatically by using the longest argument (or command) name and converting it to camel case.

If you wish to use a fixed key you can add an identifier followed by a colon (`:`) to the beginning of the specification:

```markdown
# Name

prg - short program summary

# Commands

* `tasks: ls, list` List tasks

# Options

* `verbose: -v` Print more information
```

#### Manual Sections

A heading that is not matched by any of the rules above is treated as a manual section:

```markdown
# Name

prg - short program summary

# Environment

The environment variable FOO changes the behaviour to `bar`.
```

The section ends when the next level one heading is encountered or the end of the file is reached.

### Compiling Programs

To compile the markdown document to a JSON program descriptor run:

```shell
mkcli -t json program.md
```

Now you have a JSON document that describes your program commands and options.

### Creating Documentation

Once you have defined the program you will want to generate a man page and some help text.

To create the help text run:

```shell
mkcli -t help program.md
```

For a man page run:

```shell
mkcli -t man program.md
```

#### Help Styles

The default column help style (`col`) should suit most purposes however the other styles can be useful. The `list` style renders a list of the commands and options which is designed for when you have very long argument names or a few arguments that require long descriptions.

The `cmd` style is a list of command names (options are not printed) designed to be used when a program has lots of commands and a command is required. Typically the program would show this help page when no command was specified to indicate to the user a command is required.

Sometimes you may want very minimal help output that just includes the usage synopsis in which case use the `usage` style.

#### Help Sections

Sometimes when creating help files you may want to include a section from the manual, possibly you want to include an *Environment* section to show the environment variables your program recognises.

Pass regular expression patterns using the `--section` option and if they match a section heading the section will be included in the help after the commands and options.

To include an *Environment* section you could use:

```shell
mkcli -t help -S env program.md
```

To include the *Environment* and *Bugs* sections you could use:

```shell
mkcli -t help -S env -S bug program.md
```

Or if you prefer:

```shell
mkcli -t help -S '(env|bug)' program.md
```

See the [help](#help) for more options available when creating help and man pages. 

### Completion

Completion scripts are currently available for zsh. To install a completion script for a program copy the script to a directory in `$fpath` or modify `~/.zshrc` to autoload the directory containing the completion script:

```zsh
fpath=(/path/to/completion $fpath)
```

A full working completion example is the [notes](/test/fixtures/completion) test fixture.

Sometimes you may wish to reload a completion for testing purposes:

```zsh
unfunction _notes && autoload -U _notes
```

#### Actions

Some option value specifications map to zsh completion functions:

<? @include actions.md ?>

Such that an option specification such as:

```markdown
* `-i, --input [file...]` Input files
* `-o, --output <dir>` Output directory
```

Will result in the `_files` completion function being called to complete file paths for the `--input` option and the `_directories` function for the `--output` option. Note that the ellipsis (...) multiple flag is respected so `--input` will be completed multiple times whilst `--output` will only complete once.

For options that specify a list of types the `_values` completion function is called.

```markdown
* `-t, --type=[TYPE] {json|yaml}` Output type
```

Results in automatic completion for the `--type` option to one of `json` or `yaml`.

Actions are enclosed in double quotes (") so you may use single quotes and paired double quotes but not a single double quote which will generate an `unmatched "` zsh error.

#### Synopsis Completion

The program synopsis section is inspected and will use completion functions when a match is available, so a synopsis such as:

```markdown
    [options] [files...]
```

Will result in the _files completion function called, see above for the list of matches and completion functions.

Sometimes you may need to create a custom completion list; you can set the info string of fenced code blocks in the synopsis section to inject scripts. The value may be either `zsh-locals` to inject code into the beginning of the body of the generated completion function and `zsh` to add to the list of completion actions.

A real-world example is [mk](https://github.com/mkdoc/mkdoc#mk) ([program definition](https://raw.githubusercontent.com/mkdoc/mkdoc/master/doc/cli/mk.md) and [compiled completion script](https://github.com/mkdoc/mkdoc/blob/master/doc/zsh/_mk)) which completes on the available task names.

#### Specification Completion

You may wish to change the zsh action taken per option, this can be done by appending a colon and the zsh action to an option specification:

```markdown
* `-p, --package=[FILE] :file:_files -g '*.json'` Package descriptor
```

Which will complete files with a `.json` extension for the `--package` option.

#### Command Completion

Commands are recursively added to the completion script; they are completed using the following rules:

* Required commands (`<command>` in the synopsis) will not list options.
* Command options inherit from the global options.
* Command options cascade to child options.
* Rest pattern matches (`*: :file:_files` for example) are respected.

It is recommended you use a program synopsis with the command first:

```markdown
# Synopsis

    <command> [options] [files...] 
```

Or if the command is not required:

```markdown
# Synopsis

    [command] [options] [files...] 
```

Which is because command completion is terminated when an option is intermingled with the command hierarchy. Consider a program that has the command structure `notes > list > bug|todo|feature` if you present a command line such as:

```shell
notes list --private
```

Completion will no longer be attempted on the `list` sub-commands. To put it another way *commands must be consecutive* for command completion to occur.

