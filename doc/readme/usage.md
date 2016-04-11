## Usage

To compile all output files run:

```shell
mkcli argv.md
```

To just compile the [program definition](/doc/example/argv.md) to a [program descriptor](/doc/example/argv.json):

```shell
mkcli argv.md -t json
```

To create a [help file](/doc/example/argv.txt) and a [man page](/doc/example/argv.1):

```shell
mkcli argv.md -t help
mkcli argv.md -t man
```

Write [a program](/doc/example/argv.js) that can be executed and easily tested and add [a minimal executable](/doc/example/argv).
