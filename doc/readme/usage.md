## Usage

First define a [program as markdown](/doc/example/argv.md) and compile the [program descriptor](/doc/example/argv.json):

```shell
mkcat argv.md | mkcli > argv.json
```

Then create a [help file](/doc/example/argv.txt):

```shell
mkcat argv.md | mkcli -t help > argv.txt
```

Write [a program](/doc/example/argv.js) that can be executed and easily tested; then add [a minimal executable](/doc/example/argv).
