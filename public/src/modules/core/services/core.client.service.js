/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-04 17:21:51
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-07 14:18:31
 */

'use strict';

angular.module('core').service('coreService', function(
	$q, User, ShiftGroup, Professor, Employee, Semester,
	FacultyTestingInfo, Message, SentMessage, currentUser, currentSemester,
	nextSemester, semesters, messageService, positions
) {
	var that = this;

	that.refresh = function(getUser) {

		function initBasicData(promise) {
			function initSemesters(promise) {
				currentSemester.data = _.find(semesters.list, function(semester) {
					return semester.Active;
				});
				semesters.currentSemester = currentSemester.data;
				if (currentSemester.NextSemesterId !== undefined) {
					nextSemester.data = _.find(semesters.list, function(semester) {
						return semester.Id === currentSemester.data.NextSemesterId;
					});
				}
				semesters.nextSemester = nextSemester.data;
				messageService.refresh().then(function() {
					promise.resolve();
				});
			}

			_.each(positions.list, function(pos) {
				pos.setAccess();
				pos.setActive();
			});

			ShiftGroup.query().then(function() {
				$q.all([Employee.queryAll(), Semester.query()]).then(function() {
					initSemesters(promise);
				});
			});
		}

		var deffered = $q.defer();
		if (getUser) {
			User.GET().then(function() {
				initBasicData(deffered);
			});
		} else {
			initBasicData(deffered);
		}
		return deffered.promise;
	};

	return this;
});
