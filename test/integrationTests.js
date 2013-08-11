var spawn = require('child_process').spawn;

require('should');

describe('mdlint', function () {

  describe('glob', function () {

    describe('when all matched files pass linting', function () {

      var logData = '';
      var exitCode;

      before(function (done) {
        var lintProcess = spawn('node', ['./bin/mdlint', 'glob', 'test/fixtures/partials.md']);

        lintProcess.stdout.on('data', function (data) {
          logData += data;
        });

        lintProcess.on('close', function (code) {
          exitCode = code;
          done();
        });
      });

      it('should log the local markdown files that passed the file glob', function () {
        logData.should.include('Markdown passed linting');
        logData.should.include('test/fixtures/partials.md');
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

      it('should log the local markdown files that passed and failed the file glob', function () {
        logData.should.include('Markdown passed linting');
        logData.should.include('test/fixtures/goodsyntax.md');
        logData.should.include('test/fixtures/partials.md');

        logData.should.include('Markdown failed linting');
        logData.should.include('test/fixtures/syntaxerror.md');

      });

      it('should have an exit code of 1', function () {
        exitCode.should.eql(1);
      });
    });

  });

  describe('repo', function () {

    it('should lint a README from a GitHub repo', function (done) {
      var lintProcess = spawn('node', ['./bin/mdlint', 'repo', 'ChrisWren/mdlint']);
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

  describe('when run with the -s flag', function () {
    var logData = '';
    var exitCode;

    before(function (done) {
      var lintProcess = spawn('node', ['./bin/mdlint', 'glob', 'test/fixtures/*.md', '-s']);

      lintProcess.stdout.on('data', function (data) {
        logData += data;
      });

      lintProcess.on('close', function (code) {
        exitCode = code;
        done();
      });
    });

    it('should only log the markdown files that failed the linting', function () {
      logData.should.not.include('Markdown passed linting');
      logData.should.not.include('test/fixtures/goodsyntax.md');
      logData.should.not.include('test/fixtures/partials.md');

      logData.should.include('Markdown failed linting');
      logData.should.include('test/fixtures/syntaxerror.md');
    });
  });

  describe('user', function () {

    it('should lint all READMEs from a users\'s GitHub repos', function (done) {
      var lintProcess = spawn('node', ['./bin/mdlint', 'user', 'mishalshah']);
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
      var lintProcess = spawn('node', ['./bin/mdlint', 'query', 'grunt-pages']);
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
});
