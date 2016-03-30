# Command Line Documentation

<? @include readme/badges.md ?>

> Generates help and man pages for command line interfaces

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
