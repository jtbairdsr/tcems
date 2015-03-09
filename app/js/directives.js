/*
 * @Author: Jonathan Baird
 * @Date:   2014-10-28 15:04:11
 * @Last Modified 2014-11-18
 * @Last Modified time: 2015-01-24 19:27:21
 */
(function() {
	var app = angular.module('Services');

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
	app.directive('autolinker', function() {
		return {
			restrict: 'E',
			scope: {
				text: '='
			},
			link: function(scope, element, attrs) {
				scope.$watch("text", function(new_value) {
					if (new_value !== undefined) {
						element.html(Autolinker.link(new_value, {
							email: false,
							twitter: false
						}));
					}
				});
			}
		};
	});
	app.directive('filterDays', [
		function() {
			return {
				restrict: 'E',
				templateUrl: 'partials/directive-partials/filter-days.html'
			};
		}
	]);
	app.directive('filterPositions', [
		function() {
			return {
				restrict: 'E',
				templateUrl: 'partials/directive-partials/filter-positions.html'
			};
		}
	]);
	app.directive('filterSemesters', [
		function() {
			return {
				restrict: 'E',
				templateUrl: 'partials/directive-partials/filter-semesters.html'
			};
		}
	]);
	app.directive('refresh', [
		function() {
			return {
				restrict: 'E',
				templateUrl: 'partials/directive-partials/refresh.html'
			};
		}
	]);
	app.directive('buffer', [
		function() {
			return {
				restrict: 'E',
				templateUrl: 'partials/directive-partials/buffer.html'
			};
		}
	]);
	app.directive('daySearch', [
		function() {
			return {
				restrict: 'E',
				templateUrl: 'partials/directive-partials/day-search.html'
			};
		}
	]);
})();
