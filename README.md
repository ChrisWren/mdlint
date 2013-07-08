# mdlint
> Lint your markdown files to find JavaScript syntax errors.

# Installation
```bash
npm install -g mdlint
```

# Usage

mdlint is used as a command-line utility. You can point it at a local markdown file or a GitHub repository.

    mdlint <file> <type>

    Type:
    -f, --file     file interpreted as a local markdown file
    -r, --repo     file interpreted as GitHub repo README
    -q, --query    file interpreted as a query for GitHub repos

    Options:
    -h, --help     output usage information
    -V, --version  output the version number
  
Here is an example of mdlint being run on a local file:
```bash
mdlint README.md -f
```
Here is an example of mdlint being run on a GitHub repo's README.md file:
```bash
mdlint ChrisWren/grunt-nodemon -r
```

Here is an example of mdlint being run on a collection of JavaScript repositories from the result of a query:
```bash
mdlint grunt -q
```

## Accepted Psuedocode

mdlint accepts certain pre-defined psuedocode which it will preprocess so that an error isn't thrown during validation.

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
