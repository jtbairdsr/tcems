/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-22 09:02:54
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-04-29 13:02:06
 */

'use strict';

// Start by defining the main module and adding the module dependencies
angular.module(
	ApplicationConfiguration.applicationModuleName,
	ApplicationConfiguration.applicationModuleVendorDependencies
);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');
	}
]);

// Then define the init function for starting up the application
angular.element(document).ready(function() {
	// Init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
