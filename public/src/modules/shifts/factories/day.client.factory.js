/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-29 12:23:23
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-26 14:36:49
 */

'use strict';

angular.module('shifts').factory('Day', function(
	currentSemester, nextSemester, shifts, schedules, availabilities,
	dateService, subShifts, Schedule, currentUser
) {

	// Declare the new Day object
	function Day(day, weekTitle) {
		this.weekTitle = weekTitle; // Title of the week this day belongs to.
		this.active = true; // Determine whether the day is active (bool)
		this.title = day.toString('dddd'); // Full title of the day i.e. 'Monday' (String)
		this.day = day.toString('ddd'); // Three letter title of the day i.e. 'Mon' (String)
		this.date = new Date(day); // Date of the day (Date)
		this.weekend = this.date.is().weekend(); // Is the day a Saturday or Sunday (bool)
		this.today = this.date.is().today(); // Is this today (bool)
		this.past = (Date < Date.today()); // Is the day already past (bool)
		this.semesterDay = dateService.timeBetween(currentSemester.data.FirstDay, day, 'day');
		this.shifts = {
			currentSemester: [], // Data used in current semester (Array)
			nextSemester: [] // Data used in next semester (Array)
		}; // Data used in the Schedule view (Object)
		this.availabilities = {
			currentSemester: [], // Data used in current semester (Array)
			nextSemester: [] // Data used in next semester (Array)
		}; // Data used in the Availability view
		this.myShifts = {
			currentSemester: [], // Data used in current semester (Array)
			nextSemester: [] // Data used in next semester (Array)
		}; // Data used in the My Schedule view
		this.myAvailabilities = {
			currentSemester: [], // Data used in current semester (Array)
			nextSemester: [] // Data used in next semester (Array)
		}; // Data used in the My Availability view
		this.subShifts = []; // Data used in the Sub Shifts view

		this.refresh(); // Create the initial data for this day
	}

	// Override the toString method from parent object
	Day.prototype.toString = function() {
		return this.title + ' the ' + this.date.toString('dS') + ' of ' + this.date.toString('MMMM');
	};

	// Create the createShiftsLists method
	Day.prototype.createShiftsLists = function() {
		/**This gets the shifts for the day.
		 *
		 * @returns    {object}           this for chaining
		 **/
		var that = this;

		// Empty arrays so we can start fresh
		this.shifts = {
			currentSemester: [],
			nextSemester: []
		};

		function getSemester(semester, returnData) {
			_.each(shifts.list, function(shift) {
				if (shift.Active &&
					shift.ShiftGroupId === semester.ShiftGroupId &&
					shift.Day.indexOf(that.day) >= 0) {
					var currentShift = _.find(returnData, function(processedShift) {
						return (
							processedShift.StartTime.toTimeString() === shift.StartTime.toTimeString() &&
							processedShift.EndTime.toTimeString() === shift.EndTime.toTimeString() &&
							processedShift.Position.Id === shift.PositionId
						);
					});
					if (currentShift) {
						fillSlots(currentShift, shift, semester.Id);
					} else {
						currentShift = {
							StartTime: shift.StartTime,
							EndTime: shift.EndTime,
							Position: shift.Position,
							PositionId: shift.Position.Id,
							Employees: []
						};
						fillSlots(currentShift, shift, semester.Id);
						returnData.push(currentShift);
					}
				}
			});
		}

		function fillSlots(returnItem, shift, semesterId) {
			var totalSlots = returnItem.Employees.length + shift.Slots;
			_.each(schedules.list, function(schedule) {
				if (schedule.ShiftId === shift.Id &&
					schedule.SemesterId === semesterId &&
					schedule.Active) {
					returnItem.Employees.push({
						Shift: shift,
						Info: schedule.Employee,
						Schedule: schedule
					});
				}
			});
			var remainingSlots = totalSlots - returnItem.Employees.length;
			for (var i = 0; i < remainingSlots; i++) {
				var noEmployee = {
					Shift: shift,
					Info: {
						Id: i - 100,
						PreferredName: 'No',
						LastName: 'Employee',
						Picture: 'src/modules/core/img/missing.png'
					},
					Schedule: new Schedule()
				};
				noEmployee.Schedule.ShiftId = shift.Id;
				noEmployee.Schedule.SemesterId = semesterId;
				returnItem.Employees.push(noEmployee);
			}
		}
		getSemester(currentSemester.data, this.shifts.currentSemester);

		if (nextSemester.Id) {
			getSemester(nextSemester, this.shifts.nextSemester);
		}

	};

	// Create the createAvailabilitiesLists method
	Day.prototype.createAvailabilitiesLists = function() {
		/**This gets the availabilities for the day.
		 *
		 * @returns    {object}           this for chaining
		 **/
		var that = this;

		// Empty arrays so we can start fresh
		this.availabilities = {
			currentSemester: [],
			nextSemester: []
		};

		function getSemester(semester, returnData) {
			_.each(shifts.list, function(shift) {
				if (shift.Active &&
					shift.Day.indexOf(that.day) >= 0 &&
					shift.ShiftGroup.Id === semester.ShiftGroup.Id) {
					// For each relevant shift we:
					// 1. set a flag that determines wether or not to add to returnShiftList
					var addToList = true,
						currentShift = {},

						// 2. Check to see if this time period is already represented by another shift
						existingShift = _.find(returnData, function(processedShift) {
							return (
								processedShift.StartTime.toTimeString() === shift.StartTime.toTimeString() &&
								processedShift.EndTime.toTimeString() === shift.EndTime.toTimeString() &&
								processedShift.Position.Id === shift.PositionId
							);
						});
					if (existingShift !== undefined) {
						// If this is a repeat then assign the previousShift to the current shift
						currentShift = existingShift;

						// And set the flag so we know not to readd it to the returnlist.
						addToList = false;
					} else {
						// Create a uniquie object that will be passed to the returnlist
						currentShift = {
							StartTime: shift.StartTime,
							EndTime: shift.EndTime,
							Position: shift.Position,
							PositionId: shift.Position.Id,
							Employees: []
						};
					}

					// 3. filter relevantAvailabilities
					_.each(availabilities.list, function(availability) {
						if (availability.Active &&
							availability.Semester.Id === semester.Id &&
							availability.Day === that.title &&
							!(dateService.isTimeBefore(shift.StartTime, availability.StartTime)) &&
							!(dateService.isTimeBefore(availability.EndTime, shift.EndTime))) {
							// For each relevant availability we:
							// 1. check to see if the employee already works during that time period.
							var worksThisSchedule = _.find(schedules.list, function(schedule) {
									return (
										schedule.EmployeeId === availability.EmployeeId &&
										schedule.ShiftId === shift.Id
									);
								}),

								// 3. check to see if the employee is already listed for this availability
								alreadyAvailable = _.find(currentShift.Employees, function(employee) {
									return employee.Id === availability.EmployeeId;
								});

							// 4. check to make sure the employee is the correct position for the shift.
							if (worksThisSchedule === undefined &&
								alreadyAvailable === undefined &&
								shift.PositionId === availability.Employee.PositionId) {
								// Add them to the availability list.
								currentShift.Employees.push(availability.Employee);
							}
						}
					});

					// 4. add the Shift to the return list if it isn't already there.
					if (addToList) {
						returnData.push(currentShift);
					}
				}
			});
		}

		getSemester(currentSemester.data, this.availabilities.currentSemester);

		if (nextSemester.Id) {
			getSemester(nextSemester, this.availabilities.nextSemester);
		}
	};

	// Create the createSubShiftsLists method
	Day.prototype.createSubShiftsLists = function() {
		/**This gets the subShifts for the day.
		 *
		 * @returns    {object}           this for chaining
		 **/
		var that = this;

		// Empty arrays so we can start fresh
		this.subShifts = [];
		_.each(subShifts.list, function(subShift) {
			if (subShift.Active &&
				subShift.SemesterId === currentSemester.data.Id &&
				subShift.Date.toDateString() === that.date.toDateString()) {
				that.subShifts.push({
					originalEmployee: subShift.Requester,
					responsibleEmployee: subShift.Substitute || subShift.Requester,
					needsSub: (subShift.SubstituteId === undefined),
					shift: subShift.Shift,
					subShift: subShift
				});
			}
		});
	};

	// Create the createMyShiftsLists method
	Day.prototype.createMyShiftsLists = function() {
		/**This gets the myShifts for the day.
		 *
		 * @returns    {object}           this for chaining
		 **/
		var that = this;

		// Empty arrays so we can start fresh
		this.myShifts = {
			currentSemester: [],
			nextSemester: []
		};

		function getSemester(semesterId, returnData) {
			function ShiftObject(params) {
				this.classes = {
					subRequested: params.subRequest !== undefined,
					week2: that.weekTitle === 'Week 2',
					week3: that.weekTitle === 'Week 3',
					subCovered: that.past
				};
				this.isSubShift = params.subShift !== undefined;
				this.subShift = params.subShift;
				this.shift = params.shift;
				this.subRequest = params.subRequest;
				this.disabled = (that.date.set({
					hour: parseInt(params.shift.StartTime.toString('H')),
					minute: parseInt(params.shift.StartTime.toString('m'))
				}) <= new Date().addDays(1));
			}
			var pSchedules = _.filter(schedules.list, function(schedule) {
					return (
						schedule.Active &&
						schedule.EmployeeId === currentUser.data.Id &&
						schedule.SemesterId === semesterId &&
						schedule.Shift.Day.indexOf(that.day) >= 0
					);
				}),
				pSubShifts = _.filter(subShifts.list, function(subShift) {
					return (
						subShift.Date.toDateString() === that.date.toDateString() &&
						subShift.Active && (
							subShift.SubstituteId === currentUser.data.Id ||
							subShift.RequesterId === currentUser.data.Id
						)
					);
				});
			_.each(pSchedules, function(schedule) {
				var requestedSub = _.find(pSubShifts, function(subShift) {
					return subShift.ShiftId === schedule.ShiftId;
				});
				if (requestedSub) {
					if (!requestedSub.SubstituteId) {
						returnData.push(new ShiftObject({
							subRequest: requestedSub,
							shift: schedule.Shift
						}));
					}
					pSubShifts = _.without(pSubShifts, requestedSub);
				} else {
					returnData.push(new ShiftObject({
						shift: schedule.Shift
					}));
				}
			});
			_.each(pSubShifts, function(subShift) {
				if (subShift.NewRequestId) {
					if (!subShift.NewRequest.SubstituteId) {
						returnData.push(new ShiftObject({
							shift: subShift.Shift,
							subShift: subShift,
							subRequest: subShift.NewRequest
						}));
					}
				} else {
					if (_.find(returnData, function(testData) {
							return testData.NewRequestId === subShift.Id;
						}) === undefined) {
						if (_.find(pSubShifts, function(testData) {
								return testData.NewRequestId === subShift.Id;
							}) === undefined) {
							returnData.push(new ShiftObject({
								shift: subShift.Shift,
								subShift: subShift
							}));
						}
					}
				}
			});
		}

		getSemester(currentSemester.data.Id, this.myShifts.currentSemester);

		if (nextSemester.Id) {
			getSemester(nextSemester.Id, this.myShifts.nextSemester);
		}
	};

	// Create the createMyAvailabilitiesLists method
	Day.prototype.createMyAvailabilitiesLists = function() {
		/**This gets the myAvailabilities for the day.
		 *
		 * @returns    {object}           this for chaining
		 **/
		var that = this;

		// Empty arrays so we can start fresh
		this.myAvailabilities = {
			currentSemester: [],
			nextSemester: []
		};

		function getSemester(semesterId, returnData) {
			_.each(availabilities.list, function(availability) {
				if (availability.Active &&
					availability.EmployeeId === currentUser.data.Id &&
					availability.SemesterId === semesterId &&
					availability.Day === that.title) {
					returnData.push(availability);
				}
			});
		}

		getSemester(currentSemester.data.Id, this.myAvailabilities.currentSemester);

		if (nextSemester.Id) {
			getSemester(nextSemester.Id, this.myAvailabilities.nextSemester);
		}
		return this;
	};

	// Create the refresh method
	Day.prototype.refresh = function(portion) {
		/**This gets refreshes all of the lists for the day.
		 *
		 * @returns    {object}           this for chaining
		 **/
		switch (portion) {
			case 'shifts':
				this.createShiftsLists();
				break;
			case 'availabilities':
				this.createAvailabilitiesLists();
				break;
			case 'myShifts':
				this.createMyShiftsLists();
				break;
			case 'myAvailabilities':
				this.createMyAvailabilitiesLists();
				break;
			default:
				this.createShiftsLists();
				this.createAvailabilitiesLists();
				this.createSubShiftsLists();
				this.createMyShiftsLists();
				this.createMyAvailabilitiesLists();
		}
		return this;
	};

	/**************************************************************************
	 *                              CLASS METHODS                             *
	 **************************************************************************/

	// Create the createDays method
	Day.createDays = function(firstDay) {
		firstDay = firstDay || new Date();
		var dayDate = new Date(firstDay), // Assign the firstDay to something that can be incremented.
			returnArray = [];
		for (var i = 0; i < 7; i++) {
			returnArray.push(new Day(dayDate)); // Add a new Day object to the days array
			dayDate = dayDate.addDays(1); // Increment the day so we can get all of the days of the week
		}
		return returnArray;
	};

	// Return the newly defined Day object
	return Day;
});
