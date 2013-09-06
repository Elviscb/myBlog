'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // server port, used to serve the site and run tests
    server_port: 5678,
    // clean directories
    clean: {
      article: ['build/article'],
      build: ['build/'],
      tmp: ['tmp/']
    },
    // compile less -> css
    less: {
      development: {
        options: {
          paths: ["src/less"]
        },
        files: {
          "build/css/main.css": "src/less/main.less"
        }
      },
      production: {
        options: {
          paths: ["src/less"],
          yuicompress: true
        },
        files: {
          "build/css/main.css": "src/less/main.less"
        }
      }
    },

    watch: {
//      static: {
//        files: 'src/less/*.less',
//        tasks: ['less:development']
//      },
//      less: {
//        files: 'src/less/*.less',
//        tasks: ['less:development']
//      },
//      article: {
//        files: 'articles/mds/*.md',
//        tasks: ['clean:article','article']
//      },

        assets: {
            files: ['app/modules/*/public/**','app/public/**','src/**'],
            tasks: ['copy:assets']
        },

        root: {
            files: ['app/model/*/tmpl/*','app/modules/*/tmpl/*','app/tmpl/*'],
            tasks: ['copy:root']
        }

    },

    // compile page layouts
    jade: {
      notfound: {
        options: {
          data: {
            page: 'notfound',
            title: '404 Not Found'
          }
        },
        files: {
          //"build/404.html": "src/tmpl/404.jade"
        }
      }
    },

    concat: {
      // if we add more js, modify this properly
      plugins: {
        src: [
          'src/javascripts/modules/*.js',
          'src/javascripts/*.js'
        ],
        dest: 'build/js/main.js'
      }
    },

    jshint: {
      all: ['Gruntfile.js', 'tasks/*.js'],
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        node: true,
        es5: true
      }
    },

    // copy site source files
    copy: {
      assets: {
        files: [
            {expand: true, cwd: 'src/', src: ['**'], dest: 'build/public'},
            {expand: true, flatten:true, cwd: 'app/modules', src: ['*/public/**'], dest: 'build/public'},
            {expand: true, flatten:true, cwd: 'app/public', src: ['**'], dest: 'build/public'}
        ]
      },
      root: {
        files: [
            {expand: true, flatten:true, cwd: 'app/tmpl', src: ['*'], dest: 'build/local'},
            {expand: true, flatten:true, cwd: 'app/model', src: ['*/tmpl/*'], dest: 'build/local'},
            {expand: true, flatten:true, cwd: 'app/modules', src: ['*/tmpl/*'], dest: 'build/local'}
        ]
      }
    },
    nodeunit: {
      all: ['test/*_test.js']
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
  //grunt.loadNpmTasks('grunt-contrib-nodeunit');
  // Load local tasks
  grunt.loadTasks('tasks'); // getWiki, docs tasks
  
  grunt.registerTask('build', ['clean', 'copy', 'jade']);
  grunt.registerTask('default', ['build', 'serve']);
  grunt.registerTask('dev', ['build', 'watch']);
  //grunt.registerTask('test', ['nodeunit']);
  grunt.registerTask('serve', ['server']);
};
