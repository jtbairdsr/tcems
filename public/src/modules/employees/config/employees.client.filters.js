/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-01 15:29:42
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-11 17:43:10
 */

'use strict';
angular.module('employees').filter('employeeFilter', function(currentUser) {
	return function(employees, params) {
		params.inactive = params.inactive || false;
		params.area = (currentUser.data.Area.Description === 'Director') ? false : params.area || false;
		params.position = params.position || false;
		params.retired = params.retired || false;
		if (params.retired) {
			employees = _.filter(employees, function(employee) {
				return employee.ret;
			});
		} else {
			employees = _.filter(employees, function(employee) {
				return !employee.ret;
			});
			if (params.inactive) {
				employees = _.filter(employees, function(employee) {
					return employee.act;
				});
			}
		}
		if (params.area) {
			employees = _.filter(employees, function(employee) {
				return employee.aId === currentUser.data.Area.Id;
			});
		}
		if (params.position) {
			employees = _.filter(employees, function(employee) {
				return employee.pos !== 'FTE';
			});
		}
		return employees;
	};
});
