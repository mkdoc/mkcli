# Name

notes - program to test the completion capabilities

# Commands

* `add` Add a note
* `del` Delete a note
* `ls, list` List notes

# Options

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
