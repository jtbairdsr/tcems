/*
 * @Author: Jonathan Baird
 * @Date:   2015-01-25 09:55:05
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-14 15:41:30
 */

'use strict';

angular.module('shifts').controller('ScheduleChangeController', function(
	$scope, employees
) {
	var that = this;
	this.employees = [];
	this.FTEs = [];

	function newEmpItem(emp) {
		return {
			Id: emp.Id,
			id: emp.Id,
			desc: emp.toString('name'),
			pName: emp.PreferredName,
			fName: emp.FirstName,
			lName: emp.LastName,
			pos: emp.Position.Description,
			img: emp.Picture,
			add: false,
			admin: emp.Admin,
			aId: emp.AreaId,
			pId: emp.PositionId
		};
	}
	_.each(employees.list, function(emp) {
		if (emp.Active) {
			that.employees.push(newEmpItem(emp));
		}
	});
	this.breakRegex = /\n/;
	this.addEmployee = function() {
		$scope.employee.Schedule.add().then(function() {
			$scope.ctrl.refreshContent(true);
		});
	};
	this.removeEmployee = function() {
		$scope.employee.Schedule.deactivate().then(function() {
			$scope.ctrl.refreshContent(true);
		});
	};
	this.log = function(id) {
		$scope.employee.Schedule.EmployeeId = id;
		console.log($scope.employee.Schedule.EmployeeId);
	};

});
