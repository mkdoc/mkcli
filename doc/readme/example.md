## Example

To compile all output types to the same directory as the input file:

```shell
mkcli program.md
```

Compile all output types to a specific directory:

```shell
mkcli program.md -o build
```

Compile a specific output type:

```shell
mkcli -t man program.md
```

Compile a specific output type to a particular directory:

```shell
mkcli -t zsh program.md --zsh build/zsh
```

If you have a lot of programs pass a directory and all markdown documents in the directory are compiled:

```shell
mkcli doc/cli -o build
```

You may pipe input for more control over the output; to set a man page title:

```shell
mkcat program.md | mkcli -t man | mkman --title program > program.1
```

