/*
 * @Author: Jonathan Baird
 * @Date:   2015-01-25 09:55:05
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-04 13:21:28
 */

'use strict';

angular.module('shifts').controller('MyScheduleController', function(
	$q, $scope, $timeout, currentUser, currentSemester, SubShift
) {
	var that = this,
		day = $scope.day,
		shift = $scope.shift.shift,
		subShift, subRequest;
	if ($scope.shift.subShift === undefined) {
		subShift = new SubShift({
			ShiftId: shift.Id,
			Date: day.date,
			RequesterId: currentUser.data.Id,
			SemesterId: currentSemester.data.Id
		});
	} else {
		subShift = $scope.shift.subShift;
	}
	if ($scope.shift.subRequest !== undefined) {
		subRequest = $scope.shift.subRequest;
	}

	that.requestSub = function() {
		subShift.add()
			.then(refreshData());
	};
	that.cancel = function() {
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
	that.requestSubOfSub = function() {
		subShift.newRequest()
			.then(refreshData());
	};

	function refreshData() {
		$timeout(function() {
			SubShift.query()
				.then(function() {
					day.refresh('myShifts');
				});
		}, 1000);

	}
});
