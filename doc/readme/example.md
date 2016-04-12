## Example

To compile all output files run:

```shell
mkcli program.md
```

Or compile a specific output type:

```shell
mkcli program.md -t json
mkcli program.md -t help
mkcli program.md -t man
mkcli program.md -t zsh
```

You may pipe input for more control over the output. For example to set a man page title:

```shell
mkcat program.md | mkcli -t man | mkman --title program > program.1
```

If you have a lot of programs pass a directory and all `md` files in the directory are compiled, see [help](#help) for more options.

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

