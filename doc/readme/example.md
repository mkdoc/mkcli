## Example

To compile all output files run:

```shell
mkcli argv.md
```

Or compile a specific output type:

```shell
mkcli argv.md -t json
mkcli argv.md -t help
mkcli argv.md -t man
mkcli argv.md -t zsh
```

If you have a lot of programs pass it a directory and all `md` files in the directory are compiled, see [help](#help) for more options.

Example files for a simple working program are in [doc/example](/doc/example):

* [program definition](/doc/example/argv.md)
* [program descriptor](/doc/example/argv.json)
* [help file](/doc/example/argv.txt)
* [man page](/doc/example/argv.1)
* [zsh completion](/doc/example/_argv)
* [program implementation](/doc/example/argv.js)
* [minimal executable](/doc/example/argv)

Every program in the [mkdoc][] toolkit is compiled using this library:

* [definitions](https://github.com/mkdoc/mkdoc/tree/master/doc/cli)
* [compiled descriptors](https://github.com/mkdoc/mkdoc/tree/master/doc/json)
* [help files](https://github.com/mkdoc/mkdoc/tree/master/doc/help)
* [man pages](https://github.com/mkdoc/mkdoc/tree/master/doc/man)
* [zsh completion](https://github.com/mkdoc/mkdoc/tree/master/doc/zsh)
* [program implementations](https://github.com/mkdoc/mkdoc/tree/master/cli)
* [executables](https://github.com/mkdoc/mkdoc/tree/master/bin)

