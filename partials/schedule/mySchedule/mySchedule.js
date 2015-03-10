/*
 * @Author: Jonathan Baird
 * @Date:   2015-01-25 09:55:05
 * @Last Modified by:   jonathan
 * @Last Modified time: 2015-02-09 09:33:40
 */

(function() {
	'use strict';

	var app = angular.module('Schedule');

	app.controller('MyScheduleCtrl', ['$q', '$scope', '$timeout', '$alert', 'generalService', 'dataService',
		function($q, $scope, $timeout, $alert, generalService, dataService) {
			/////////////////////////////
			// Set aliases to the data //
			/////////////////////////////
			var PROPERTIES = generalService.properties,
				DATA = generalService.data,
				CLASSES = dataService.classes,
				SET = dataService.set,
				GET = dataService.get;

			var ctrl = this,
				day = $scope.day,
				shift = $scope.shift.shift,
				subShift, newRequest;
			if ($scope.shift.subShift === undefined) {
				subShift = new CLASSES.SubShift({
					ShiftId: shift.Id,
					Date: day.date,
					RequesterId: PROPERTIES.currentUser.Id,
					SemesterId: PROPERTIES.currentSemester.Id
				});
			} else {
				subShift = $scope.shift.subShift;
			}

			ctrl.requestSub = function() {
				subShift.add()
					.then(refreshData());
			};
			ctrl.cancel = function() {
				console.log(subShift);
				if (subShift.NewRequestId) {
					subShift.NewRequestId = null;
					var dataCalls = [
						subShift.NewRequest.deactivate(),
						subShift.update()
					];
					$q.all(dataCalls)
						.then(refreshData());
				} else {
					subShift.deactivate()
						.then(refreshData());
				}
			};
			ctrl.requestSubOfSub = function() {
				subShift.newRequest()
					.then(refreshData());
			};
			ctrl.dropShift = function() {
				var schedule = _.find(DATA.schedules, function(schedule) {
					return (
						schedule.Active &&
						schedule.ShiftId === shift.Id &&
						schedule.EmployeeId === PROPERTIES.currentUser.Id
					);
				});
				schedule.deactivate()
					.then(function() {
						dataService.refresh.data();
					});
			};

			function refreshData() {
				$timeout(function() {
					GET.subShifts()
						.then(function() {
							day.refresh();
						});
				}, 1000);

			}
		}
	]);
})();
