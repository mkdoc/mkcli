# Command Line Interface

<? @include readme/badges.md ?>

> Define command line interfaces as markdown

Creates a program definition from a markdown document and writes the program definition as JSON.

Generated program definitions may be converted to man pages and help files.

<? @include {=readme} install.md ?>

***
<!-- @toc -->
***

## Usage

Create a stream and write the program description:

<? @source {javascript=s/\.\.\/index/mkcli/gm} usage.js ?>

<? @include {=readme} example.md help.md ?>

<? @exec mkapi index.js --title=API --level=2 ?>
<? @include {=readme} license.md links.md ?>
