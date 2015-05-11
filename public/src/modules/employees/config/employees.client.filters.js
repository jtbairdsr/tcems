/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-01 15:29:42
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-01 15:31:47
 */

'use strict';
angular.module('employees').filter('employeeFilter', function(currentUser, positions) {
	var positionFTE = _.find(positions.list, function(position) {
		return position.Description === 'FTE';
	});
	return function(employees, params) {
		params.inactive = params.inactive || false;
		params.area = (currentUser.data.Area.Description === 'Director') ? false : params.area || false;
		params.position = params.position || false;
		params.retired = params.retired || false;
		if (params.retired) {
			employees = _.filter(employees, function(employee) {
				return employee.Retired;
			});
		} else {
			employees = _.filter(employees, function(employee) {
				return !employee.Retired;
			});
			if (params.inactive) {
				employees = _.filter(employees, function(employee) {
					return employee.Active;
				});
			}
		}
		if (params.area) {
			employees = _.filter(employees, function(employee) {
				return employee.Area.Id === currentUser.data.Area.Id;
			});
		}
		if (params.position) {
			employees = _.filter(employees, function(employee) {
				return employee.Position.Id !== positionFTE.Id;
			});
		}
		return employees;
	};
});
