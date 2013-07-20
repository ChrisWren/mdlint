/*jshint expr: true*/
var fs = require('fs');

require('should');
var sinon = require('sinon');
var rewire = require('rewire');

var mdlint = rewire('../index.js');

describe('mdlint', function () {

  describe('lintMarkdown', function () {

    it('should log the filename when the silent flag is false', function () {
      var consoleSpy = sinon.stub(console, 'log');
      var file = 'filename.md';
      mdlint.__set__('program', { silent: false });
      mdlint.__get__('lintMarkdown')('', 'filename.md');
      consoleSpy.firstCall.args[0].should.include(file);
      console.log.restore();
    });

    it('should log a message that the linting passed if all code blocks pass validation', function () {
      var consoleSpy = sinon.stub(console, 'log');
      var file = 'filename.md';
      mdlint.__set__('program', { silent: false });
      mdlint.__get__('lintMarkdown')(fs.readFileSync('test/fixtures/goodsyntax.md', 'utf8'), 'filename.md');
      consoleSpy.firstCall.args[0].should.include(file);
      console.log.restore();
    });

    it('should log a message that the linting failed if any code block fails validation', function () {
      var consoleSpy = sinon.stub(console, 'log');
      mdlint.__get__('lintMarkdown')(fs.readFileSync('test/fixtures/syntaxerror.md', 'utf8'), 'filename.md');
      consoleSpy.lastCall.args[0].should.include('Markdown failed linting.');
      console.log.restore();
    });

  });

  describe('parseMarkdown', function () {

    it('should extract the language and code from a code block', function () {
      var codeBlocks = mdlint.__get__('parseMarkdown')(fs.readFileSync('test/fixtures/goodsyntax.md', 'utf8'));
      codeBlocks.should.eql([{
        lang: 'js',
        code: 'var x = {\n  key: \'value\',\n  key2: \'value2\'\n}\n'
      }, {
        lang: 'javascript',
        code: 'console.log(\'Captain\\\'s log\');\n'
      }, {
        lang: 'json',
        code: '{\n  "key": "prop"\n}'
      }]);
    });

  });

  describe('validateCodeBlock', function () {

    describe('when parsing JSON code blocks', function () {

      describe('if the JSON cannot be parsed', function () {

        it('should return false', function () {
          sinon.stub(console, 'log');
          mdlint.__get__('validateCodeBlock')({
            lang: 'json',
            code: 'aahkkh{key: a\'value\'}'
          }).should.not.be.ok;
          console.log.restore();
        });

        it('should log an error with the error output from JSON.parse', function () {
          var consoleSpy = sinon.stub(console, 'log');
          mdlint.__get__('validateCodeBlock')({
            lang: 'json',
            code: '{key: "value"}'
          });
          consoleSpy.lastCall.args[0].should.include('{key: "value"}');
          console.log.restore();
        });

      });

      it('should return true if the JSON is parsed successfully', function () {
        mdlint.__get__('validateCodeBlock')({
          lang: 'json',
          code: '{"key": "value"}'
        }).should.be.ok;
      });

    });

    describe('when parsing JavaScript code blocks', function () {

      describe('if the JavaScript cannot be parsed', function () {

        it('should return false', function () {
          sinon.stub(console, 'log');
          mdlint.__get__('validateCodeBlock')({
            lang: 'js',
            code: 'var x = ;\'test\';'
          }).should.not.be.ok;
          console.log.restore();
        });

        it('should log an error including the code block', function () {
          var consoleSpy = sinon.stub(console, 'log');
          mdlint.__get__('validateCodeBlock')({
            lang: 'js',
            code: 'var x = ;\'test\';'
          });
          consoleSpy.lastCall.args[0].should.include('var x');
          console.log.restore();
        });

      });

      it('should return true if the JavaScript is parsed successfully', function () {
        mdlint.__get__('validateCodeBlock')({
          lang: 'javascript',
          code: 'var x = \'test\';'
        }).should.be.ok;
      });

    });

  });

  describe('preprocessCode', function () {

    it('should remove comments from the beginning of code blocks', function () {
      mdlint.__get__('preprocessCode')('//\nvar x = 1;').should.eql('\nvar x = 1;');
    });

    it('should add a variable declaration to object literals', function () {
      mdlint.__get__('preprocessCode')('{}').should.eql('var json = {};');
    });

    it('should wrap a lone object property with a valid object', function () {
      mdlint.__get__('preprocessCode')('gruntplugin: {}').should.eql('var json = {gruntplugin: {}};');
    });

    it('should add a variable declaration to anonymous functions', function () {
      mdlint.__get__('preprocessCode')('function () {}').should.eql('var func = function () {};');
    });

    it('should replace ... with an empty string', function () {
      mdlint.__get__('preprocessCode')('...').should.eql('');
    });

  });

});