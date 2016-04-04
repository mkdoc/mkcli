## Usage

First define a [program as markdown](/doc/example/argv.md) and compile the [program descriptor](/doc/example/argv.json):

```shell
mkcat argv.md | mkcli > argv.json
```

Then create a [help file](/doc/example/argv.txt) and a [man page](/doc/example/argv.1):

```shell
mkcat argv.md | mkcli -t help | mktext > argv.txt
mkcat argv.md | mkcli -t man | mkman --title argv > argv.1
```

Write [a program](/doc/example/argv.js) that can be executed and easily tested and add [a minimal executable](/doc/example/argv).
