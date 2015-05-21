'use strict';

// List of files / patterns to load in the browser
var orderedJsFiles = [
	'public/src/lib/xdomain/dist/xdomain.min.js',
	'public/src/lib/jquery/dist/jquery.min.js',
	'public/src/lib/bootstrap/dist/js/bootstrap.min.js',
	'public/src/lib/angular/angular.min.js',
	'public/src/lib/angular-resource/angular-resource.min.js',
	'public/src/lib/angular-route/angular-route.min.js',
	'public/src/lib/angular-animate/angular-animate.min.js',
	'public/src/lib/angular-sanitize/angular-sanitize.min.js',
	'public/src/lib/angular-ui-router/release/angular-ui-router.min.js',
	'public/src/lib/angular-strap/dist/angular-strap.min.js',
	'public/src/lib/angular-strap/dist/angular-strap.min.tpl.js',
	'public/src/lib/ui-utils/ui-utils.min.js',
	'public/src/lib/angular-ui-select/dist/select.min.js',
	'public/src/lib/angular-img-fallback/angular.dcb-img-fallback.min.js',
	'public/src/lib/datejs/build/production/date.min.js',
	'public/src/lib/file-saver.js/FileSaver.min.js',
	'public/src/lib/underscore/underscore-min.js',
	'public/src/lib/Autolinker.js/dist/Autolinker.min.js',
	'public/src/lib/angular-loading-bar/build/loading-bar.min.js',
	'public/src/lib/angular-mocks/angular-mocks.js',
	'public/src/modules/config.js',
	'public/src/modules/application.js',
	'public/src/modules/applications/*.js',
	'public/src/modules/applications/**/*.js',
	'public/src/modules/core/*.js',
	'public/src/modules/core/**/*.js',
	'public/src/modules/employees/*.js',
	'public/src/modules/employees/**/*.js',
	'public/src/modules/hr/*.js',
	'public/src/modules/hr/**/*.js',
	'public/src/modules/messages/*.js',
	'public/src/modules/messages/**/*.js',
	'public/src/modules/professors/*.js',
	'public/src/modules/professors/**/*.js',
	'public/src/modules/semesters/*.js',
	'public/src/modules/semesters/**/*.js',
	'public/src/modules/shifts/*.js',
	'public/src/modules/shifts/**/*.js',
	'public/src/modules/user/*.js',
	'public/src/modules/user/**/*.js',
	'public/src/modules/utilities/*.js',
	'public/src/modules/utilities/**/*.js',
	'test/unit/modules/**/*.js'
];

module.exports = function(config) {
	config.set({
		// Base path, that will be used to resolve files and exclude
		basePath: './',
		frameworks: ['jasmine'],
		files: orderedJsFiles,

		// List of files to exclude
		exclude: [],

		// Use dots reporter, as travis terminal does not support escaping sequences
		// possible values: 'dots', 'progress'
		// CLI --reporters progress
		// reporters: [
		// 	'progress',
		// 	'junit'
		// ],

		// JunitReporter : {
		// 	// will be resolved to basePath (in the same way as files/exclude patterns)
		// 	OutputFile: 'test_out/unit.xml',
		// 	suite: 'unit'
		// },

		// Web server port

		// Enable / disable watching file and executing tests whenever any file changes
		// CLI --auto-watch --no-auto-watch
		autoWatch: true,

		// Start these browsers, currently available:
		// - Chrome
		// - ChromeCanary
		// - Firefox
		// - Opera
		// - Safari (only Mac)
		// - PhantomJS
		// - IE (only Windows)
		// CLI --browsers Chrome,Firefox,Safari
		browsers: [

			// 'Firefox',
			// 'Safari',
			'Chrome'
		],
		plugins: [

			// 'karma-firefox-launcher',
			// 'karma-safari-launcher',
			'karma-jasmine',
			'karma-chrome-launcher'
		]
	});
};
