'use strict';

var git = require('git-rev');
var build = process.env.BUILD_ID || 0;
var tagName = 'local';
var shortHash = 'local';
var CDN = process.env.CDN || '';


git.tag(function (tag) {
  tagName = tag;
});

git.short(function (short) {
  shortHash = short;
});


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
      options: {
        livereload: true
      },
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
          'assets/img/**',
          'assets/fonts/**'
        ],
        tasks: ["copy"] // copy files and invalidate app cache
      }
    },

    connect: {
      devserver: {
        options: {
          port: 1234,
          base: '<%= yeoman.app%>',
          middleware: function (connect, options, middlewares) {
            middlewares.unshift(function(req, res, next) {
              res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
              res.setHeader('Access-Control-Allow-Credentials', true);
              next();
            });
            return middlewares;
          }
        }
      },

      testserver: {
        options: {
          port: 1234,
          base: '<%= yeoman.dist%>',
          middleware: function (connect, options, middlewares) {
            middlewares.unshift(function(req, res, next) {
              res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
              res.setHeader('Access-Control-Allow-Credentials', true);
              
              //serve /assets/data folder compressed
              if(req.url.substr(0, 12) === '/assets/data') {
                res.setHeader('Content-Encoding', 'gzip');
              }

              next();
            });
            return middlewares;
          }
        }
      }
    },

    inline: {
      dist: {
        src: ['<%= yeoman.dist %>/*.html']
      }
    },

    mocha: {
      test: {
        src: ['test/**/*.html'],
      },
      options: {
        run: true,
      },
    },

    // open app and test page
    open: {
      server: {
        path: 'http://localhost:<%= connect.devserver.options.port %>'
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

      localjs: {
        options: {
          appDir: "<%= yeoman.app %>",
          include: ["./main"],
          out: '<%= yeoman.dist %>/assets/js/main.js',
          name: 'init',
          baseUrl: 'scripts',
          optimize: 'none',
          mainConfigFile: 'scripts/init.js',
          paths: {
              'templates': 'templates'
          },
          preserveLicenseComments: false,
          useStrict: true,
          wrap: true,
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
      },

      prodjs: {
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
            'index.html',
            'assets/img/**',
            'assets/fonts/**',
            'bower_components/requirejs/require.js',
            'bower_components/modernizr/modernizr.js',
            'bower_components/mapbox.css/index.css',
            'bower_components/bootstrap/dist/css/bootstrap.css',
            'bower_components/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.css',
            'bower_components/fontawesome/fonts/**',
            'bower_components/fontawesome/scss/**'
          ]
        }]
      }
    },

    cacheBust: {
      options: {
        encoding: 'utf8',
        algorithm: 'md5',
        length: 16
      },
      assets: {
        files: [{
          src: '<%= yeoman.dist %>/*.html'
        }]
      }
    },

    replace: {
      buildNumber: {
        src: '<%= yeoman.dist %>/*.html',
        overwrite: true,
        replacements: [{
          from: /{{--version--}}/ig,
          to: function () {
            return tagName + ' ' + '(' + build + ' #' + shortHash + ')';
          }
        }]
      }
    },

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
    },

    jshint: {
      all: ['scripts/**/*.js'],
      options: {
        jshintrc: './.jshintrc',
        reporter: 'checkstyle',
        reporterOutput: 'checkstyle-result.xml',
        force: true
      }
    },

    compress: {
      main: {
        options: {
          mode: 'gzip'
        },
        expand: true,
        cwd: '<%= yeoman.app %>',
        dest: '<%= yeoman.dist %>',
        src: ['assets/data/**']
      }
    }
  });

  grunt.registerTask('default', [
    'handlebars',
    'compass',
    'appcache',
    'connect:devserver',
    'open',
    'watch'
  ]);

  grunt.registerTask('test', [
    'handlebars',
    'compass',
    'connect:devserver',
    'mocha'
  ]);

  grunt.registerTask('build-local', [
    'handlebars',
    'compass:dist',
    'requirejs:distMainCss',
    'requirejs:distInlineCss',
    'requirejs:localjs',
    'htmlmin',
    'appcache',
    'copy',
    'compress',
    'replace',
    'inline',
    'cacheBust',
    'connect:testserver',
    'watch'
  ]);

  grunt.registerTask('build-prod', [
    'handlebars',
    'compass:dist',
    'requirejs:distMainCss',
    'requirejs:distInlineCss',
    'requirejs:prodjs',
    'htmlmin',
    'appcache',
    'copy',
    'compress',
    'replace',
    'inline',
    'cacheBust'
  ]);

};
