module.exports = function (grunt) {

  var globalConfig = {};

  grunt.initConfig({
    globalConfig: globalConfig,
    jshint: {
      options: {
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
          it: true
        }
      },
      all: {
        src: ['*.js', 'test/*.js']
      }
    },
    simplemocha: {
      options: {
        globals: ['should'],
        timeout: 10000,
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

  grunt.registerTask('default', ['jshint', 'simplemocha']);

  grunt.registerTask('spec', 'Runs a task on a specified file', function (fileName) {
    globalConfig.file = fileName;
    grunt.task.run('simplemocha:spec');
  });

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

};
