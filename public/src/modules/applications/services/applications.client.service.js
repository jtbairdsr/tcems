/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-19 11:12:33
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-19 11:50:58
 */

'use strict';

angular.module('applications').service('applicationService', function(
	$q, AApp, APApp, PApp, Question, Response
) {

	this.refresh = function() {
		var deffered = $q.defer();

		Question.query().then(function() {
			$q.all([Response.query(), AApp.query(), APApp.query(), PApp.query()]).then(function() {
				deffered.resolve();
			});
		});
		return deffered.promise;
	};
});

