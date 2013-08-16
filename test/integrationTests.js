var spawn = require('child_process').spawn;
require('should');

describe('mdlint', function () {

  describe('glob', function () {

    describe('when all matched files pass linting', function () {

      var logData = '';
      var exitCode;

      before(function (done) {
        var lintProcess = spawn('node', ['./bin/mdlint', 'glob', 'test/fixtures/goodsyntax.md']);

        lintProcess.stdout.on('data', function (data) {
          logData += data;
        });

        lintProcess.on('close', function (code) {
          exitCode = code;
          done();
        });
      });

      it('should not log the local markdown files that pass linting', function () {
        logData.should.not.include('Markdown passed linting');
        logData.should.not.include('test/fixtures/partials.md');
      });

      it('should log a success message', function () {
        logData.should.not.include('Markdown passed linting');
      });

      it('should have an exit code of 0', function () {
        exitCode.should.eql(0);
      });
    });

    describe('when one or more matched file(s) fail linting', function () {
      var logData = '';
      var exitCode;

      before(function (done) {
        var lintProcess = spawn('node', ['./bin/mdlint', 'glob', 'test/fixtures/*.md']);

        lintProcess.stdout.on('data', function (data) {
          logData += data;
        });

        lintProcess.on('close', function (code) {
          exitCode = code;
          done();
        });
      });

      it('should log the local markdown files that failed linting', function () {
        logData.should.not.include('Markdown passed linting');
        logData.should.not.include('test/fixtures/goodsyntax.md');
        logData.should.not.include('test/fixtures/partials.md');

        logData.should.include('Markdown failed linting');
        logData.should.include('test/fixtures/syntaxerror.md');

      });

      it('should have an exit code of 1', function () {
        exitCode.should.eql(1);
      });
    });
  });

  if (process.env.NODE_ENV !== 'dev') {

    describe('repo', function () {

      it('should lint a README from a GitHub repo', function (done) {
        var lintProcess = spawn('node', ['./bin/mdlint', 'repo', 'ChrisWren/mdlint', '-v']);
        var logData = '';

        lintProcess.stdout.on('data', function (data) {
          logData += data;
        });

        lintProcess.on('close', function () {
          logData.should.include('Markdown passed linting');
          done();
        });
      });
    });
  }


  describe('when run with the -v flag', function () {
    var logData = '';
    var exitCode;

    before(function (done) {
      var lintProcess = spawn('node', ['./bin/mdlint', 'glob', 'test/fixtures/*.md', '-v']);

      lintProcess.stdout.on('data', function (data) {
        logData += data;
      });

      lintProcess.on('close', function (code) {
        exitCode = code;
        done();
      });
    });

    it('should log the result of all markdown being linted', function () {
      logData.should.include('Markdown passed linting');
      logData.should.include('test/fixtures/goodsyntax.md');
      logData.should.include('test/fixtures/partials.md');

      logData.should.include('Markdown failed linting');
      logData.should.include('test/fixtures/syntaxerror.md');
    });
  });

  if (process.env.NODE_ENV !== 'dev') {

    describe('user', function () {

      it('should lint all READMEs from a users\'s GitHub repos', function (done) {
        var lintProcess = spawn('node', ['./bin/mdlint', 'user', 'mishalshah', '-v']);
        var logData = '';

        lintProcess.stdout.on('data', function (data) {
          logData += data;
        });

        lintProcess.on('close', function () {
          logData.should.include('Markdown passed linting');
          done();
        });
      });
    });

    describe('query', function () {

      it('should lint READMEs from repos returned by a GitHub query', function (done) {
        var lintProcess = spawn('node', ['./bin/mdlint', 'query', 'grunt-pages', '-v']);
        var logData = '';

        lintProcess.stdout.on('data', function (data) {
          logData += data;
        });

        lintProcess.on('close', function () {
          logData.should.include('Markdown passed linting');
          done();
        });
      });
    });
  }
});
