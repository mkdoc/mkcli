## Usage

1) First define a [program as markdown](/doc/example/argv.md).

2) Compile the [program descriptor](/doc/example/argv.json):

```shell
mkcat argv.md | mkcli > argv.json
```

3) Then create a [help file](/doc/example/argv.txt):

```shell
mkcat argv.md | mkcli -t help > argv.txt
```

4) Write [a program](/doc/example/argv.js) that can be executed and easily tested.

5) Finally add [a minimal executable](/doc/example/argv).
