/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-22 09:08:35
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-01 09:06:03
 */

/* exported ApplicationConfiguration */

'use strict';

/* XDomain slave declaration */
xdomain.slaves({
	'https://inet.byui.edu': '/sites/TestingServices/m/proxy.aspx'
});

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
	// Init module configuration options
	var applicationModuleName = 'tcems',
		applicationModuleVendorDependencies = [
			'ngRoute',
			'ngAnimate',
			'ngSanitize',
			'cfp.loadingBar',
			'dcbImgFallback',
			'mgcrea.ngStrap',
			'ui.router',
			'ui.select',
			'ui.utils'
		],
		/**
		 * Adds a new module to the app
		 *
		 * @param      {String}      moduleName      the name of the new module
		 * @param      {[String]}    dependencies    an array of strings that
		 *                                               represent the dependencies
		 */
		registerModule = function(moduleName, dependencies) {
			// Create angular module
			angular.module(moduleName, dependencies || []);

			// Add the module to the AngularJS configuration file
			angular.module(applicationModuleName).requires.push(moduleName);
		};

	return {
		applicationModuleName: applicationModuleName,
		applicationModuleVendorDependencies: applicationModuleVendorDependencies,
		registerModule: registerModule
	};
})();
