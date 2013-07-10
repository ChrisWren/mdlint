# mdlint
> Lint JavaScript code blocks in markdown files to find syntax errors.

# Installation
```bash
npm install -g mdlint
```

# Usage

mdlint is used as a command-line utility. You can point it at a set of local markdown files, a GitHub repository's README, or query the GitHub API to go bounty hunting for syntax errors.

  Usage: mdlint [options] [command]

  Commands:

    repo <repo>            lints a README from a GitHub repo
    glob <glob>            lints local markdown files that match a glob
    query <query> <page>   lints READMEs from repos returned by a GitHub query
    *

  Options:

    -s, --silent   only report failing lints
    -h, --help     output usage information
    -V, --version  output the version number
  
Here is an example of mdlint being run on a set of local files:
```bash
mdlint glob docs/*.md
```

Here is an example of mdlint being run on a GitHub repo's README.md file:
```bash
mdlint repo ChrisWren/grunt-nodemon
```

Here is an example of mdlint being run on a collection of README from JavaScript repositories return from the `grunt` query:
```bash
mdlint query grunt
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

**0.0.0** - Initial Release.