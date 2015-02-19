/*
 * @Author: Jonathan Baird
 * @Date:   2014-10-28 15:04:12
 * @Last Modified 2014-12-08
 * @Last Modified time: 2015-02-19 08:26:11
 */
/* global angular, _ */

(function() {
	var schedule = angular.module('Schedule');

	schedule.service('scheduleService', ['$location', 'generalService', 'dataService',
		function($location, generalService, dataService) {
			var service = this;
			/////////////////////////////
			// Set aliases to the data //
			/////////////////////////////
			var DATA = generalService.data,
				ARRAYS = generalService.arrays,
				PROPERTIES = generalService.properties;
			service.showAddShift = false;
			service.showAddSubShift = false;
			service.scheduleService = function() {
				if (PROPERTIES.currentUser.Position.Position === 'FTE' ||
					PROPERTIES.currentUser.Position.Position === 'HR' ||
					PROPERTIES.currentUser.Admin) {
					switch ($location.path()) {
						case '/main/schedule/availableShifts':
							service.showAddShift = true;
							service.showAddSubShift = false;
							break;
						case '/main/schedule/subShifts':
							service.showAddShift = false;
							service.showAddSubShift = true;
							break;
						default:
							service.showAddShift = false;
							service.showAddSubShift = false;
					}
				} else {
					service.showAddShift = false;
					service.showAddSubShift = false;
				}
				if ((PROPERTIES.currentUser.Position.Description !== 'Coordinator' &&
					PROPERTIES.currentUser.Position.Description !== 'FTE' &&
					PROPERTIES.currentUser.Position.Description !== 'HR' &&
					!(PROPERTIES.currentUser.Admin)) &&
					($location.path() !== '/main/schedule/mySchedule' &&
					$location.path() !== '/main/schedule/subShifts' &&
					$location.path() !== '/main/schedule/myAvailability' &&
					$location.path() !== '/main/schedule/availability' &&
					$location.path() !== '/main/schedule/availableShifts')) {
					$location.path('/main/schedule/mySchedule');
				}
			};
		}
	]);
	schedule.controller('BasicScheduleCtrl', ['$location', '$log', '$scope', 'scheduleService', 'generalService', 'dataService',
		function($location, $log, $scope, scheduleService, generalService, dataService) {
			$scope.properties.currentApp = 'Schedule';
			scheduleService.scheduleService();
			$scope.properties.scheduleProperties = {
				showAddShift: scheduleService.showAddShift,
				showAddSubShift: scheduleService.showAddSubShift
			};
			$scope.$log = $log;
			/////////////////////////////
			// Set aliases to the data //
			/////////////////////////////
			var DATA = generalService.data,
				ARRAYS = generalService.arrays,
				PROPERTIES = generalService.properties,
				REFRESH = dataService.refresh,
				SET = dataService.set;
			this.refreshContent = function(hideAlert) {
				hideAlert = hideAlert || false;
				var partial = $location.path().split('/');
				partial = partial[3];
				REFRESH[partial](hideAlert);
			};
			this.queryDate = Date.today();
			this.getTodaySchedule = function() {
				SET.propertyToday(this.queryDate);
			};
			this.breakRegex = /\n\r?/g;
			this.semester = 'currentSemester';
			if (PROPERTIES.today === undefined) {
				this.getTodaySchedule();
			}

			$scope.toggle = true;
			this.activePanel = -1;
		}
	]);
})();
