/*
 * @Author: Jonathan Baird
 * @Date:   2015-01-25 09:26:25
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-04 10:05:13
 */

'use strict';

angular.module('shifts').controller('SubShiftController', function(
	$q, $scope, $alert, shifts, schedules, subShifts, weeks, dataService,
	currentUser, currentSemester, SubShift
) {
	var that = this,
		day = $scope.day,
		subShift;

	// Make sure that the subShift is defined and set initial values
	if ($scope.subShift === undefined) {
		$scope.subShift = new SubShift();
		subShift = $scope.subShift;
		subShift.RequesterId = currentUser.data.Id;
		subShift.SemesterId = currentSemester.data.Id;
		subShift.Date = Date.today();
	} else {
		subShift = $scope.subShift.subShift;
	}

	// Define basic controller variables
	that.slots = 1;

	// Define the shifts for the shift picker;
	that.HRshifts = [];
	_.each(shifts.list, function(shift) {
		if (shift.Active &&
			shift.ShiftGroupId === currentSemester.data.ShiftGroupId) {
			that.HRshifts.push({
				Id: shift.Id,
				Relevant: true,
				Day: shift.Day,
				Description: shift.toString(),
				PositionId: shift.PositionId,
				StartTime: shift.StartTime
			});
		}
	});

	/**
	 * Filters the shift list to only show the shifts pertaining to the
	 *    relevant day
	 */
	that.shiftFilter = function() {
		_.each(that.HRshifts, function(shift) {
			if (shift.Day.indexOf(subShift.Date.toString('ddd')) >= 0) {
				shift.Relevant = true;
			} else {
				shift.Relevant = false;
			}
		});
	};

	// Adds a subRequest to the database
	that.requestSub = function() {
		var dataCalls = [];
		for (var i = 0; i < that.slots; i++) {
			dataCalls.push(subShift.add(true, true));
		}
		$q.all(dataCalls)
			.then(function() {
				SubShift.query()
					.then(function() {
						var day;
						_.each(weeks.list, function(week) {
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

	// Deactivate a subRequest on the database
	that.removeSubShift = function() {
		subShift.deactivate()
			.then(function() {
				day.refresh();
			});
	};

	// Assigns an employee as the substitute on a subRequest
	that.takeSubShift = function() {
		var alreadWorkShift = {
				show: true,
				placement: 'top-right',
				content: 'You already work this shift!',
				animation: 'am-fade-and-slide-top',
				duration: '3',
				type: 'danger',
				template: 'partials/alerts/error-alert.html'
			},
			proceed = (_.find(schedules.list, function(schedule) {
				return (
					schedule.ShiftId === subShift.ShiftId &&
					schedule.EmployeeId === currentUser.data.Id &&
					schedule.Active
				);
			}) === undefined);
		if (proceed) {
			proceed = (_.find(subShifts.list, function(testSubShift) {
				return (
					testSubShift.ShiftId === subShift.ShiftId &&
					testSubShift.SubstituteId === currentUser.data.Id &&
					testSubShift.Date === subShift.Date &&
					testSubShift.Active
				);
			}) === undefined);
			if (proceed) {
				subShift.SubstituteId = currentUser.data.Id;
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

	// Execute the fiilter for the initial load;
	that.shiftFilter();

});
