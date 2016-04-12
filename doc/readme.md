# Command Line Interface

<? @include readme/badges.md ?>

> Define command line interfaces as markdown

Describe a command line interface as an easy to read man-style markdown document and compile it to a program descriptor; the JSON program descriptor can then be used by the program implementation to parse and validate arguments.

The markdown program definitions can be converted to man pages, help files and shell completion scripts.

Encourages a document first approach to writing command line interfaces in a fluid natural language writing style.

<? @include {=readme} install.md ?>

***
<!-- @toc -->
***

<? @include {=readme} example.md guide.md help.md ?>

<? @exec mkapi index.js --title=API --level=2 ?>
<? @include {=readme} license.md links.md ?>
