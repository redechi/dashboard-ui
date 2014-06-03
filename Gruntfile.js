'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to match all subfolders:
// 'test/spec/**/*.js'
// templateFramework: 'handlebars'

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  // show elapsed time at the end
  require('time-grunt')(grunt);

  // configurable paths
  var yeomanConfig = {
    app: '',
    dist: 'dist'
  };

  grunt.initConfig({
    yeoman: yeomanConfig,

    // watch list
    watch: {
      compass: {
        files: ["assets/scss/*.scss"],
        tasks: ["compass"]
      },

      handlebars: {
        files: ['templates/**'],
        tasks: ['handlebars']
      },

      copy: {
        files: [
          '*.{ico,txt}',
          '.htaccess',
          'index.html',
          'error.html',
          'assets/img/**'
        ],
        tasks: ["copy"] // copy files and invalidate app cache
      }
    },

    inline: {
      dist: {
        options:{
          uglify: true
        },
        src: [ 'dist/app.html' ]
      }
    },

    express: {
      dev: {
        options: {
          args: [grunt.option('token') || ''],
          script: 'index.js',
          delay: 100,
          port: 3000
        }
      }
    },

    // mocha command
    exec: {
      mocha: {
        command: 'mocha-phantomjs http://localhost:<%= connect.testserver.options.port %>/test',
        stdout: true
      }
    },

    // open app and test page
    open: {
      server: {
        path: 'http://localhost:<%= express.dev.options.port %>'
      }
    },

    clean: {
      dist: '<%= yeoman.dist %>/*',
    },

    appcache: {
      options: {
        basePath: '<%= yeoman.dist %>',
        ignoreManifest: true
      },
      your_target: {
        dest: '<%= yeoman.dist %>/manifest.appcache',
        cache: [
          '<%= yeoman.dist %>/assets/**/*',
          '<%= yeoman.dist %>/templates/**/*',
          '<%= yeoman.dist %>/scripts/**/*',
          '<%= yeoman.dist %>/*'
        ],
        network: '*'
        //  fallback: '/ /offline.html' // the fallback page if the index is unavailable.
      },
    },

    // require
    requirejs: {

      distMainCss: {
        options: {
          appDir: "<%= yeoman.app %>",
          optimizeCss: "standard",
          cssIn: "assets/css/main.css",
          out: "<%= yeoman.dist %>/assets/css/main.css",
          cssPrefix: ""
        }
      },

      distInlineCss: {
        options: {
          appDir: "<%= yeoman.app %>",
          optimizeCss: "standard",
          cssIn: "assets/css/inline.css",
          out: "<%= yeoman.dist %>/assets/css/inline.css",
          cssPrefix: ""
        }
      },

      distjs: {
        options: {
          appDir: "<%= yeoman.app %>",
          include: ["./main"],
          out: '<%= yeoman.dist %>/assets/js/main.js',
          name: 'init',
          baseUrl: 'scripts',
          optimize: 'uglify2',
          mainConfigFile: 'scripts/init.js',
          paths: {
              'templates': 'templates'
          },
          preserveLicenseComments: false,
          useStrict: true,
          wrap: true,
          uglify2: {
            output: {
                beautify: false
            },
            compress: {
                sequences: false,
                global_defs: {
                    DEBUG: false
                }
            },
            warnings: true,
            mangle: false
          },
          pragmasOnSave: {
            //removes Handlebars.Parser code (used to compile template strings) set
            //it to `false` if you need to parse template strings even after build
            excludeHbsParser : true,
            // kills the entire plugin set once it's built.
            excludeHbs: true,
            // removes i18n precompiler, handlebars and json2
            excludeAfterBuild: true
          }
        }
      }
    },

    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/assets/img',
          src: '{,*/}*.{png,jpg,jpeg}',
          dest: '<%= yeoman.dist %>/assets/img'
        }]
      }
    },

    htmlmin: {
      dist: {
        options: {
          removeCommentsFromCDATA: true,
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeRedundantAttributes: true
        /*
          removeAttributeQuotes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeOptionalTags: true
        */
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>',
          src: '*.html',
          dest: '<%= yeoman.dist %>'
        }]
      }
    },

    compass: {
      dist: {
        options: {
          config: 'config.rb'
        }
      }
    },

    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.{ico,txt}',
            '.htaccess',
            'index.html',
            'assets/img/**',
            'assets/js/**',
            'bower_components/requirejs/require.js',
            'bower_components/modernizr/modernizr.js'
          ]
        }]
      }
    },

    cdnify: {
      someTarget: {
        options: {
          base: '//d2dyje6jz36wpr.cloudfront.net/'
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>',
          src: '**/*.{css,html}',
          dest: '<%= yeoman.dist %>'
        }]
      }
    },

    // handlebars
    handlebars: {
      compile: {
        options: {
          namespace: 'JST',
          amd: true
        },
        files: {
          'scripts/templates.js': 'templates/**/*.hbs'
        }
      }
    }
  });

  grunt.registerTask('default', [
    'handlebars',
    'appcache',
    'express:dev',
    'open',
    'watch'
  ]);

  grunt.registerTask('test', [
    'handlebars',
    'compass',
    'connect:testserver',
    'exec:mocha'
  ]);

  grunt.registerTask('build', [
    'handlebars',
    'compass:dist',
    'requirejs',
    'imagemin',
    'htmlmin',
    'appcache',
    'copy',
    'inline',
    'cdnify'

// tests have been commented out.
// they fail because none have been written.
//
//    'connect:devserver',
//    'exec:mocha'
  ]);

};
