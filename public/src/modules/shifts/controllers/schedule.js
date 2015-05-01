/*
 * @Author: Jonathan Baird
 * @Date:   2014-10-28 15:04:12
 * @Last Modified 2014-12-08
 * @Last Modified time: 2015-05-01 15:46:27
 */

'use strict';

var schedule = angular.module('shifts');

schedule.service('scheduleService', function($location, currentUser) {
	var that = this;

	that.showAddShift = false;
	that.showAddSubShift = false;
	that.scheduleService = function() {
		if (currentUser.data.Position.Position === 'FTE' ||
			currentUser.data.Position.Position === 'HR' ||
			currentUser.data.Admin) {
			switch ($location.path()) {
				case '/main/schedule/availableShifts':
					that.showAddShift = true;
					that.showAddSubShift = false;
					break;
				case '/main/schedule/subShifts':
					that.showAddShift = false;
					that.showAddSubShift = true;
					break;
				default:
					that.showAddShift = false;
					that.showAddSubShift = false;
			}
		} else {
			that.showAddShift = false;
			that.showAddSubShift = false;
		}
		if (!(currentUser.data.extendedPrivledges) &&
			($location.path() === '/main/schedule/today' && $location.path() === '/main/schedule/schedule')
		) {
			$location.path('/main/schedule/mySchedule');
		}
	};
}).controller('BasicScheduleCtrl', function(
	$location, $log, $scope, scheduleService
) {
	$scope.currentApp.title = 'Schedule';
	scheduleService.scheduleService();
	$scope.properties = {
		scheduleProperties: {
			showAddShift: scheduleService.showAddShift,
			showAddSubShift: scheduleService.showAddSubShift
		}
	};
	$scope.$log = $log;

	var today = {};
	this.refreshContent = function(hideAlert) {
		hideAlert = hideAlert || false;
		var partial = $location.path().split('/');
		partial = partial[3];

		// REFRESH[partial](hideAlert);
	};
	this.queryDate = Date.now();
	this.getTodaySchedule = function() {
		// SET.propertyToday(this.queryDate);
	};
	this.breakRegex = /\n\r?/g;
	this.semester = 'currentSemester';
	if (today === undefined) {
		this.getTodaySchedule();
	}

	$scope.toggle = true;
	this.activePanel = -1;
});
