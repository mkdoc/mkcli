## Guide

### Defining Programs

This section covers what you need to know to define a program as markdown.

#### Name

Like man pages the *Name* section is required and it **must** include a brief summary of the program after the program name. Delimit the program name from the short summary using a hyphen surrounded by spaces as shown below.

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

#### Description

The program description is created from all block level elements under the *Description* heading:

```markdown
# Name

prg - short program summary

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

This bit is easy, the hard work is done writing the markdown definition.

To compile the markdown document to a JSON *program descriptor* run:

```shell
mkcat program.md | mkcli > program.json
```

Now you have a JSON document that describes your program commands and options.

### Creating Documentation

Once you have defined the program you will want to generate a man page and some help text.

To create the help text run:

```shell
mkcat program.md | mkcli -t help | mktext > program.txt
```

For a man page run:

```shell
mkcat program.md | mkcli -t man | mkman --title program > program.1
```

#### Help Sections

Sometimes when creating help files you may want to include a section from the manual, possibly you want to include an *Environment* section to show the environment variables your program recognises.

Pass regular expression patterns using the `--section` option and if they match a section heading the section will be included in the help after the commands and options.

To include an *Environment* section you could use:

```shell
mkcat program.md | mkcli -t help -S env | mktext > program.txt
```

To include the *Environment* and *Bugs* sections you could use:

```shell
mkcat program.md | mkcli -t help -S env -S bug | mktext > program.txt
```

Or if you prefer:

```shell
mkcat program.md | mkcli -t help -S '(env|bug)' | mktext > program.txt
```

See the [help](#help) for more options available when creating help and man pages. 
