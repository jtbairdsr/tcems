/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-07 14:13:12
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-07 14:20:20
 */

'use strict';

angular.module('professors').service('professorService', function($q, Professor, FacultyTestingInfo) {
	var that = this;

	that.refresh = function() {
		var deffered = $q.defer();
		Professor.query().then(function() {
			FacultyTestingInfo.query().then(function() {
				deffered.resolve();
			});
		});
		return deffered.promise;
	};

	return that;
});
