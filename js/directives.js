/* 
 * @Author: Jonathan Baird
 * @Date:   2014-10-28 15:04:11
 * @Last Modified 2014-11-18
 * @Last Modified time: 2014-11-18 17:02:49
 */
(function() {
	var app = angular.module('App');

	/////////////////////////////////
	// Header Banner Directive //
	/////////////////////////////////
	app.directive('headerBanner', [

		function() {
			return {
				restrict: 'E',
				templateUrl: 'partials/directive-partials/header-banner.html',
			};
		}
	]);
	app.directive('completeHeader' [

		function() {
			return {
				restrict: 'E',
				templateUrl: 'partials/directive-partials/complete-header.html'
			};
		}
	]);
})();
