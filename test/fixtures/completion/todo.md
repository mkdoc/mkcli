# Name

todo - program to test the completion capabilities

# Commands

* `add` Add a todo
* `del` Delete a todo
* `ls, list` List todo notes

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
