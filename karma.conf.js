'use strict';
module.exports = function(config) {
	config.set({
		// Base path, that will be used to resolve files and exclude
		basePath: './',

		frameworks: ['jasmine'],

		// List of files / patterns to load in the browser
		files: [

			// Libraries
			'public/src/lib/xdomain/dist/xdomain.js',
			'public/src/lib/angular/angular.js',
			'public/src/lib/angular-mocks/angular-mocks.js',
			'public/src/lib/angular-route/angular-route.js',
			'public/src/lib/jquery/dist/jquery.js',
			'public/src/lib/bootstrap/dist/js/bootstrap.js',
			'public/src/lib/angular-resource/angular-resource.js',
			'public/src/lib/angular-sanitize/angular-sanitize.js',
			'public/src/lib/angular-ui-router/release/angular-ui-router.js',
			'public/src/lib/angular-strap/dist/angular-strap.js',
			'public/src/lib/angular-strap/dist/angular-strap.tpl.js',
			'public/src/lib/ui-utils/ui-utils.js',
			'public/src/lib/angular-ui-select/dist/select.js',
			'public/src/lib/angular-img-fallback/angular.dcb-img-fallback.js',
			'public/src/lib/angular-animate/angular-animate.js',
			'public/src/lib/datejs/build/production/date.min.js',
			'public/src/lib/file-saver.js/FileSaver.js',
			'public/src/lib/underscore/underscore.js',
			'public/src/lib/Autolinker.js/dist/Autolinker.js',
			'public/src/lib/angular-loading-bar/build/loading-bar.js',

			// Modules
			'public/src/modules/config.js',
			'public/src/modules/application.js',

			// Core
			'public/src/modules/core/*.js',
			'public/src/modules/core/config/*.js',
			'public/src/modules/core/services/*.js',
			'public/src/modules/core/factories/**/*.js',
			'public/src/modules/core/directives/*.js',

			// Employees
			'public/src/modules/applications/*.js',
			'public/src/modules/applications/config/*.js',
			'public/src/modules/applications/factories/*.js',
			'public/src/modules/applications/controllers/*.js',
			'public/src/modules/applications/directives/*.js',

			// Employees
			'public/src/modules/employees/*.js',
			'public/src/modules/employees/config/*.js',
			'public/src/modules/employees/factories/*.js',
			'public/src/modules/employees/controllers/*.js',

			// Messages
			'public/src/modules/messages/*.js',
			'public/src/modules/messages/config/*.js',
			'public/src/modules/messages/services/*.js',
			'public/src/modules/messages/factories/**/*.js',
			'public/src/modules/messages/directives/*.js',
			'public/src/modules/messages/controllers/*.js',

			// Professors
			'public/src/modules/professors/*.js',
			'public/src/modules/professors/config/*.js',
			'public/src/modules/professors/services/*.js',
			'public/src/modules/professors/factories/**/*.js',
			'public/src/modules/professors/directives/*.js',
			'public/src/modules/professors/controllers/*.js',

			// Saras
			// 'public/src/modules/saras/*.js',
			// 'public/src/modules/saras/config/*.js',
			// 'public/src/modules/saras/services/*.js',
			// 'public/src/modules/saras/factories/**/*.js',
			// 'public/src/modules/saras/directives/*.js',
			// 'public/src/modules/saras/controllers/*.js',

			// Semesters
			'public/src/modules/semesters/*.js',
			'public/src/modules/semesters/config/*.js',
			'public/src/modules/semesters/services/*.js',
			'public/src/modules/semesters/factories/**/*.js',
			'public/src/modules/semesters/directives/*.js',
			'public/src/modules/semesters/controllers/*.js',

			// Shifts
			'public/src/modules/shifts/*.js',
			'public/src/modules/shifts/config/*.js',
			'public/src/modules/shifts/services/*.js',
			'public/src/modules/shifts/factories/**/*.js',
			'public/src/modules/shifts/directives/*.js',
			'public/src/modules/shifts/controllers/*.js',

			// User
			'public/src/modules/user/*.js',
			'public/src/modules/user/config/*.js',
			'public/src/modules/user/services/*.js',
			'public/src/modules/user/factories/**/*.js',
			'public/src/modules/user/directives/*.js',
			'public/src/modules/user/controllers/*.js',

			// Utilities
			'public/src/modules/utilities/*.js',
			'public/src/modules/utilities/config/*.js',
			'public/src/modules/utilities/services/*.js',
			'public/src/modules/utilities/factories/**/*.js',
			'public/src/modules/utilities/directives/*.js',
			'public/src/modules/utilities/controllers/*.js',

			// Tests
			'test/unit/modules/**/*.js'
		],

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
			// 'Safari'
			'Chrome'
		],

		plugins: [

			// 'karma-firefox-launcher',
			// 'karma-safari-launcher'
			'karma-jasmine',
			'karma-chrome-launcher'
		]
	});
};
