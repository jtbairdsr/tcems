/*
 * @Author: Jonathan Baird
 * @Date:   2015-01-25 09:26:25
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-01 09:00:56
 */

'use strict';

angular.module('shifts').controller('SubShiftCtrl', ['$q', '$scope', '$alert', 'generalService', 'dataService',
	function($q, $scope, $alert, generalService, dataService) {
		/////////////////////////////
		// Set aliases to the data //
		/////////////////////////////
		var DATA = generalService.data,
			ARRAYS = generalService.arrays,
			PROPERTIES = generalService.properties,
			CLASSES = dataService.classes,
			GET = dataService.get;
		var ctrl = this,
			day = $scope.day,
			subShift;

		// make sure that the subShift is defined and set initial values
		if ($scope.subShift === undefined) {
			$scope.subShift = new CLASSES.SubShift();
			subShift = $scope.subShift;
			subShift.RequesterId = PROPERTIES.currentUser.Id;
			subShift.SemesterId = PROPERTIES.currentSemester.Id;
			subShift.Date = Date.today();
		} else {
			subShift = $scope.subShift.subShift;
		}

		// define basic controller variables
		ctrl.slots = 1;

		// Define the shifts for the shift picker;
		ctrl.HRshifts = [];
		_.each(DATA.shifts, function(shift) {
			if (shift.Active &&
				shift.ShiftGroupId === PROPERTIES.currentSemester.ShiftGroupId) {
				ctrl.HRshifts.push({
					Shift: shift,
					Relevant: true,
					PositionId: shift.PositionId,
					StartTime: shift.StartTime
				});
			}
		});

		/**
		 * Filters the shift list to only show the shifts pertaining to the
		 *    relevant day
		 */
		ctrl.shiftFilter = function() {
			_.each(ctrl.HRshifts, function(shift) {
				if (shift.Shift.Day.indexOf(subShift.Date.toString('ddd')) >= 0) {
					shift.Relevant = true;
				} else {
					shift.Relevant = false;
				}
			});
		};

		/**
		 * adds a subRequest to the database
		 */
		ctrl.requestSub = function() {
			var dataCalls = [];
			for (var i = 0; i < ctrl.slots; i++) {
				dataCalls.push(subShift.add(true, true));
			}
			$q.all(dataCalls)
				.then(function() {
					GET.subShifts()
						.then(function() {
							var day;
							_.each(ARRAYS.weeks, function(week) {
								day = _.find(week.days, function(day) {
									return day.date.equals(subShift.Date);
								});
								if (day) {
									day.refresh();
								}
							});
							$alert({
								show: true,
								placement: 'top-right',
								content: 'The sub/s have been requested!',
								animation: 'am-fade-and-slide-top',
								duration: '3',
								type: 'success',
								template: 'partials/alerts/success-alert.html'
							});
						});
				});
		};

		/**
		 * deactivate a subRequest on the database
		 */
		ctrl.removeSubShift = function() {
			subShift.deactivate()
				.then(function() {
					day.refresh();
				});
		};

		/**
		 * assigns an employee as the substitute on a subRequest
		 */
		ctrl.takeSubShift = function() {
			var alreadWorkShift = {
				show: true,
				placement: 'top-right',
				content: 'You already work this shift!',
				animation: 'am-fade-and-slide-top',
				duration: '3',
				type: 'danger',
				template: 'partials/alerts/error-alert.html'
			};
			var proceed = (_.find(DATA.schedules, function(schedule) {
				return (
					schedule.ShiftId === subShift.ShiftId &&
					schedule.EmployeeId === PROPERTIES.currentUser.Id &&
					schedule.Active
				);
			}) === undefined);
			if (proceed) {
				proceed = (_.find(DATA.subShifts, function(testSubShift) {
					return (
						testSubShift.ShiftId === subShift.ShiftId &&
						testSubShift.SubstituteId === PROPERTIES.currentUser.Id &&
						testSubShift.Date === subShift.Date &&
						testSubShift.Active
					);
				}) === undefined);
				if (proceed) {
					subShift.SubstituteId = PROPERTIES.currentUser.Id;
					subShift.update(true)
						.then(function() {
							day.refresh();
						});
				} else {
					$alert(alreadWorkShift);
				}
			} else {
				$alert(alreadWorkShift);
			}
		};

		// execute the fiilter for the initial load;
		ctrl.shiftFilter();

	}
]);
