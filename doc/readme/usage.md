## Usage

### Define

First define a [program as markdown](/doc/example/argv.md):

<? @source {markdown} ../example/argv.md ?>

### Compile

Compile the [program descriptor](/doc/example/argv.json):

```shell
mkcat argv.md | mkcli > argv.json
```

<? @source {json} ../example/argv.json ?>

### Document

Then create a [help file](/doc/example/argv.txt):

```shell
mkcat argv.md | mkcli -t help > argv.txt
```

<? @source {} ../example/argv.txt ?>

### Program

Write [a program](/doc/example/argv.js) that can be executed and easily tested:

<? @source {javascript=s/\.\.\/index/mkcli/gm} ../example/argv.js ?>

### Executable

And add [a minimal executable](/doc/example/argv):

<? @source {javascript} ../example/argv ?>
