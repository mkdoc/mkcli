# Name

program - short program description

# Synopsis

```
[options]
```

```
[options] [files..]
```

# Description

Long program description with a lot more information about the program behaviour.

It can contain multiple paragraphs and other block level elements but the help output will only include the paragraphs which might lose some meaning.

```
program --version
```

* foo
* bar
* baz

# Commands

* `ls, list` List tasks
* `i, info` Print task information

# Options

* `-b, --base=[URL] {String=http://example.com}` Base URL for absolute links that also has quite a bit of text
* `-r, --relative=[PATH] {foo|bar=/}` Relative path when repository url with some really 
    long `text` that *should* force **word** wrapping.

    And some more text in a new paragraph.

    With another longer paragraph too that should wrap because it has quite a few words.
* `-g, --greedy` Convert links starting with # and ?
* `-h, --help` Display this help and exit
* `--version` Print the version and exit

# Environment

Accepts the FOO variable.

# Bugs

Lots of them.
