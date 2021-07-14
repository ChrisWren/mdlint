module.exports = function (grunt) {

  var globalConfig = {};

  grunt.initConfig({
    globalConfig: globalConfig,
    jshint: {
      options: {
        esversion: 11,
        curly: true,
        eqeqeq: true,
        immed: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        node: true,
        globals: {
          describe: true,
          it: true,
          before: true,
          beforeEach: true,
          after: true,
          afterEach: true
        }
      },
      all: {
        src: ['*.js', 'test/*.js']
      }
    },
    simplemocha: {
      options: {
        timeout: 15000,
        ignoreLeaks: false,
        ui: 'bdd',
        reporter: 'spec'
      },
      all: {
        src: ['test/*.js']
      },
      spec: {
        src: ['test/<%= globalConfig.file %>Tests.js']
      }
    },
    watch: {
      tests: {
        files: ['test/**.js'],
        tasks: ['simplemocha']
      }
    }
  });

  grunt.registerTask('default', ['jshint', 'simplemocha:all']);

  grunt.registerTask('spec', 'Runs a task on a specified file', function (fileName) {
    globalConfig.file = fileName;
    grunt.task.run('simplemocha:spec');
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-contrib-watch');

};
