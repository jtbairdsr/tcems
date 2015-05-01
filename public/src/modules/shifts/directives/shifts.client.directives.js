/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-22 20:37:21
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-01 10:09:43
 */

'use strict';

var app = angular.module('shifts');

app.directive('tcemsFilterDays', [
	function() {
		return {
			restrict: 'E',
			templateUrl: 'src/modules/shifts/directives/filter-days.html'
		};
	}
]);
app.directive('tcemsFilterPositions', [
	function() {
		return {
			restrict: 'E',
			templateUrl: 'src/modules/shifts/directives/filter-positions.html'
		};
	}
]);
app.directive('tcemsFilterSemesters', [
	function() {
		return {
			restrict: 'E',
			templateUrl: 'src/modules/shifts/directives/filter-semesters.html'
		};
	}
]);
app.directive('tcemsDaySearch', [
	function() {
		return {
			restrict: 'E',
			templateUrl: 'src/modules/shifts/directives/day-search.html'
		};
	}
]);
