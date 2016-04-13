# Name

notes - program to test the completion capabilities

# Synopsis

```
<command> [options] [files...]
```

# Commands

* `add` Add a note
* `del` Delete a note
* `ls, list` List notes
* `show` Show a note
* `edit` Edit a note

# Options

* `-f, --file=[FILE]` File completion
* `-d, --directory=[DIR]` Directory completion
* `-u, --url=[URL...]` URL completion
* `-h, --help` Display help and exit
* `--version` Print version and exit

# Test

To test the program update fpath:

```
fpath=($HOME/git/mkdoc/mkcli/test/fixtures/completion $fpath)
```

And PATH:

```
PATH="test/fixtures/completion:$PATH"
```
