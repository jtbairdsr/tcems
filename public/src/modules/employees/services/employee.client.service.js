/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-04 15:24:20
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-14 14:17:24
 */

'use strict';

angular.module('employees').service('employeeService', function(
	$q, Employment, Employee, Track
) {
	var that = this;

	that.refresh = function(rEmps) {
		var deffered = $q.defer();

		function basicRefresh() {
			$q.all([Employment.query(), Track.query()]).then(function() {
				deffered.resolve();
			});
		}

		if (rEmps) {
			Employee.query().then(function() {
				basicRefresh();
			});
		} else {
			basicRefresh();
		}

		return deffered.promise;
	};
});
