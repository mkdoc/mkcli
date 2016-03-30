# Command Line Interface

<? @include readme/badges.md ?>

> Define command line interfaces as markdown

Creates a program definition from a markdown document and enables writing the program definition as JSON or javascript as well as creating man pages and help files for the program.

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
