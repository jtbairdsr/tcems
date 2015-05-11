/*
 * @Author: Jonathan Baird
 * @Date:   2014-10-28 15:04:11
 * @Last Modified 2014-11-18
 * @Last Modified time: 2015-05-04 15:57:53
 */

'use strict';

angular.module('employees').controller('EmployeeController', function(
	$scope, $modal, positions, currentUser, requiredData, employeeService
) {
	$scope.currentApp.title = 'Directory';
	$scope.properties = {
		predicate: 'PreferredName'
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
	that.refreshContent = function() {
		employeeService.refresh();
	};
});
