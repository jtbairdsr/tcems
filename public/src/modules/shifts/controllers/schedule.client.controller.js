/*
 * @Author: Jonathan Baird
 * @Date:   2014-10-28 15:04:12
 * @Last Modified 2014-12-08
 * @Last Modified time: 2015-05-04 14:53:26
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
		var pathTester = /(availability|myAvailability)/;
		if (pathTester.test($location.path().split('/'))) {
			scheduleService.refresh(true);
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
