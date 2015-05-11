/*
 * @Author: Jonathan Baird
 * @Date:   2014-10-28 15:04:11
 * @Last Modified 2014-11-18
 * @Last Modified time: 2015-05-01 07:43:03
 */

(function() {
	'use strict';
	var app = angular.module('core');

	app.directive('tcemsHeaderBanner', [
		function() {
			return {
				restrict: 'E',
				templateUrl: 'src/modules/core/directives/header-banner.client.directive.html'
			};
		}
	]);
	app.directive('tcemsCompleteHeader' [
		function() {
			return {
				restrict: 'E',
				templateUrl: 'src/modules/core/directives/complete-header.client.directive.html'
			};
		}
	]);
	app.directive('tcemsAutolinker', function() {
		return {
			restrict: 'E',
			scope: {
				text: '='
			},
			link: function(scope, element) {
				scope.$watch('text', function(newValue) {
					if (newValue !== undefined) {
						element.html(Autolinker.link(newValue, {
							email: false,
							twitter: false
						}));
					}
				});
			}
		};
	});
	app.directive('tcemsRefresh', [
		function() {
			return {
				restrict: 'E',
				templateUrl: 'src/modules/core/directives/refresh.client.directive.html'
			};
		}
	]);
	app.directive('tcemsBuffer', [
		function() {
			return {
				restrict: 'E',
				templateUrl: 'src/modules/core/directives/buffer.client.directive.html'
			};
		}
	]);
})();
