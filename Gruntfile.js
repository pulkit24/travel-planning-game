module.exports = function(grunt) {

	grunt.initConfig({
		clean: {
			pre: ["app/dist/*"]
			, post: ["app/dist/*", "!app/dist/*.min.*"]
		}
		, concat: {
			options: {
				stripBanners: true
			}
			, jsLocal: {
				src: [
					'app/scripts/components/*.js', 'app/scripts/app.*.js', 'app/scripts/app.js',
					'app/scripts/filters/*.js',
					'app/scripts/services/*.js', 'app/scripts/directives/*.js', 'app/scripts/controllers/*.js',
					'<%= html2js.main.dest %>'
				]
				, dest: 'app/dist/all.local.js'
			}
			, jsVendor: {
				src: [
					'app/vendor/jquery/jquery.min.js', 'app/vendor/es5-shim/es5-shim.min.js',
					'app/vendor/json3/lib/json3.min.js', 'app/vendor/angular/angular.min.js',
					'app/vendor/underscore/underscore-min.js',
					'app/vendor/angular-bootstrap/ui-bootstrap-tpls.js',
					'app/vendor/angular-cookies/angular-cookies.min.js',
					'app/vendor/angular-resource/angular-resource.min.js',
					'app/vendor/angular-route/angular-route.min.js',
					'app/vendor/angular-sanitize/angular-sanitize.min.js',
					'app/vendor/angular-underscore/angular-underscore.js',
					'app/vendor/AngularGM/angular-gm.min.js',
					'app/vendor/angular-rome2rio/angular-rome2rio.js',
					'app/vendor/state-tracker/state-tracker.min.js'
				]
				, dest: 'app/dist/all.vendor.js'
			}
			, js: {
				src: [
					'<%= concat.jsVendor.dest %>', '<%= concat.jsLocal.dest %>'
				]
				, dest: 'app/dist/all.js'
			}
			, css: {
				src: [
					'app/vendor/bootstrap/dist/css/bootstrap.min.css',
					'app/vendor/font-awesome/css/font-awesome.min.css', 'app/styles/*.css', 'app/styles/**/*.css'
				]
				, dest: 'app/dist/all.css'
			}
		}
		, ngmin: {
			dist: {
				files: [{
					expand: true
					, src: '<%= concat.jsLocal.dest %>'
					, dest: ''
				}]
			}
		}
		, uglify: {
			options: {
				banner: '/*! Travel Planning Game <%= grunt.template.today("dd-mm-yyyy") %> */\n'
			}
			, dist: {
				files: {
					'<%= concat.jsLocal.dest %>': ['<%= concat.jsLocal.dest %>']
				}
			}
		}
		, autoprefixer: {
			options: {
				browsers: ['last 2 versions', 'ie 8', 'ie 9']
			}
			, css: {
				src: '<%= concat.css.dest %>'
				, dest: '<%= concat.css.dest %>'
			}
		}
		, recess: {
			dist: {
				options: {
					compile: true
					, includePath: 'app/styles'
				}
				, src: 'app/styles/{,*/}*.less'
				, dest: 'app/styles/less-compiled.css'
			}
		}
		, cssmin: {
			minify: {
				expand: true
				, src: '<%= concat.css.dest %>'
				, dest: ''
			}
		}
		, copy: {
			build: {
				files: [{
					expand: false
					, src: '<%= concat.css.dest %>'
					, dest: 'app/dist/all.min.css'
				}, {
					expand: false
					, src: '<%= concat.js.dest %>'
					, dest: 'app/dist/all.min.js'
				}]
			}
		}
		, html2js: {
			options: {
				module: 'travelPlanningGame.templates'
				, useStrict: true
				, quoteChar: '\''
				, rename: function(name) {
					return name.replace('../app/', '');
				}
			}
			, main: {
				src: ['app/templates/*']
				, dest: 'app/dist/app.templates.js'
			}
		}
		, connect: {
			options: {
				port: 9000
				, hostname: 'localhost'
				, livereload: 35729
			}
			, dev: {
				options: {
					open: true
					, base: ['app', '.']
				}
			}
			, test: {
				options: {
					port: 9001
					, base: [
						'test',
						'app'
					]
				}
			}
			, livereload: {
				options: {
					open: true
					, base: ['app', '.']
				}
			}
		}
		, concurrent: {
			options: {
				logConcurrentOutput: true
			}
			, main: {
				tasks: ['test', 'connect:livereload:keepalive', 'watch']
			}
		}
		, watch: {
			js: {
				files: ['app/scripts/{,*/}*.js']
				, tasks: [
					'html2js', 'concat_byAuthor', 'ngmin', 'uglify', 'concat_all', 'copy:build', 'clean:post',
					'targethtml'
				]
				, options: {
					livereload: true
				}
			}
			, css: {
				files: ['app/styles/{,*/}*.css', 'app/styles/{,*/}*.less']
				, tasks: [
					'concat_byAuthor', 'concat_all', 'autoprefixer', 'cssmin', 'copy:build', 'clean:post',
					'targethtml'
				]
				, options: {
					livereload: true
				}
			}
			, tpl: {
				files: ['app/templates/*.html']
				, tasks: '<%= watch.js.tasks %>'
				, options: {
					livereload: true
				}
			}
			, livereload: {
				options: {
					livereload: '<%= connect.options.livereload %>'
				}
				, files: [
					'app/{,*/}*.html',
					'app/styles/{,*/}*.css',
					'app/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
				]
			}
			, test: {
				files: ['test/spec/{,*/}*.js']
				, tasks: ['karma']
			}
			, dev: {
				files: [
					'app/scripts/{,*/}*.js', 'app/styles/{,*/}*.css', 'app/styles/{,*/}*.less', 'app/templates/*.html'
				]
				, tasks: [
					'html2js', 'concat_byAuthor', 'concat_all', 'autoprefixer', 'copy:build', 'targethtml'
				]
				, options: {
					livereload: true
				}
			}
		}
		, karma: {
			unit: {
				configFile: 'karma.conf.js'
			}
		}
		, targethtml: {
			main: {
				options: {
					curlyTags: {
						date: '<%= grunt.template.today("yyyymmddHHMMss") %>'
						, blockStart: '<!--(if target main)>'
						, blockEnd: '<!(endif)-->'
					}
				}
				, files: {
					'app/index.html': 'app/index.src.html'
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-concurrent');
	grunt.loadNpmTasks('grunt-ngmin');
	grunt.loadNpmTasks('grunt-html2js');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-targethtml');
	grunt.loadNpmTasks('grunt-recess');

	grunt.registerTask('concat_byAuthor', [
		'concat:jsLocal', 'concat:jsVendor'
	]);
	grunt.registerTask('concat_all', [
		'concat:js', 'recess', 'concat:css'
	]);
	grunt.registerTask('test', [
		'connect:test', 'karma'
	]);
	grunt.registerTask('default', [
		'clean:pre', 'html2js', 'concat_byAuthor', 'ngmin', 'uglify', 'concat_all', 'autoprefixer',
		'cssmin',
		'copy:build', 'clean:post', 'targethtml', 'concurrent:main'
	]);
	grunt.registerTask('dev', [
		'clean:pre', 'html2js', 'concat_byAuthor', 'concat_all', 'autoprefixer', 'copy:build',
		'targethtml', 'connect:dev', 'watch:dev'
	]);
};
