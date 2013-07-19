# mdlint
> Lint JavaScript code blocks in markdown files to find syntax errors.

[![NPM version](https://badge.fury.io/js/mdlint.png)](http://badge.fury.io/js/mdlint)  
[![Dependency Status](https://gemnasium.com/ChrisWren/mdlint.png)](https://gemnasium.com/ChrisWren/mdlint)  
[![Travis Status](https://travis-ci.org/ChrisWren/mdlint.png)](https://travis-ci.org/ChrisWren/mdlint)

# Installation
```bash
npm install -g mdlint
```

# Usage

mdlint is used as a command-line utility. It lints markdown files sourced from different locations using the following four commands:

    mdlint <command> <arg> [options]

**Commands:**

    repo  <user/repo>       lints a README from a GitHub repo
    user  <username>        lints all READMEs from a user's GitHub repos
    glob  <fileGlob>        lints local markdown files that match a file glob
    query <query> [options] lints READMEs from repos returned by a GitHub query

**Options:**

    --page=<pageNum> page of results to return from query command. Defaults to 0.
    -s, --silent     only report failing lints
    -h, --help       output usage information
    -V, --version    output the version number

## Sample Usage

Here is an example of mdlint being run on a GitHub repo's README file:
```bash
mdlint repo ChrisWren/grunt-pages
```

Here is an example of mdlint being run on all READMEs from a user's GitHub repos:
```bash
mdlint user ChrisWren
```

Here is an example of mdlint being run on a set of local files. Note that the glob expression must be wrapped in quotes as `*` is a special character in the terminal:
```bash
mdlint glob "docs/*.md"
```

Here is an example of mdlint being run on the collection of READMEs returned from page 2 of the `grunt` [GitHub repositories search query](http://developer.github.com/v3/search/#search-repositories):
```bash
mdlint query grunt --page=2
```

## Accepted Psuedocode

mdlint accepts certain pre-defined psuedocode which it will preprocess so that an error isn't thrown during syntax validation.

### Object pseudocode

```js
gruntplugin: {
  
}
```

```js
{
  key: 'value'
}
```

### Function pseudocode
```js
function () {
  
}
```

# Changelog

**0.0.2** - Made `page` parameter optional for `query` command.

**0.0.1** - Added `user` command.

**0.0.0** - Initial Release.
