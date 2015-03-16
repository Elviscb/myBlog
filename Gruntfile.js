'use strict';

var _ = require("underscore");

module.exports = function(grunt) {

  var pkg = grunt.file.readJSON('package.json');

  // Project configuration.
  grunt.initConfig({
    pkg: pkg,
    // clean directories
    clean: {
      build: ['build/'],
      tmp: ['tmp/']
    },

    bower: {
      install: {
        options:{
          targetDir: "assets/"
        }
      }
    },

    copy: {
      tmpl:{
        files: [
          {expand: true, flatten: true, src: 'app/modules/*/tmpl/*', dest: 'build/local/tmpl/'}
        ]
      },
      js: {
        expand: true,
        flatten: true,
        src: [
          'app/modules/*/public/*.js'
        ],
        dest: 'build/public/js/'
      },
      css: {
        expand: true,
        flatten: true,
        src: [
          'app/modules/*/public/*.css'
        ],
        dest: 'build/public/css/'
      },
      less: {
        expand: true,
        flatten: true,
        src: [
          'app/modules/*/less/*.less'
        ],
        dest: 'build/local/less/'
      }
    },

    less: {
      production: {
        options: {
          compress: true,
          cleancss: true,
          yuicompress: true
        },
        files: [{
          expand: true,
          flatten:true,
          cwd: 'build/',
          src: ['local/less/*.less'],
          dest: 'build/public/css/',
          ext: '.css'
        }]
      }
    },

    watch: {
      less: {
        files: 'app/modules/*/less/*.less',
        tasks: ['copy:less','less:production']
      },
      css: {
        files: 'app/modules/*/public/*.css',
        tasks: ['copy:css']
      },
      js: {
        files: ['app/modules/*/public/*.js'],
        tasks: ['copy:js']
      },
      tmpl: {
        files: 'app/modules/*/tmpl/*',
        tasks: ['copy:tmpl']
      }
    }

  });

  // Load contrib tasks
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-bower-task');
  //grunt.loadNpmTasks('grunt-contrib-nodeunit');
  // Load local tasks
  grunt.loadTasks('tasks'); // bower,server

  grunt.registerTask('build', ['bower:install','clean', 'copy', 'less']);
  grunt.registerTask('serve', [ 'server']);
  grunt.registerTask('web', ['build','server']);
};
