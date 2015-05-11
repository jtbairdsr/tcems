/*
 * @Author: Jonathan Baird
 * @Date:   2015-01-25 09:24:34
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-04 14:02:29
 */

'use strict';

angular.module('shifts').controller('MyAvailabilityController', function(
	$scope, $timeout, currentUser, currentSemester, Availability
) {
	var that = this,
		day = $scope.day,
		availability;

	if ($scope.availability === undefined) {
		that.add = true;
		$scope.availability = new Availability({
			Day: (day) ? day.title : 'Sunday',
			EmployeeId: currentUser.data.Id,
			SemesterId: currentSemester.data.Id,
			StartTime: Date.parse('8:00 AM'),
			EndTime: Date.parse('5:00 PM')
		});
		availability = $scope.availability;
	} else {
		that.add = false;
		availability = $scope.availability;
	}

	that.addAvailability = function() {
		availability.add()
			.then(refreshData());
	};

	that.updateAvailability = function() {
		availability.update()
			.then(refreshData());
	};

	that.removeAvailability = function() {
		availability.deactivate()
			.then(refreshData());
	};
	that.markUnavailable = function() {
		availability.Day = 'Sunday';
		availability.StartTime = new Date();
		availability.EndTime = new Date();
		availability.add()
			.then(refreshData());
	};

	function refreshData() {
		$timeout(function() {
			Availability.query()
				.then(function() {
					if ($scope.day) {
						day.refresh('myAvailabilities');
					}
				});
		}, 1000);

	}
});
