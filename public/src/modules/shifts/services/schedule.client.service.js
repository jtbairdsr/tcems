/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-02 06:04:12
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-11 15:24:07
 */

'use strict';

angular.module('shifts').service('scheduleService', function(
	$q, $location, Shift, Schedule, SubShift, Availability, Week, currentUser,
	currentSemester, availabilities, employees, shifts, subShifts, schedules
) {
	var that = this;

	that.scheduleProperties = {
		showAddShift: false,
		showAddSubShift: false
	};
	that.refresh = function(noAvailEmps) {
		var deffered = $q.defer();

		function findNoAvailabilityEmployees() {
			var noAvailabilityEmployees = {
				currentSemester: [],
				nextSemester: []
			};

			function hasAvailabilities(employee, semesterId) {
				var submittedAvailabilities = _.find(availabilities.list, function(availability) {
					return (
						availability.Active &&
						availability.Employee.Id === employee.Id &&
						availability.Semester.Id === semesterId
					);
				});
				return (submittedAvailabilities !== undefined);
			}

			_.each(employees.list, function(employee) {
				var positionTest = /(FTE|Applicant)/;
				if (employee.Active && !positionTest.test(employee.Position.Description)) {
					if (!hasAvailabilities(employee, currentSemester.data.Id)) {
						noAvailabilityEmployees.currentSemester.push(employee);
					}
					if (currentSemester.data.NextSemester.Id &&
						!hasAvailabilities(employee, currentSemester.NextSemester.Id)
					) {
						noAvailabilityEmployees.nextSemester.push(employee);
					}
				}
			});

			return noAvailabilityEmployees;
		}

		Shift.query().then(function() {
			$q.all([Schedule.query(), SubShift.query(), Availability.query()]).then(function() {
				Week.createWeeks(3);
				if (noAvailEmps) {
					deffered.resolve(findNoAvailabilityEmployees());
				} else {
					deffered.resolve();
				}
			});
		});
		return deffered.promise;
	};
	that.resetView = function() {
		var positionTest = /(FTE|HR)/,
			locationTest = /\/main\/schedule\/(today|schedule)/;
		if (positionTest.test(currentUser.data.Position.Description) || currentUser.data.Admin) {
			switch ($location.path()) {
				case '/main/schedule/availableShifts':
					that.scheduleProperties.showAddShift = true;
					that.scheduleProperties.showAddSubShift = false;
					break;
				case '/main/schedule/subShifts':
					that.scheduleProperties.showAddShift = false;
					that.scheduleProperties.showAddSubShift = true;
					break;
				default:
					that.scheduleProperties.showAddShift = false;
					that.scheduleProperties.showAddSubShift = false;
			}
		} else {
			that.scheduleProperties.showAddShift = false;
			that.scheduleProperties.showAddSubShift = false;
		}
		if (!(currentUser.data.extendedPrivledges) && locationTest.test($location.path())) {
			$location.path('/main/schedule/mySchedule');
		}
	};
	that.getDay = function(date) {
		date = date || Date.today();
		var dayView = {
			title: date.toString('dddd'),
			day: date.toString('ddd'),
			shifts: [],
			date: date
		};

		function addEmployee(params) {
			var employee = params.employee || {
					PreferredName: 'No',
					LastName: 'Employee',
					Picture: 'src/modules/core/img/missing.png'
				},
				substitute = params.substitute || {
					PreferredName: '',
					LastName: '',
					Picture: ''
				},
				needsASub = params.needsASub || false;
			return {
				// Original employee info
				employeePreferredName: employee.PreferredName,
				employeeLastName: employee.LastName,
				employeePhoneNumber: employee.PhoneNumber,
				employeeEmailAddress: employee.EmailAddress,
				employeePicture: employee.Picture,

				// Substitute employee info
				substitutePreferredName: substitute.PreferredName,
				substituteLastName: substitute.LastName,
				substitutePhoneNumber: substitute.PhoneNumber,
				substituteEmailAddress: substitute.EmailAddress,
				substitutePicture: substitute.Picture,

				// False since there is a sub
				needsASub: needsASub
			};
		}

		function getShiftEmployees(shift) {
			var fSubShifts,
				returnEmployeeArray = [];
			fSubShifts = _.filter(subShifts.list, function(subShift) {
				subShift.Date.setHours(0, 0, 0, 0);
				return (
					subShift.Shift.Id === shift.Id &&
					subShift.Active &&
					subShift.Date.equals(date)
				);
			});
			_.each(schedules.list, function(schedule) {
				if (schedule.Active &&
					schedule.Shift.Day.indexOf(date.toString('ddd')) >= 0 &&
					schedule.Shift.Id === shift.Id) {
					var substitute = _.find(fSubShifts, function(subShift) {
						return subShift.Requester.Id === schedule.Employee.Id;
					});
					if (substitute !== undefined) {
						fSubShifts = _.without(fSubShifts, substitute);
						while (substitute.NewRequest !== undefined && substitute.NewRequest.Id !== undefined) {
							substitute = substitute.NewRequest;
							substitute.isNewRequest = true;
						}
						if (substitute.Substitute !== undefined && substitute.Substitute.Id !== undefined) {
							// We pass the basics, the original employee and the substitute
							returnEmployeeArray.push(addEmployee({
								substitute: substitute.Substitute,
								employee: schedule.Employee
							}));
						} else if (substitute.isNewRequest) {
							// We are using the requester as the sub because he/she is the current sub until his/her request is filled
							returnEmployeeArray.push(addEmployee({
								substitute: substitute.Requester,
								employee: schedule.Employee,
								needsASub: true
							}));
						} else {
							// We pass the original employee and true because there is a sub request but no sub yet
							returnEmployeeArray.push(addEmployee({
								employee: schedule.Employee,
								needsASub: true
							}));
						}
					} else {
						// We pass the original employee
						returnEmployeeArray.push(addEmployee({
							employee: schedule.Employee
						}));
					}
				}
			});
			while (returnEmployeeArray.length < shift.Slots) {
				returnEmployeeArray.push(addEmployee({
					needsASub: true
				}));
			}
			_.each(fSubShifts, function(subShift) {
				var extraEmployee = {
					PreferredName: 'Extra',
					LastName: '',
					PhoneNumber: '',
					EmailAddress: '',
					Picture: 'src/modules/core/img/missing.png'
				};
				while (subShift.NewRequest !== undefined && subShift.NewRequest.Id !== undefined) {
					subShift = subShift.NewRequest;
					subShift.isNewRequest = true;
				}
				if (subShift.Substitute.Id !== undefined) {
					// We pass the basics, the original employee and the substitute
					returnEmployeeArray.push(addEmployee({
						substitute: subShift.Substitute,
						employee: extraEmployee
					}));
				} else if (subShift.isNewRequest) {
					// We are using the requester as the sub because he/she is the current sub until his/her request is filled
					returnEmployeeArray.push(addEmployee({
						substitute: subShift.Requester,
						employee: extraEmployee,
						needsASub: true
					}));
				} else {
					// We pass the original employee and true because there is a sub request but no sub yet
					returnEmployeeArray.push(addEmployee({
						employee: extraEmployee,
						needsASub: true
					}));
				}
			});
			return returnEmployeeArray;
		}

		_.each(shifts.list, function(shift) {
			if (shift.Active &&
				shift.ShiftGroupId === currentSemester.data.ShiftGroupId &&
				shift.Day.indexOf(date.toString('ddd')) >= 0) {
				// Get employee Information for this shift.
				var assignableEmployees = getShiftEmployees(shift),

					// Check to see if we have already dealt with this time period
					currentShift = _.find(dayView.shifts, function(dayShift) {
						return (
							dayShift.StartTime.toTimeString() === shift.StartTime.toTimeString() &&
							dayShift.EndTime.toTimeString() === shift.EndTime.toTimeString() &&
							dayShift.PositionId === shift.PositionId
						);
					});

				// If we have add the employees to the previousShift
				if (currentShift) {
					_.each(assignableEmployees, function(employee) {
						currentShift.Employees.push(employee);
					});

					// If we haven't create a new shift and add the employees to that.
				} else {
					dayView.shifts.push({
						StartTime: shift.StartTime,
						EndTime: shift.EndTime,
						Position: shift.Position,
						PositionId: shift.PositionId,
						Shift: shift,
						Employees: assignableEmployees
					});
				}
			}
		});
		return dayView;
	};
});
