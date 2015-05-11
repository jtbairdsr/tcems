/*
 * @Author: Jonathan Baird
 * @Date:   2015-01-25 09:28:03
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-04 08:41:18
 */

'use strict';

angular.module('shifts').controller('EditShiftController', function(
	$q, $scope, $alert, schedules, shifts, weeks, positions, shiftGroups,
	currentUser, currentSemester, Schedule, Shift
) {
	var that = this,
		shift;

	// Define the days for the day picker;
	that.days = [];
	_.each(weeks.list[0].days, function(day) {
		that.days.push({
			day: day.day,
			title: day.title
		});
	});
	that.positions = [];
	_.each(positions.list, function(position) {
		if (position.Access) {
			that.positions.push({
				Id: position.Id,
				Description: position.Description
			});
		}
	});
	that.groups = [];
	_.each(shiftGroups.list, function(group) {
		that.groups.push({
			Id: group.Id,
			Description: group.Description
		});
	});

	// Make sure that the shift is defined and set initial values
	if ($scope.shift === undefined) {
		that.add = true;
		$scope.shift = new Shift({
			PositionId: currentUser.data.Area.DefaultPosition.Id,
			ShiftGroupId: currentSemester.data.ShiftGroupId
		});
		shift = $scope.shift;
		that.temp = [];
	} else {
		that.add = false;
		shift = $scope.shift;
		that.temp = shift.Day.split(' - ');
	}

	// Adds a new shift to the database
	that.addShift = function() {
		shift.Day = '';
		_.each(that.temp, function(day) {
			shift.Day += (day === that.temp[that.temp.length - 1]) ? day : day + ' - ';
		});
		shift.add()
			.then(function() {
				Shift.query();
			});
	};

	// Updates an existing shift in the database
	that.updateShift = function() {
		shift.Day = '';
		_.each(that.temp, function(day) {
			shift.Day += (day === that.temp[that.temp.length - 1]) ? day : day + ' - ';
		});
		shift.update();
	};

	// Deactivates a shift in the database;
	that.deactivateShift = function() {
		shift.deactivate();
		Shift.query();
	};

	// Creates a schedule to link an employee to the shift
	that.takeShift = function() {
		if (
			_.find(schedules.list, function(schedule) {
				return (
					schedule.ShiftId === shift.Id &&
					schedule.EmployeeId === currentUser.data.Id &&
					schedule.SemesterId === currentSemester.data.Id &&
					schedule.Active
				);
			}) === undefined
		) {
			$q.all([
				Shift.query(),
				Schedule.query()
			]).then(function() {
				shift = _.find(shifts.list, function(newShift) {
					return newShift.Id === shift.Id;
				});
				shift.setAvailableSlots();
				if (shift.AvailableSlots > 0) {
					var schedule = new Schedule();
					schedule.ShiftId = shift.Id;
					schedule.EmployeeId = currentUser.data.Id;
					schedule.SemesterId = currentSemester.data.Id;
					schedule.add()
						.then(function() {
							Schedule.query();
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
});
