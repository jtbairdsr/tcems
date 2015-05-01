/*
 * @Author: Jonathan Baird
 * @Date:   2015-01-25 09:55:05
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-01 09:01:27
 */

'use strict';

var app = angular.module('shifts');

app.controller('MyScheduleCtrl', ['$q', '$scope', '$timeout', '$alert', 'generalService', 'dataService',
	function($q, $scope, $timeout, $alert, generalService, dataService) {
		console.log($scope.shift);

		/////////////////////////////
		// Set aliases to the data //
		/////////////////////////////
		var PROPERTIES = generalService.properties,
			CLASSES = dataService.classes,
			GET = dataService.get;

		var ctrl = this,
			day = $scope.day,
			shift = $scope.shift.shift,
			subShift, subRequest;
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
		if ($scope.shift.subRequest !== undefined) {
			subRequest = $scope.shift.subRequest;
		}

		ctrl.requestSub = function() {
			subShift.add()
				.then(refreshData());
		};
		ctrl.cancel = function() {
			if (subShift.NewRequestId) {
				subShift.NewRequestId = null;
				var dataCalls = [
					subShift.NewRequest.deactivate(),
					subShift.update()
				];
				$q.all(dataCalls)
					.then(refreshData());
			} else {
				subRequest.deactivate()
					.then(refreshData());
			}
		};
		ctrl.requestSubOfSub = function() {
			subShift.newRequest()
				.then(refreshData());
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
