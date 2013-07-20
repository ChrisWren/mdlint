require('should');
var spawn = require('child_process').spawn;

describe('mdlint', function () {

  it('should lint local markdown files that match a file glob', function (done) {
    var lintProcess = spawn('node', ['./bin/mdlint', 'glob', 'test/fixtures/*.md']);
    var logData = '';

    lintProcess.stdout.on('data', function (data) {
      logData += data;
    });

    lintProcess.stdout.on('close', function () {
      logData.should.include('Error');
      done();
    });
  });

  it('should lint a README from a GitHub repo', function (done) {
    var lintProcess = spawn('node', ['./bin/mdlint', 'repo', 'ChrisWren/mdlint']);
    var logData = '';

    lintProcess.stdout.on('data', function (data) {
      logData += data;
    });

    lintProcess.stdout.on('close', function () {
      logData.should.include('Markdown passed linting.');
      done();
    });
  });

  it('should lint all READMEs from a users\'s GitHub repos', function (done) {
    var lintProcess = spawn('node', ['./bin/mdlint', 'user', 'mishalshah']);
    var logData = '';

    lintProcess.stdout.on('data', function (data) {
      logData += data;
    });

    lintProcess.stdout.on('close', function () {
      logData.should.include('Markdown passed linting.');
      done();
    });
  });

  it('should lint READMEs from repos returned by a GitHub query', function (done) {
    var lintProcess = spawn('node', ['./bin/mdlint', 'query', 'grunt-pages']);
    var logData = '';

    lintProcess.stdout.on('data', function (data) {
      logData += data;
    });

    lintProcess.stdout.on('close', function () {
      logData.should.include('Markdown passed linting.');
      done();
    });
  });

});
