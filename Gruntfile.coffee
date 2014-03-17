module.exports = (grunt) ->
  grunt.initConfig
    
    # Import package manifest
    pkg: grunt.file.readJSON("emojidex.jquery.json")
    
    # Banner definitions
    meta:
      banner:
        "/*\n" +
        " *  <%= pkg.title || pkg.name %> - v<%= pkg.version %>\n" +
        " *  <%= pkg.description %>\n" +
        " *  <%= pkg.homepage %>\n" +
        " *\n" +
        " *  Made by <%= pkg.author.name %>\n" +
        " *  Under <%= pkg.licenses[0].type %> License\n" +
        " */\n"
    
    # CoffeeScript compilation
    coffee:
      compile:
        files:
          "dist/jquery.emojidex.js": "src/jquery.emojidex.coffee"
          "dist/test.js": "src/test.coffee"


    # Concat definitions
    concat:
      dist:
        src: ["src/jquery.emojidex.js"]
        dest: "dist/jquery.emojidex.js"

      options:
        banner: "<%= meta.banner %>"
    
    # Minify definitions
    uglify:
      my_target:
        src: ["dist/jquery.emojidex.js"]
        dest: "dist/jquery.emojidex.min.js"

      options:
        banner: "<%= meta.banner %>"
    
    # Watch definitions
    watch:
      files: ["src/**/*.coffee"]
      tasks: ["coffee", "concat", "uglify"]

    # Lint definitions
    # jshint:
    #   files: ["src/jquery.emojidex.js"]
    #   options:
    #     jshintrc: ".jshintrc"

  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-contrib-concat"
  grunt.loadNpmTasks "grunt-contrib-uglify"
  grunt.loadNpmTasks "grunt-contrib-watch"
  # grunt.loadNpmTasks "grunt-contrib-jshint"
  grunt.registerTask "default", ["coffee", "concat", "uglify"]
  grunt.registerTask "travis", ["jshint"]