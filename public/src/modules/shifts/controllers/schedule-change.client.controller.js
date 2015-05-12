/*
 * @Author: Jonathan Baird
 * @Date:   2015-01-25 09:55:05
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-04 09:51:20
 */

'use strict';

angular.module('shifts').controller('ScheduleChangeController', function(
	$scope, employees
) {
	var that = this;
	this.employees = [];
	_.each(employees.list, function(employee) {
		if (employee.Active) {
			that.employees.push({
				Id: employee.Id,
				Label: employee.Label,
				Position: employee.Position.Description,
				Area: employee.Area.Description
			});
		}
	});
	this.breakRegex = /\n/;
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

});
