/*
 * @Author: Jonathan Baird
 * @Date:   2015-01-25 09:28:03
 * @Last Modified by:   jonathan
 * @Last Modified time: 2015-01-30 19:23:12
 */
(function() {
	'use strict';
	var app = angular.module('Schedule');

	app.controller('ShiftEditCtrl', ['$q', '$scope', '$alert', 'generalService', 'dataService',
		function($q, $scope, $alert, generalService, dataService) {
			var DATA = generalService.data,
				PROPERTIES = generalService.properties,
				ARRAYS = generalService.arrays,
				GET = dataService.get,
				CLASSES = dataService.classes,
				REFRESH = dataService.refresh;
			var ctrl = this,
				shift;
			// Define the days for the day picker;
			ctrl.days = [];
			_.each(ARRAYS.weeks[0].days, function(day) {
				ctrl.days.push({
					day: day.day,
					title: day.title
				});
			});
			// make sure that the shift is defined and set initial values
			if ($scope.shift === undefined) {
				$scope.shift = new CLASSES.Shift();
				shift = $scope.shift;
				shift.PositionId = PROPERTIES.currentUser.Area.DefaultPosition.Id;
				shift.ShiftGroupId = PROPERTIES.currentSemester.ShiftGroupId;
				ctrl.temp = [];
			} else {
				shift = $scope.shift;
				ctrl.PositionId = shift.PositionId;
				ctrl.ShiftGroupId = shift.ShiftGroupId;
				ctrl.temp = shift.Day.split(' - ');
			}
			/**
			 * adds a new shift to the database
			 */
			ctrl.addShift = function() {
				shift.Day = '';
				_.each(ctrl.temp, function(day) {
					shift.Day += (day === ctrl.temp[ctrl.temp.length - 1]) ? day : day + ' - ';
				});
				shift.add()
					.then(function() {
						REFRESH.availableShifts();
					});
			};
			/**
			 * updates an existing shift in the database
			 */
			ctrl.updateShift = function() {
				shift.Day = '';
				_.each(ctrl.temp, function(day) {
					shift.Day += (day === ctrl.temp[ctrl.temp.length - 1]) ? day : day + ' - ';
				});
				shift.PositionId = ctrl.PositionId;
				shift.ShiftGroupId = ctrl.ShiftGroupId;
				shift.update();
			};
			/**
			 * deactivates a shift in the database;
			 */
			ctrl.deactivateShift = function() {
				shift.deactivate();
				REFRESH.availableShifts();
			};
			/**
			 * creates a schedule to link an employee to the shift
			 */
			ctrl.takeShift = function() {
				if (_.find(DATA.schedules, function(schedule) {
						return (
							schedule.ShiftId === shift.Id &&
							schedule.EmployeeId === PROPERTIES.currentUser.Id &&
							schedule.SemesterId === PROPERTIES.currentSemester.Id &&
							schedule.Active
						);
					}) === undefined) {
					var dataCalls = [
						GET.shifts(),
						GET.schedules(),
					];
					$q.all(dataCalls)
						.then(function() {
							shift = _.find(DATA.shifts, function(newShift) {
								return newShift.Id === shift.Id;
							});
							shift.setAvailableSlots();
							if (shift.AvailableSlots > 0) {
								var schedule = new CLASSES.Schedule();
								schedule.ShiftId = shift.Id;
								schedule.EmployeeId = PROPERTIES.currentUser.Id;
								schedule.SemesterId = PROPERTIES.currentSemester.Id;
								schedule.add()
									.then(function() {
										REFRESH.availableShifts();
									});
							}
						});
				} else {
					$alert({
						show: true,
						placement: 'top-right',
						content: 'You already work this shift!',
						animation: 'am-fade-and-slide-top',
						duration: '3',
						type: 'danger',
						template: 'partials/alerts/error-alert.html'
					});
				}
			};
		}
	]);
})();
