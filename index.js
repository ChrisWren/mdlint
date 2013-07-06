var fs = require('fs');

var request = require('request');
var esprima = require('esprima');
var teacher = require('teacher');
var argv = require('optimist').argv;

require('colors');

if (!argv.repo && !argv.file) {
  request({
    uri: 'https://api.github.com/legacy/repos/search/javascript',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.2 Safari/537.36'
    }
  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var repos = JSON.parse(body).repositories;
      fetchREADMEs(repos);
    } else {
      console.log(error);
      return;
    }
  });

} else if (argv.repo) {
  fetchREADMEs(repos);
  repos = [{ url: 'https://github.com/' + argv.repo }];
} else if (argv.file) {
  parseMarkdown(fs.readFileSync(argv.file, 'utf8'));
}

function fetchREADMEs (repos) {
  repos.forEach(function (repo) {
    request(repo.url.replace('https://github.com', 'https://raw.github.com') + '/master/README.md',
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          parseMarkdown(body, repo)
        } else {
          console.log(error);
          return;
        }
      });
  });
}

function parseMarkdown (body, repo) {
  var text = '';
  var splitCode = body.split('```')

  splitCode.forEach(function (block, index) {
    if (index % 2 === 0) {
      text += block;
      delete splitCode[index];
    } else if (splitCode[index].substr(0, 2) !== 'js') {
      delete splitCode[index];
    }
  });

  teacher.check(text, function (err, data) {

    if (data) {
      data.forEach(function (textBlock) {
        if (textBlock.type === 'grammar' && textBlock.description === 'Wrong article') {
          console.log(textBlock);
          console.log('\n' + repo.url);
        } else if (true) {

        }
      });
    }
  });

  splitCode.forEach(function (codeBlock) {
    codeBlock = sanitizeCode(codeBlock.slice(3));
    try {
      syntax = esprima.parse(codeBlock, { tolerant: true });
    } catch (e) {
      console.log(codeBlock);
      console.log('Failed.'.red);
      if (repo) {
        console.log(repo.url + '\n');
      }
      console.log(e.message + '\n');
    }

  });
}


function sanitizeCode (code) {
  if (code.indexOf('{') === 0) code = 'var json = ' + code + ';';
  else if (code.indexOf(': {') !== -1 && code.indexOf(': {') < code.indexOf('{')) code = 'var json = {' + code + '};';
  return code.replace('...', '');
}