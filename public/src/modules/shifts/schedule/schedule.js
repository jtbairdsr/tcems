/*
 * @Author: Jonathan Baird
 * @Date:   2015-01-25 09:55:05
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-04-29 08:43:31
 */

'use strict';

angular.module('Schedule').controller('ScheduleCtrl', ['$scope',
	function($scope) {
		/////////////////////////////
		// Set aliases to the data //
		/////////////////////////////

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
