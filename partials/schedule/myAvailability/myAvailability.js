/*
 * @Author: Jonathan Baird
 * @Date:   2015-01-25 09:24:34
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-01-26 09:40:38
 */
(function() {
	'use strict';
	var app = angular.module('Schedule');

	app.controller('MyAvailabilityCtrl', ['$scope', '$timeout', '$alert', 'generalService', 'dataService',
		function($scope, $timeout, $alert, generalService, dataService) {
			/////////////////////////////
			// Set aliases to the data //
			/////////////////////////////
			var PROPERTIES = generalService.properties,
				CLASSES = dataService.classes,
				SET = dataService.set,
				GET = dataService.get;

			var ctrl = this,
				day = $scope.day,
				availability;

			if ($scope.availability === undefined) {
				$scope.availability = new CLASSES.Availability();
				availability = $scope.availability;
				availability.Day = day.title;
				availability.EmployeeId = PROPERTIES.currentUser.Id;
				availability.SemesterId = PROPERTIES.currentSemester.Id;
				availability.StartTime = Date.parse('8:00 AM');
				availability.EndTime = Date.parse('5:00 PM');
			} else {
				availability = $scope.availability;
			}

			ctrl.addAvailability = function() {
				availability.add()
					.then(refreshData());
			};

			ctrl.updateAvailability = function() {
				availability.update()
					.then(refreshData());
			};

			ctrl.removeAvailability = function() {
				availability.deactivate()
					.then(refreshData());
			};
			ctrl.markUnavailable = function() {
				availability.Day = 'Sunday';
				availability.StartTime = new Date();
				availability.EndTime = new Date();
				availability.add()
					.then(refreshData());
			};

			function refreshData() {
				$timeout(function() {
					GET.availabilities()
						.then(function() {
							SET.arrayNoAvailabilityEmployees();
							day.getMyAvailabilities();
						});
				}, 1000);

			}
		}
	]);
})();
