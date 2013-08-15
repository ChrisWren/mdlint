/*
 * mdlint
 * https://github.com/ChrisWren/mdlint
 *
 * Copyright (c) 2013 Chris Wren
 * Licensed under the MIT license.
 */
'use strict';
var spawn   = require('child_process').spawn;
var fs      = require('fs');

              require('colors');
var program = require('commander');
var esprima = require('esprima');
var glob    = require('glob');
var _       = require('lodash');
var request = require('request');

var headers = {

  // GitHub API requires the User-Agent Header to be set
  'User-Agent': 'mdlint'
};

// Location of token file to generate when user authenticates
var tokenFile = __dirname + '/authtoken.txt';

// Keep track of the number of failed files to change the file break color for readability
var numFailedFiles = 0;

module.exports = function () {

  // Use Auth Token if present
  if (fs.existsSync(tokenFile)) {
    headers.Authorization = 'token ' + fs.readFileSync(tokenFile, 'utf8');
  }

  program
    .version(require('./package.json').version)
    .option('-v, --verbose',  'report linting for all files');

  program
    .command('repo <repo>')
    .description('lints a README from a GitHub repo')
    .action(function (repo) {
      fetchRepoREADME(repo);
    });

  program
    .command('user <username>')
    .description('lints all READMEs from a user\'s GitHub repos')
    .action(function (user) {
      fetchUserREADMEs(user);
    });

  program
    .command('glob <glob>')
    .description('lints local markdown files that match a file glob')
    .action(function (fileGlob) {
      glob.sync(fileGlob).forEach(function (file) {
        lintMarkdown(fs.readFileSync(file, 'utf8'), file);
      });

      if (numFailedFiles > 0) {
        process.exit(1);
      } else if (!program.verbose) {
        console.log('All files passed linting.');
      }
    });

  program
    .command('query <query>')
    .option('--page', 'The page of results to return. Defaults to 0.')
    .description('lints READMEs from repos returned by a GitHub query.')
    .action(function (query) {
      request({
        uri: 'https://api.github.com/legacy/repos/search/' +
             query +
             '?language=JavaScript' +
             '&start_page=' + program.page || '0',
        headers: headers
      }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
          JSON.parse(body)
            .repositories
            .forEach(function (repo) {
              fetchRepoREADME(repo.owner + '/' + repo.name);
            });
        } else {
          if (response.headers['x-ratelimit-remaining'] === '0') {
            getAuthToken();
          } else {
            console.log(body);
            console.log(response.headers);
            console.log('Unable to reach the GitHub API :('.red);
          }
          return;
        }
      });
    });

  // Process implicit commands
  program
    .command('*')
    .action(function (command) {
      if (command.indexOf('*') !== -1 || command.indexOf('.') !== -1) {
        glob.sync(command).forEach(function (file) {
          lintMarkdown(fs.readFileSync(file, 'utf8'), file);
        });
        if (numFailedFiles > 0) {
          process.exit(1);
        }
      } else if (command.indexOf('/') !== -1) {
        fetchRepoREADME(command);
      } else {
        fetchUserREADMEs(command);
      }
    });

  program
    .parse(process.argv);

  if (!program.args.length) {
    program.help();
  }
};

/**
 * Fetches READMEs from a user's GitHub repos
 * @param  {String} GitHub username
 */
function fetchUserREADMEs (user) {
  request({
    uri: 'https://api.github.com/users/' + user + '/repos',
    headers: headers
  }, function (error, response, body) {
    var responseBody = JSON.parse(body);

    if (responseBody.message) {
      console.log('Error: the following user was not found: '.red + user.blue);
      return;
    }

    JSON.parse(body)
      .forEach(function (repo) {
        fetchREADME(repo.full_name);
      });
  });
}

/**
 * Fetches a README from GitHub
 * @param  {String} repo URL of repo to fetch
 */
function fetchREADME (repo) {
  request({
    uri: 'https://api.github.com/repos/' + repo + '/readme',
    headers: _.extend(headers, {

      // Get raw README content
      'Accept': 'application/vnd.github.VERSION.raw'
    })
  },
  function (error, response, body) {
    if (!error && response.statusCode === 200) {
      lintMarkdown(body, repo);
    } else {
      if (response.headers['x-ratelimit-remaining'] === '0') {
        getAuthToken();
      } else {
        console.log('README for https://github.com/' + repo.blue + ' not found.'.red);
        return;
      }
    }
  });
}

/**
 * [parseMarkdown description]
 * @param  {String} markdownContent Content of markdown file
 * @return {Array}                  Array of objects with a language and code property
 */
function parseMarkdown (markdownContent) {
  var codeBlocks =  markdownContent

  .split('```')

  .filter(function (codeBlock, index) {

    // Delete the text in between code sections
    if (index % 2 === 0 ||

        // Remove non JavaScript and JSON code blocks
        (codeBlock.trim().toLowerCase().indexOf('js')         !== 0 &&
         codeBlock.trim().toLowerCase().indexOf('javascript') !== 0)) {
      return false;
    }
    return true;
  })

  .map(function (codeBlock) {
    return {
      lang: codeBlock.split('\n')[0].trim().toLowerCase(),
      code: codeBlock.slice(codeBlock.indexOf('\n') + 1)
    };
  });

  return codeBlocks;
}

// Boolean to keep track if the file break has been logged when discovering multiple errors in a single file
var didLogFileBreak;

/**
 * Parses the JavaScript code blocks from the markdown file
 * @param  {String} body Body of markdown file
 * @param  {String} file Filename
 */
function lintMarkdown (body, file) {
  var codeBlocks = parseMarkdown(body);

  didLogFileBreak = false;

  var failedCodeBlocks = _.reject(_.compact(codeBlocks), function (codeBlock) {
    return validateCodeBlock(codeBlock, file);
  });

  if (failedCodeBlocks.length === 0) {
    if (program.verbose) {
      console.log('Markdown passed linting for '.green + file.blue.bold + '\n');
    }
  } else {
    if (numFailedFiles % 2 === 0) {
    console.log('Markdown failed linting for '.red + file.yellow);
    } else {
      console.log('Markdown failed linting for '.red + file.blue);
    }
    numFailedFiles++;
    console.log('');
  }
}

/**
 * Logs a break between files for readability
 * @param  {String} text Text to log
 */
function logFileBreak (text) {
  if (numFailedFiles % 2 === 0) {
    console.log(text.yellow.inverse);
  } else {
    console.log(text.blue.inverse);
  }
}

/**
 * Validates that code blocks are valid JavaScript
 * @param  {Object} code A block of code from the markdown file containg the lang and code
 * @param  {String} file Name of file currently being validated
 */
function validateCodeBlock (codeBlock, file) {
  var lang = codeBlock.lang;
  var code = codeBlock.code;

  if (lang === 'json') {
    try {
      JSON.parse(code);
    } catch (e) {
      console.log(e);
      console.log(code);
      return false;
    }
    return true;
  } else if (lang === 'js' || lang === 'javascript') {
    code = preprocessCode(code);
    try {
      esprima.parse(code, { tolerant: true });
    } catch (e) {

      // Get indeces from lineNumber and column
      var line   = e.lineNumber - 1;
      var column = e.column - 1;

      // Highlight error in code
      code = code.split('\n');

      code[line] = code[line].slice(0, column).magenta +
                   code[line][column].red +
                   code[line].slice(column + 1).magenta;

      code = code.join('\n');

      if (!didLogFileBreak) {
        logFileBreak(file);
        didLogFileBreak = true;
      }

      console.log(e);
      console.log(code);

      return false;
    }
    return true;
  }
}

/**
 * Retrieves an auth token so that the user can exceed the uauthenticated rate limit
 */
function getAuthToken () {
  console.log('You have hit the rate limit for unauthenticated requests, please log in to raise your rate limit:\n'.red);

  program.prompt('GitHub Username: ', function (user) {

    console.log('\nAfter entering your password, hit return' + ' twice.\n'.green);
    var authProcess = spawn('curl', [
      '-u',
      user,
      '-d',
      '{"scopes":["repo"],"note":"mdlint"}',
      '-s',
      'https://api.github.com/authorizations'
    ], {
      stdio: [process.stdin, 'pipe', process.stderr]
    });

    authProcess.stdout.setEncoding('utf8');
    authProcess.stdout.on('data', function (data) {
      var response = JSON.parse(data);
      if (response.message) {
        console.log(response.message.red + '\n');
        process.exit();
      } else {
        fs.writeFileSync(tokenFile, response.token);
        console.log('Authenticated :). Now try your lint again. \n'.green);
        process.exit();
      }
    });
  });
}

/**
 * Preprocesses the code block and re-formats it to allow for partial code
 * @param  {String} code A block of code from the markdown file
 * @return {String} Processed code transformed from partial code
 */
function preprocessCode (code) {

  // Remove starting comments
  while (code.indexOf('//') === 0) {
    code = code.slice(code.indexOf('\n'));
  }

  // Starts with an object literal
  if (code.indexOf('{') === 0) {
    code = 'var json = ' + code;

  // Starts with an object property
  } else if (code.indexOf(':') !== -1 &&
             code.indexOf(':') < code.indexOf(' ')) {
    code = 'var json = {' + code + '}';
  }

  // Starts with an anonymous function
  if (code.indexOf('function') === 0) {
    code = 'var func = ' + code;
  }

  // Contains ...
  return code.replace('...', '');
}