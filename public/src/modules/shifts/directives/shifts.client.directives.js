/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-22 20:37:21
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-04 15:16:34
 */

'use strict';

var app = angular.module('shifts');

app.directive('tcemsFilterDays', [
	function() {
		return {
			restrict: 'E',
			templateUrl: 'src/modules/shifts/directives/filter-days.client.directive.html'
		};
	}
]);
app.directive('tcemsFilterPositions', [
	function() {
		return {
			restrict: 'E',
			templateUrl: 'src/modules/shifts/directives/filter-positions.client.directive.html'
		};
	}
]);
app.directive('tcemsFilterSemesters', [
	function() {
		return {
			restrict: 'E',
			templateUrl: 'src/modules/shifts/directives/filter-semesters.client.directive.html'
		};
	}
]);
