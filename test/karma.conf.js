module.exports = function(config){
	config.set({
		basePath : '../',
		files : [
			'app/bower_components/angular/angular.js',
			'app/bower_components/angular-route/angular-route.js',
			'app/bower_components/jquery/dist/jquery.js',
			'app/bower_components/bootstrap/dist/js/bootstrap.js',
			'app/bower_components/angular-resource/angular-resource.js',
			'app/bower_components/angular-sanitize/angular-sanitize.js',
			'app/bower_components/angular_ui_router/release/angular-ui-router.js',
			'app/bower_components/angular-strap/dist/angular-strap.js',
			'app/bower_components/angular-strap/dist/angular_strap.tpl.js',
			'app/bower_components/ui-utils/ui-utils.js',
			'app/bower_components/angular-ui-select/dist/select.js',
			'app/bower_components/angular-img-fallback/angular.dcb-img-fallback.js',
			'app/bower_components/angular-animate/angular-animate.js',
			'app/bower_components/angular-mocks/angular-mocks.js',
			'app/bower_components/datejs/build/production/date.js',
			'app/bower_components/filesaverjs/filesaver.js',
			'app/bower_components/underscore/underscore.js',
			'app/bower_components/Autolinker.js/dist/Autolinker.js',
			'app/bower_components/angular-loading-bar/build/loading-bar.js',
			'app/js/modules.js',
			//'app/js/generalService.js',
			//'app/js/dataService.js',
			//'app/js/**/*.js',
			//'test/unit/**/*.js'
		],
		autoWatch : true,
		frameworks: ['jasmine'],
		browsers : ['Chrome'],
		plugins : [
			'karma-chrome-launcher',
			'karma-firefox-launcher',
			'karma-jasmine'
			],
		junitReporter : {
			outputFile: 'test_out/unit.xml',
			suite: 'unit'
		}
	});
};
