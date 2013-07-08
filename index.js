var fs = require('fs');
var spawn = require('child_process').spawn;

var program = require('commander');
var request = require('request');
var glob = require("glob")
var _ = require('lodash');
var esprima = require('esprima');
require('colors');

module.exports = function () {

  var headers = {

    // GitHub API requires the User-Agent Header to be set
    'User-Agent': 'mdlint'
  };

  var tokenFile = __dirname + '/authtoken.txt';

  // Use Auth Token if present
  if (fs.existsSync(tokenFile)) {
    headers.Authorization = 'token ' + fs.readFileSync(tokenFile, 'utf8');
  }

  program
    .version('0.0.0')
    .option('-s, --silent',  'only report failing lints')

  program
    .command('repo <repo>')
    .description('lints a README from a GitHub repo')
    .action(function (repo) {
      if (repo.indexOf('/') !== -1) {
        fetchREADME(repo)
      } else {
        request({
          uri: 'https://api.github.com/users/' + repo + '/repos',
          headers: headers
        }, function (error, response, body) {

        });
      }
    });

  program
    .command('glob <glob>')
    .description('lints local markdown files that match a glob')
    .action(function (glob) {
      glob.sync(program.args[0]).forEach(function (file) {
        parseMarkdown(fs.readFileSync(file, 'utf8'), file);
      });
    });

  program
    .command('query <query> <page>')
    .description('Query GitHub for repos to help people out by discovering syntax errors :).')
    .action(function (query, page) {
      request({
        uri: 'https://api.github.com/legacy/repos/search/' +
             query +
             '?language=JavaScript' +
             '&start_page=' + page || '0',
        headers: headers
      }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          JSON.parse(body)
            .repositories
            .forEach(function (repo) {
              fetchREADME(repo.owner + '/' + repo.name);
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

  program
    .command('*')
    .action(function () {
      program.help();
    });

  program
    .parse(process.argv);

  if (!program.args.length) {
    program.help();
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
      if (!error && response.statusCode == 200) {
        parseMarkdown(body, repo);
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
   * Parses the JavaScript code blocks from the markdown file
   * @param  {String} body Body of markdown file
   * @param  {String} file Filename
   */
  function parseMarkdown (body, file) {
    var splitCode = body.split('```');
      splitCode.forEach(function (block, index) {
        if (index % 2 === 0 ||

            // Only parse js and json code blocks
            splitCode[index].substr(0, 2).toLowerCase() !== 'js') {

          // Delete the text in between code sections
          delete splitCode[index];
        }
      });

    if (file && !program.silent) {
      console.log(file.blue.bold);
    }
    if (_.all(_.compact(splitCode), validateCodeBlock)) {
      if (!program.silent) {
        console.log('Markdown passed linting.\n'.green);
      }
    } else {
      console.log('Markdown failed linting.\n'.red);
    }
  }

  /**
   * Validates that code blocks are valid JavaScript
   * @param  {String} code A block of code from the markdown file
   */
  function validateCodeBlock (code) {
    if (code.substr(0, 4).toLowerCase() === 'json') {
      try {
        JSON.stringify(code.slice(4));
      } catch (e) {
        console.log(e);
        console.log(code);
        return false;
      }
      return true;
    } else {
      code = preprocessCode(code.slice('js'.length).trim());
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
   * Preprocesses the code block and re-formats it to allow for psuedo code
   * @param  {String} code A block of code from the markdown file
   * @return {String} Processed code transformed from pseudo code
   */
  function preprocessCode (code) {

    // Remove starting comments
    if (code.indexOf('//') === 0) {
      code = code.slice(code.indexOf('\n'));
    }

    // Starts with an object literal
    if (code.indexOf('{') === 0) {
      code = 'var json = ' + code + ';';

    // Starts with an object property
    }  else if (code.indexOf(': {') !== -1 && code.indexOf(': {') < code.indexOf('{')) {
      code = 'var json = {' + code + '};';
    }

    // Starts with an anonymous function
    if (code.indexOf('function') === 0) code = 'var func = ' + code + ';';

    // Contains ...
    return code.replace('...', '');
  }
}