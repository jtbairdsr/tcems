/*
 * @Author: Jonathan Baird
 * @Date:   2015-01-25 09:55:05
 * @Last Modified by:   jonathan
 * @Last Modified time: 2015-02-03 08:51:46
 */

(function() {
	'use strict';

	var app = angular.module('Schedule');

	app.controller('ScheduleCtrl', ['$scope', '$timeout', '$alert', 'generalService', 'dataService',
		function($scope, $timeout, $alert, generalService, dataService) {
			/////////////////////////////
			// Set aliases to the data //
			/////////////////////////////
			var PROPERTIES = generalService.properties,
				CLASSES = dataService.classes,
				SET = dataService.set,
				GET = dataService.get;

			var day = $scope.day,
				shift = $scope.shift.shift,
				subShift;

			console.log($scope.employee.Schedule);
			this.addEmployee = function() {
				$scope.employee.Schedule.add()
					.then(function() {
						$scope.ctrl.refreshContent(true);
					});
			};
			this.removeEmployee = function() {
				$scope.employee.Schedule.deactivate()
					.then(function() {
						$scope.ctrl.refreshContent(true);
					});
			};

		}
	]);
})();
