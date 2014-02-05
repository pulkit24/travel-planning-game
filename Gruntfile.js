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
			, localJS: {
				src: [
					'app/scripts/components/*.js', 'app/scripts/app.*.js', 'app/scripts/app.js',
					'app/scripts/filters/*.js',
					'app/scripts/services/*.js', 'app/scripts/directives/*.js', 'app/scripts/controllers/*.js',
					'<%= html2js.main.dest %>'
				]
				, dest: 'app/dist/local.js'
			}
			, vendorJS: {
				src: [
					'app/vendor/bower_components/jquery/jquery.min.js', 'app/vendor/bower_components/es5-shim/es5-shim.min.js',
					'app/vendor/bower_components/json3/lib/json3.min.js', 'app/vendor/bower_components/angular/angular.min.js',
					'app/vendor/bower_components/underscore/underscore-min.js',
					'app/vendor/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
					'app/vendor/bower_components/angular-cookies/angular-cookies.min.js',
					'app/vendor/bower_components/angular-resource/angular-resource.min.js',
					'app/vendor/bower_components/angular-route/angular-route.min.js',
					'app/vendor/bower_components/angular-sanitize/angular-sanitize.min.js',
					'app/vendor/bower_components/angular-underscore/angular-underscore.js',
					'app/vendor/bower_components/AngularGM/angular-gm.min.js',
					'app/vendor/angular-rome2rio/angular-rome2rio.min.js',
					'app/vendor/state-tracker/state-tracker.min.js'
				]
				, dest: 'app/dist/vendor.js'
			}
			, localCSS: {
				src: [
					'app/styles/*.css', 'app/styles/**/*.css'
				]
				, dest: 'app/dist/local.css'
			}
			, vendorCSS: {
				src: [
					'app/vendor/bower_components/bootstrap/dist/css/bootstrap.min.css',
					'app/vendor/bower_components/font-awesome/css/font-awesome.min.css',
					'app/vendor/animate/animate.min.css'
				]
				, dest: 'app/dist/vendor.css'
			}
		}
		, ngmin: {
			dist: {
				files: [{
					expand: true
					, src: '<%= concat.localJS.dest %>'
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
					'<%= concat.localJS.dest %>': ['<%= concat.localJS.dest %>']
				}
			}
		}
		, autoprefixer: {
			options: {
				browsers: ['last 2 versions', 'ie 8', 'ie 9']
			}
			, localCSS: {
				src: '<%= concat.localCSS.dest %>'
				, dest: '<%= concat.localCSS.dest %>'
			}
		}
		, recess: {
			dist: {
				options: {
					compile: true
					, includePath: 'app/styles'
				}
				, src: 'app/styles/main.less'
				, dest: 'app/styles/less-compiled.css'
			}
		}
		, cssmin: {
			minify: {
				expand: true
				, src: ['<%= concat.vendorCSS.dest %>', '<%= concat.localCSS.dest %>']
				, dest: ''
			}
		}
		, copy: {
			build: {
				files: [{
					expand: false
					, src: '<%= concat.localCSS.dest %>'
					, dest: 'app/dist/local.min.css'
				}, {
					expand: false
					, src: '<%= concat.vendorCSS.dest %>'
					, dest: 'app/dist/vendor.min.css'
				}, {
					expand: false
					, src: '<%= concat.localJS.dest %>'
					, dest: 'app/dist/local.min.js'
				}, {
					expand: false
					, src: '<%= concat.vendorJS.dest %>'
					, dest: 'app/dist/vendor.min.js'
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
					'html2js', 'concat', 'ngmin', 'uglify', 'copy:build', 'clean:post',
					'targethtml'
				]
				, options: {
					livereload: true
				}
			}
			, css: {
				files: ['app/styles/{,*/}*.css', 'app/styles/{,*/}*.less']
				, tasks: [
					'recess', 'concat', 'autoprefixer', 'cssmin', 'copy:build', 'clean:post',
					'targethtml'
				]
				, options: {
					livereload: true
				}
			}
			, tpl: {
				files: ['app/templates/*.html', 'app/index.src.html']
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
					'app/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
					'app/dist/*'
				]
			}
			, test: {
				files: ['test/spec/{,*/}*.js']
				, tasks: ['karma']
			}
			, dev: {
				files: [
					'app/scripts/{,*/}*.js', 'app/styles/{,*/}*.css', 'app/styles/{,*/}*.less', 'app/templates/*.html', 'app/index.src.html'
				]
				, tasks: [
					'html2js', 'recess', 'concat', 'autoprefixer', 'copy:build', 'targethtml'
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

	grunt.registerTask('test', [
		'connect:test', 'karma'
	]);
	grunt.registerTask('default', [
		'clean:pre', 'html2js', 'recess', 'concat', 'ngmin', 'uglify', 'autoprefixer', 'cssmin',
		'copy:build', 'clean:post', 'targethtml', 'concurrent:main'
	]);
	grunt.registerTask('dev', [
		'clean:pre', 'html2js', 'recess', 'concat', 'autoprefixer', 'copy:build',
		'targethtml', 'connect:dev', 'watch:dev'
	]);
};
