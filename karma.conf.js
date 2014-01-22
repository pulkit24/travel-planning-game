// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
	config.set({
		// base path, that will be used to resolve files and exclude
		basePath: ''
		, // testing framework to use (jasmine/mocha/qunit/...)
		frameworks: ['jasmine']
		, // list of files / patterns to load in the browser
		files: [
			'app/vendor/angular/angular.js',
			'app/vendor/angular-mocks/angular-mocks.js',
			'app/vendor/angular-resource/angular-resource.js',
			'app/vendor/angular-cookies/angular-cookies.js',
			'app/vendor/angular-sanitize/angular-sanitize.js',
			'app/vendor/angular-route/angular-route.js',
			'app/vendor/AngularGM/angular-gm.js',
			'app/vendor/angular-bootstrap/ui-bootstrap-tpls.js',
			'app/vendor/underscore/underscore.js',
			'app/vendor/angular-underscore/angular-underscore.js',
			'app/vendor/angular-rome2rio/angular-rome2rio.min.js',
			'app/scripts/*.js',
			'app/scripts/**/*.js',
			'test/mock/**/*.js',
			'test/spec/**/*.js'
		]
		, // list of files / patterns to exclude
		exclude: []
		, // web server port
		port: 8080
		, // level of logging
		// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
		logLevel: config.LOG_INFO
		,
		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: false
		,
		// Start these browsers, currently available:
		// - Chrome
		// - ChromeCanary
		// - Firefox
		// - Opera
		// - Safari (only Mac)
		// - PhantomJS
		// - IE (only Windows)
		browsers: ['Chrome']
		,
		// Continuous Integration mode
		// if true, it capture browsers, run tests and exit
		singleRun: true
		, preprocessors: {
			'app/templates/*.html': ['ng-html2js']
		}
		, ngHtml2JsPreprocessor: {
			// strip this from the file path
			stripPrefix: 'app/'
			,
			// prepend this to the
			prependPrefix: '../../'
			,
			// setting this option will create only a single module that contains templates
			// from all the files, so you can load them all with module('foo')
			moduleName: 'templates'
		}
	});
};
