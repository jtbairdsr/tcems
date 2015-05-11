/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-04 15:24:20
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-04 17:18:37
 */

'use strict';

angular.module('employees').service('employeeService', function(
	$q, Employment, Track, AreaPosition
) {
	var that = this;

	that.refresh = function() {
		var deffered = $q.defer();
		$q.all([Employment.query(), AreaPosition.query(), Track.query()]).then(function() {
			deffered.resolve();
		});
		return deffered.promise;
	};
});
