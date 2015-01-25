/*
 * @Author: Jonathan Baird
 * @Date:   2015-01-25 09:55:05
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-01-25 11:27:19
 */

(function() {
	'use strict';

	var app = angular.module('Schedule');

	app.controller('MyScheduleCtrl', ['$scope', '$timeout', '$alert', 'generalService', 'dataService',
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
				shift = $scope.shift.shift,
				subShift;

			if ($scope.shift.subRequest === undefined) {
				subShift = new CLASSES.SubShift();
				subShift.ShiftId = shift.Id;
				subShift.Date = day.date;
				subShift.RequesterId = PROPERTIES.currentUser.Id;
				subShift.SemesterId = PROPERTIES.currentSemester.Id;
			} else {
				subShift = $scope.shift.subRequest;
			}

			ctrl.requestSub = function() {
				subShift.add()
					.then(refreshData());
			};
			ctrl.cancel = function() {
				subShift.deactivate()
					.then(refreshData());
			};
			ctrl.requestSubOfSub = function() {
				subShift.newRequest()
					.then(refreshData());
			};

			function refreshData() {
				console.log('REFRESHING DATA');
				$timeout(function() {
					GET.subShifts()
					.then(function() {
						console.log('GOT SUBSHIFTS');
						SET.arrayWeeks();
					});
				}, 1000);

			}
		}
	]);
})();
