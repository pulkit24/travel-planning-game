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
					'app/scripts/components/*.js', 'app/scripts/app.settings.js', 'app/scripts/app.maps.js', 'app/scripts/app.widgets.js', 'app/scripts/app.js', 'app/scripts/filters/*.js', 'app/scripts/services/*.js', 'app/scripts/directives/*.js', 'app/scripts/controllers/*.js', '<%= html2js.main.dest %>'
				]
				, dest: 'app/dist/all.local.js'
			}
			, jsVendor: {
				src: [
					'app/bower_components/jquery/jquery.min.js', 'app/bower_components/es5-shim/es5-shim.min.js', 'app/bower_components/json3/lib/json3.min.js', 'app/bower_components/angular/angular.min.js', 'app/bower_components/underscore/underscore-min.js', 'app/bower_components/angular-bootstrap/ui-bootstrap-tpls.js', 'app/bower_components/angular-cookies/angular-cookies.min.js', 'app/bower_components/angular-resource/angular-resource.min.js', 'app/bower_components/angular-route/angular-route.min.js', 'app/bower_components/angular-sanitize/angular-sanitize.min.js', 'app/bower_components/angular-underscore/angular-underscore.js', 'app/bower_components/AngularGM/angular-gm.min.js'
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
					'app/bower_components/bootstrap/dist/css/bootstrap.min.css', 'app/bower_components/font-awesome/css/font-awesome.min.css', 'app/styles/*.css', 'app/styles/**/*.css'
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
			, livereload: {
				options: {
					open: true
					, base: ['app', '.']
				}
			}
		}
		, watch: {
			js: {
				files: ['app/scripts/{,*/}*.js']
				, tasks: [
					 'html2js', 'concat_byAuthor', 'ngmin', 'uglify', 'concat_all', 'copy:build', 'clean:post'
				]
				, options: {
					livereload: true
				}
			}
			, css: {
				files: ['app/styles/{,*/}*.css']
				, tasks: [
					'concat_all', 'cssmin', 'clean:post'
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
		}
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-ngmin');
	grunt.loadNpmTasks('grunt-html2js');

	grunt.registerTask('concat_byAuthor', [
		'concat:jsLocal', 'concat:jsVendor'
	]);
	grunt.registerTask('concat_all', [
		'concat:js', 'concat:css'
	]);
	grunt.registerTask('default', [
		'clean:pre', 'html2js', 'concat_byAuthor', 'ngmin', 'uglify', 'concat_all', 'cssmin', 'copy:build', 'clean:post', 'connect:livereload', 'watch'
	]);
	grunt.registerTask('dev', [
		'clean:pre', 'html2js', 'concat_byAuthor', 'concat_all', 'copy:build', 'connect:dev:keepalive'
	]);
};
