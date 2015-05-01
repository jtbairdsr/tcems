/* global angular, _ */

(function() {
	'use strict';

	angular.module('core')
		.factory('Day', [
			function(currentSemester, nextSemester, shifts, schedules,
				availabilities, dateService, subShifts, Schedule, currentUser) {

				// declare the new Day object{{{
				function Day(day) {
						this.active = true;                     // Determine whether the day is active (bool)
						this.title = day.toString('dddd');      // full title of the day i.e. 'Monday' (String)
						this.day = day.toString('ddd');         // three letter title of the day i.e. 'Mon' (String)
						this.date = new Date(day);              // date of the day (Date)
						this.weekend = this.date.is().weekend();// is the day a Saturday or Sunday (bool)
						this.today = this.date.is().today();    // is this today (bool)
						this.past = (Date < Date.today());      // is the day already past (bool)
						this.semesterDay = dateService.timeBetween(currentSemester.FirstDay, day, 'day');
						this.shifts = {
							currentSemester: [],                // data used in current semester (Array)
							nextSemester: []                    // data used in next semester (Array)
						};                                      // data used in the Schedule view (Object)
						this.availabilities = {
							currentSemester: [],                // data used in current semester (Array)
							nextSemester: []                    // data used in next semester (Array)
						};                                      // data used in the Availability view
						this.myShifts = {
							currentSemester: [],                // data used in current semester (Array)
							nextSemester: []                    // data used in next semester (Array)
						};                                      // data used in the My Schedule view
						this.myAvailabilities = {
							currentSemester: [],                // data used in current semester (Array)
							nextSemester: []                    // data used in next semester (Array)
						};                                      // data used in the My Availability view
						this.subShifts = [];                    // data used in the Sub Shifts view

						this.refresh();                         // create the initial data for this day
					} //}}}

				// override the toString method from parent object{{{
				Day.prototype.toString = function() {
					return this.title + ' the ' + this.date.toString('dS') + ' of ' + this.date.toString('MMMM');
				}; //}}}

				// create the createShiftsLists method{{{
				Day.prototype.createShiftsLists = function() {
					/**This gets the shifts for the day.
					 *
					 * @returns    {object}           this for chaining
					 **/
					var day = this;
					// empty arrays so we can start fresh
					this.shifts = {
						currentSemester: [],
						nextSemester: []
					};

					function getSemester(semester, returnData) {
						_.each(shifts, function(shift) {
							if (shift.Active &&
								shift.ShiftGroupId === semester.ShiftGroupId &&
								shift.Day.indexOf(day.day) >= 0) {
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
						_.each(schedules, function(schedule) {
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
									Picture: '/media/missing.png'
								},
								Schedule: new Schedule()
							};
							noEmployee.Schedule.ShiftId = shift.Id;
							noEmployee.Schedule.SemesterId = semesterId;
							returnItem.Employees.push(noEmployee);
						}
					}
					getSemester(currentSemester, this.shifts.currentSemester);

					if (nextSemester.Id) {
						getSemester(nextSemester, this.shifts.nextSemester);
					}

				}; //}}}

				// create the createAvailabilitiesLists method{{{
				Day.prototype.createAvailabilitiesLists = function() {
					/**This gets the availabilities for the day.
					 *
					 * @returns    {object}           this for chaining
					 **/
					var day = this;
					// empty arrays so we can start fresh
					this.availabilities = {
						currentSemester: [],
						nextSemester: []
					};

					function getSemester(semester, returnData) {
						_.each(shifts, function(shift) {
							if (shift.Active &&
								shift.Day.indexOf(day.day) >= 0 &&
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
									// if this is a repeat then assign the previousShift to the current shift
									currentShift = existingShift;
									// and set the flag so we know not to readd it to the returnlist.
									addToList = false;
								} else {
									// create a uniquie object that will be passed to the returnlist
									currentShift = {
										StartTime: shift.StartTime,
										EndTime: shift.EndTime,
										Position: shift.Position,
										PositionId: shift.Position.Id,
										Employees: [],
									};
								}
								// 3. filter relevantAvailabilities
								_.each(availabilities, function(availability) {
									if (availability.Active &&
										availability.Semester.Id === semester.Id &&
										availability.Day === day.title &&
										!(dateService.isTimeBefore(shift.StartTime, availability.StartTime)) &&
										!(dateService.isTimeBefore(availability.EndTime, shift.EndTime))) {
										// For each relevant availability we:
										// 1. check to see if the employee already works during that time period.
										var worksThisSchedule = _.find(schedules, function(schedule) {
											return (
												schedule.EmployeeId === availability.EmployeeId &&
												schedule.ShiftId === shift.Id
											);
										});
										// 3. check to see if the employee is already listed for this availability
										var alreadyAvailable = _.find(currentShift.Employees, function(employee) {
											return employee.Id === availability.EmployeeId;
										});
										// 4. check to make sure the employee is the correct position for the shift.
										if (worksThisSchedule === undefined &&
											alreadyAvailable === undefined &&
											shift.PositionId === availability.Employee.PositionId) {
											// add them to the availability list.
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

					getSemester(currentSemester, this.availabilities.currentSemester);

					if (nextSemester.Id) {
						getSemester(nextSemester, this.availabilities.nextSemester);
					}
				}; //}}}

				// create the createSubShiftsLists method{{{
				Day.prototype.createSubShiftsLists = function() {
					/**This gets the subShifts for the day.
					 *
					 * @returns    {object}           this for chaining
					 **/
					var day = this;
					// empty arrays so we can start fresh
					this.subShifts = [];
					_.each(subShifts, function(subShift) {
						if (subShift.Active &&
							subShift.SemesterId === currentSemester.Id &&
							subShift.Date.toDateString() === day.date.toDateString()) {
							day.subShifts.push({
								originalEmployee: subShift.Requester,
								responsibleEmployee: subShift.Substitute || subShift.Requester,
								needsSub: (subShift.SubstituteId === undefined),
								shift: subShift.Shift,
								subShift: subShift
							});
						}
					});
				}; //}}}

				// create the createMyShiftsLists method{{{
				Day.prototype.createMyShiftsLists = function() {
					/**This gets the myShifts for the day.
					 *
					 * @returns    {object}           this for chaining
					 **/
					var day = this;
					// empty arrays so we can start fresh
					this.myShifts = {
						currentSemester: [],
						nextSemester: []
					};

					function getSemester(semesterId, returnData) {
						var schedules = _.filter(schedules, function(schedule) {
							return (
								schedule.Active &&
								schedule.EmployeeId === currentUser.Id &&
								schedule.SemesterId === semesterId &&
								schedule.Shift.Day.indexOf(day.day) >= 0
							);
						});
						var subShifts = _.filter(subShifts, function(subShift) {
							return (
								subShift.Date.toDateString() === day.date.toDateString() &&
								subShift.Active && (
									subShift.SubstituteId === currentUser.Id ||
									subShift.RequesterId === currentUser.Id
								)
							);
						});
						_.each(schedules, function(schedule) {
							var requestedSub = _.find(subShifts, function(subShift) {
								return subShift.ShiftId === schedule.ShiftId;
							});
							if (requestedSub) {
								if (!requestedSub.SubstituteId) {
									returnData.push({
										isSubShift: false,
										subShift: undefined,
										shift: schedule.Shift,
										subRequest: requestedSub,
										disabled: (day.date.set({
											hour: parseInt(schedule.Shift.StartTime.toString('H')),
											minute: parseInt(schedule.Shift.StartTime.toString('m'))
										}) <= new Date().addDays(1))
									});
								}
								subShifts = _.without(subShifts, requestedSub);
							} else {
								returnData.push({
									shift: schedule.Shift,
									isSubShift: false,
									subShift: undefined,
									subRequest: undefined,
									disabled: (day.date.set({
										hour: parseInt(schedule.Shift.StartTime.toString('H')),
										minute: parseInt(schedule.Shift.StartTime.toString('m'))
									}) <= new Date().addDays(1))
								});
							}
						});
						_.each(subShifts, function(subShift) {
							var disabled = (day.date.set({
								hour: parseInt(subShift.Shift.StartTime.toString('H')),
								minute: parseInt(subShift.Shift.StartTime.toString('m'))
							}) <= new Date().addDays(1));
							if (subShift.NewRequestId) {
								if (!subShift.NewRequest.SubstituteId) {
									returnData.push({
										shift: subShift.Shift,
										isSubShift: true,
										subShift: subShift,
										subRequest: subShift.NewRequest,
										disabled: disabled
									});
								}
							} else {
								if (_.find(returnData, function(testData) {
										return testData.NewRequestId === subShift.Id;
									}) === undefined) {
									if (_.find(subShifts, function(testData) {
											return testData.NewRequestId === subShift.Id;
										}) === undefined) {
										returnData.push({
											shift: subShift.Shift,
											isSubShift: true,
											subShift: subShift,
											subRequest: undefined,
											disabled: disabled
										});
									}
								}
							}
						});
					}

					getSemester(currentSemester.Id, this.myShifts.currentSemester);

					if (nextSemester.Id) {
						getSemester(nextSemester.Id, this.myShifts.nextSemester);
					}
				}; //}}}

				// create the createMyAvailabilitiesLists method{{{
				Day.prototype.createMyAvailabilitiesLists = function() {
					/**This gets the myAvailabilities for the day.
					 *
					 * @returns    {object}           this for chaining
					 **/
					var day = this;
					// empty arrays so we can start fresh
					this.myAvailabilities = {
						currentSemester: [],
						nextSemester: []
					};

					function getSemester(semesterId, returnData) {
						_.each(availabilities, function(availability) {
							if (availability.Active &&
								availability.EmployeeId === currentUser.Id &&
								availability.SemesterId === semesterId &&
								availability.Day === day.title) {
								returnData.push(availability);
							}
						});
					}

					getSemester(currentSemester.Id, this.myAvailabilities.currentSemester);

					if (nextSemester.Id) {
						getSemester(nextSemester.Id, this.myAvailabilities.nextSemester);
					}
					return this;
				}; //}}}

				// create the refresh method{{{
				Day.prototype.refresh = function() {
					/**This gets refreshes all of the lists for the day.
					 *
					 * @returns    {object}           this for chaining
					 **/
					this.createShiftsLists();
					this.createAvailabilitiesLists();
					this.createSubShiftsLists();
					this.createMyShiftsLists();
					this.createMyAvailabilitiesLists();
					return this;
				}; //}}}

				// return the newly defined Day object{{{
				return Day; //}}}
			}
		]);
})();


// vim:foldmethod=marker:foldlevel=0
