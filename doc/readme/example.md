## Example

Compile a program definition:

```shell
mkcat argv.md | mkcli > argv.json
```

Create a help text file:

```shell
mkcat argv.md | mkcli -t help | mktext > argv.txt
```

Create a man page:

```shell
mkcat argv.md | mkcli -t man | mkman > argv.1
```

