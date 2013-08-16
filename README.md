# mdlint
> Lint JavaScript code blocks in markdown files to find syntax errors.

[![NPM version](https://badge.fury.io/js/mdlint.png)](http://badge.fury.io/js/mdlint) [![Dependency Status](https://gemnasium.com/ChrisWren/mdlint.png)](https://gemnasium.com/ChrisWren/mdlint) [![Travis Status](https://travis-ci.org/ChrisWren/mdlint.png)](https://travis-ci.org/ChrisWren/mdlint)

# Installation
```bash
npm install -g mdlint
```

# Usage

    mdlint [command] <arg> [options]

mdlint is used as a command-line utility. It lints markdown files sourced from different locations using the following four commands:


**Commands:**

    glob  <fileGlob>        lints local markdown files that match a file glob
    user  <username>        lints all READMEs from a user's GitHub repos
    repo  <user/repo>       lints a README from a GitHub repo
    query <query> [options] lints READMEs from repos returned by a GitHub query

**Options:**

    -v, --verbose    report linting of all files
    --page=<pageNum> page of results to return from query command. Defaults to 0.
    -h, --help       output usage information
    -V, --version    output the version number

## Sample Usage

Here is an example of mdlint being run on a set of local files. **Note that the glob expression must be wrapped in quotes as `*` is a special character in the terminal**:
```bash
mdlint glob "docs/*.md"
```

Here is an example of mdlint being run on all READMEs from a user's GitHub repos:
```bash
mdlint user ChrisWren
```

Here is an example of mdlint being run on a GitHub repo's README file:
```bash
mdlint repo ChrisWren/grunt-pages
```


Here is an example of mdlint being run on the collection of READMEs returned from page 2 of the `grunt` [GitHub repositories search query](http://developer.github.com/v3/search/#search-repositories):
```bash
mdlint query grunt --page=2
```

### Usage with implicit commands

Any argument with a `*` or `.` will be interpreted as a local file glob, so you can lint a local file with the following shorthand command:
```bash
mdlint "README.md"
```

Any argument without a `*` or `.` that includes a `/` will be interpreted as a GitHub repo, so you can lint a repo with the following shorthand command:
```bash
mdlint ChrisWren/grunt-nodemon
```

Any other argument will be intrepreted as a GitHub user, so you could lint all of a user's repos with the following shorthand command:
```bash
mdlint ChrisWren
```

## Accepted JavaScript Partials

mdlint accepts certain pre-defined JavaScript partials which it will preprocess so that an error isn't thrown during syntax validation.

### Object partials

```js
gruntplugin: {
  
}
```

```js
{
  key: 'value'
}
```

### Function partials
```js
function () {
  
}
```

## Accepted Non-JavaScript statements

- `...` will be removed from code blocks

# Changelog

**0.0.6** - mdlint exits with `1` when any file fails linting. Improved object partial parsing.

**0.0.5** - Fixed bug where only the first error in a file was logged. Added prettier logging.

**0.0.4** - Added support for [implicit commands](https://github.com/ChrisWren/mdlint#usage-with-implicit-commands).

**0.0.3** - Added ability to parse `javascript` code blocks.

**0.0.2** - Made `page` parameter optional for `query` command.

**0.0.1** - Added `user` command.

**0.0.0** - Initial Release.
