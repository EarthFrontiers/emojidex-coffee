module.exports = (grunt) ->

  # Project Configuration
  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')
    meta:
      banner:
        '/*\n' +
        ' *  <%= pkg.title || pkg.name %> - v<%= pkg.version %>\n' +
        ' *  <%= pkg.description %>\n' +
        ' *  <%= pkg.homepage %>\n' +
        ' *\n' +
        ' *  Made by <%= pkg.author.name %>\n' +
        ' *  Under <%= pkg.licenses[0].type %> License\n' +
        ' */\n'
    
    coffee:
      dist:
		options:
		  bare: true, join: true
		files:
          'src/build/<%= pkg.name %>.js': [
			'src/**/*.coffee'
		  ]

    concat:
	  options:
	    banner: "<%= meta.banner %>"
	  dist:
        src: 'src/build/<%= pkg.name %>.js'
		dest: 'dist/js/<%= pkg.name %>.js'

    uglify:
      dist:
        src: 'dist/js/<%= pkg.name %>.js'
        dest: 'dist/js/<%= pkg.name %>.min.js'
    
    watch:
	  coffee:
		files: ['src/**/*.coffee']
		tasks: ['compile', 'uglify', 'notify']

  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-concat'
  grunt.loadNpmTasks 'grunt-contrib-watch'

  grunt.registerTask 'compile', ['coffee', 'concat', 'copy']
  grunt.registerTask 'default', ['compile', 'uglify']
  # grunt.loadNpmTasks 'grunt-contrib-jshint'
  # grunt.registerTask 'travis', ['jshint']
