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

See [help](#help) for more options.

Example files for a simple working program are in [doc/example](/doc/example):

* [program definition](/doc/example/argv.md)
* [program descriptor](/doc/example/argv.json)
* [help file](/doc/example/argv.txt)
* [man page](/doc/example/argv.1)
* [zsh completion](/doc/example/_argv)
* [program implementation](/doc/example/argv.js)
* [minimal executable](/doc/example/argv)

