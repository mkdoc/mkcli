# Command Line Interface

<? @include readme/badges.md ?>

> Define command line interfaces as markdown

Creates a program definition from a markdown document and writes the program definition as JSON.

Generated program definitions may be converted to man pages and help files.

<? @include {=readme} install.md ?>

***
<!-- @toc -->
***

<? @include {=readme} usage.md example.md guide.md help.md ?>

<? @exec mkapi index.js --title=API --level=2 ?>
<? @include {=readme} license.md links.md ?>
