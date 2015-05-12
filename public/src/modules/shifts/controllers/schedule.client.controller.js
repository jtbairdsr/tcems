/*
 * @Author: Jonathan Baird
 * @Date:   2014-10-28 15:04:12
 * @Last Modified 2014-12-08
 * @Last Modified time: 2015-05-11 15:22:37
 */

'use strict';

angular.module('shifts').controller('ScheduleController', function(
	$location, $scope, scheduleService, requiredData
) {
	$scope.currentApp.title = 'Schedule';
	$scope.scheduleProperties = scheduleService.scheduleProperties;
	$scope.noAvailabilityEmployees = requiredData;
	$scope.resetView = scheduleService.resetView;

	var that = this;

	that.refreshContent = function() {
		var pathTester = /main\/schedule\/(availability|myAvailability)/;
		console.log($location.path());
		if (pathTester.test($location.path())) {
			scheduleService.refresh(true).then(function(data) {
				$scope.noAvailabilityEmployees = data;
			});
		} else {
			scheduleService.refresh();
		}
	};

	that.queryDate = Date.today();
	that.getDay = function() {
		that.today = scheduleService.getDay(that.queryDate);
	};
	that.breakRegex = /\n\r?/g;
	that.semester = 'currentSemester';
	if (that.today === undefined) {
		that.getDay();
	}

	$scope.toggle = true;
	that.activePanel = -1;
});
