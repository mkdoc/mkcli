# Command Line Interface

<? @include readme/badges.md ?>

> Define command line interfaces as markdown

Compiles a markdown program definition to a JSON program descriptor.

Program definitions may be converted to man pages and help files.

<? @include {=readme} install.md ?>

***
<!-- @toc -->
***

<? @include {=readme} usage.md example.md guide.md help.md ?>

<? @exec mkapi index.js --title=API --level=2 ?>
<? @include {=readme} license.md links.md ?>
