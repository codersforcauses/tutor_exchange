module.exports = function(grunt) {

  // CONFIGURE GRUNT
  grunt.initConfig({

    // Get configuration from package.json
    pkg: grunt.file.readJSON('package.json'),

    // Lint code with jshint
    jshint: {
      options: {
        reporter: require('jshint-stylish'),
      },
      files: ['Gruntfile.js', 'app/**/*.js'],
    },

    // Copy files
    copy: {
      html: {
        files: [
          {expand: true, src: ['app/index.html'], dest: 'dist/', flatten: 'true', filter: 'isFile',},
          {expand: true, src: ['app/templates/*.html'], dest: 'dist/templates/', flatten: 'true', filter: 'isFile',},
        ],
      },
    },

    // Concat files
    concat: {
      options: {
        // separator: ';',  // might break css files.
      },
      js: {
        src: ['app/**/*.js'],
        dest: 'dist/<%= pkg.name %>.js',
      },
      css: {
        src: ['app/**/*.css'],
        dest: 'dist/<%= pkg.name %>.css',
      },
    },

    // Minify concatenated js files
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
      },
      js: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.js.dest %>'],
        },
      },
    },

    // Minify concatenated css files
    cssmin: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
      },
      css: {
        files: {
          'dist/<%= pkg.name %>.min.css': ['<%= concat.css.dest %>'],
        },
      },
    },

  });


  // LOAD GRUNT PLUGINS

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // CREATE TASKS
  grunt.registerTask('default', ['copy', 'concat', 'uglify', 'cssmin']);

};