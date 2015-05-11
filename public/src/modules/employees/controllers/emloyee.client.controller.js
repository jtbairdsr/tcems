/*
 * @Author: Jonathan Baird
 * @Date:   2014-10-28 15:04:11
 * @Last Modified 2014-11-18
 * @Last Modified time: 2015-05-11 17:43:41
 */

'use strict';

angular.module('employees').controller('EmployeeController', function(
	$scope, $modal, positions, currentUser, requiredData, employeeService, employees
) {
	$scope.currentApp.title = 'Directory';
	$scope.properties = {
		predicate: 'pName'
	};
	$scope.area = {
		Id: currentUser.data.Area.Id,
		hideOthers: true
	};
	$scope.position = {
		Id: _.find(positions.list, function(position) {
			return position.Description === 'FTE';
		}).Id,
		hide: true
	};
	$scope.retired = false;
	$scope.hideInactive = true;
	var that = this;
	that.employees = [];
	_.each(employees.list, function(emp) {
		that.employees.push({
			id: emp.Id,
			pos: emp.Position.Description,
			a: emp.Area.Description,
			track: (emp.Track) ? emp.Track.Description : '',
			phone: emp.PhoneNumber,
			email: emp.EmailAddress,
			inum: emp.INumber,
			pName: emp.PreferredName,
			lName: emp.LastName,
			img: emp.Picture,
			ret: emp.Retired,
			act: emp.Active,
			aId: emp.AreaId
		});
	});
	console.log(that.employees);
	that.refreshContent = function() {
		employeeService.refresh();
	};
});
