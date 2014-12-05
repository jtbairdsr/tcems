(function() {
	var schedule = angular.module('Schedule');

	schedule.controller('ScheduleCtrl', ['$location', '$scope', '$modal', 'dataService',
		function($location, $scope, $modal, dataService) {
			var ctrl = this;
			ctrl.showAddShift = false;
			ctrl.showSubShift = false;
			ctrl.filters = {
				positions: {},
			};
			ctrl.showAddButtons = function() {
				// alert($location.path());
				if (dataService.properties.currentUser.employeeInfo.Position.Position === 'FTE' ||
					dataService.properties.currentUser.employeeInfo.Position.Position === 'HR' ||
					dataService.properties.currentUser.employeeInfo.Admin) {
					switch ($location.path()) {
						case '/main/schedule/availableShifts':
							ctrl.showAddShift = true;
							ctrl.showAddSubShift = false;
							break;
						case '/main/schedule/subShifts':
							ctrl.showAddShift = false;
							ctrl.showAddSubShift = true;
							break;
						default:
							ctrl.showAddShift = false;
							ctrl.showAddSubShift = false;
					}
				} else {
					ctrl.showAddShift = false;
					ctrl.showAddSubShift = false;
				}
			};
			ctrl.showAddButtons();
			if (dataService.properties.currentUser.employeeInfo.Position.Position !== 'Coordinator' && dataService.properties.currentUser.employeeInfo.Position.Position !== 'FTE' && !(dataService.properties.currentUser.employeeInfo.Admin)) {
				$location.path("/main/schedule/mySchedule");
			}
			$scope.properties.currentApp = 'Schedule';
			$scope.properties.test = $location.path() + ' | ' + ctrl.showAddShift;
			ctrl.refreshContent = function() {
				new dataService.getItems('Employee')
					.top(999999999)
					.select(['Id', 'Picture', 'FirstName', 'PreferredName', 'LastName', 'EmailAddress', 'PhoneNumber', 'INumber', 'Track/Description', 'Team/Id', 'Position/Position', 'Area/Area'])
					.expand(['Track', 'Team', 'Position', 'Area'])
					.where(['Active', 'eq', 1])
					.execute(false)
					.success(function(data) {
						$scope.arrays.employees = data.d.results;
					});
				new dataService.getItems('Shift')
					.top(999999999)
					.select(['Id', 'Day', 'Slots', 'Current', 'ShiftGroup/Description', 'ShiftGroup/Id', 'Position/Position', 'Position/Id', 'StartTime', 'EndTime'])
					.expand(['ShiftGroup', 'Position'])
					.where(['Current', 'eq', '1'])
					.execute(false)
					.success(function(data) {
						var rawShifts = data.d.results,
							finalShifts = [],
							shiftCounter = 0,
							getSchedules = function(shift) {
								if (shiftCounter === rawShifts.length) {
									$scope.arrays.shifts = finalShifts;
								} else {
									new dataService.getItems('Schedule')
										.where({
											and: [
												['Shift', 'eq', shift.Id],
												['Active', 'eq', 1]
											]
										})
										.execute(false)
										.success(function(data) {
											shift.aSlots = shift.Slots - data.d.results.length;
											finalShifts.push(shift);
											shiftCounter++;
											getSchedules(rawShifts[shiftCounter]);
										})
										.error(function(data) {
											$scope.arrays.errors.push(data);
										});
								}
							};
						getSchedules(rawShifts[shiftCounter]);
					});
				new dataService.getItems('Availability')
					.top(999999999)
					.select(['Employee/Id', 'Day', 'StartTime', 'EndTime', 'Id'])
					.expand(['Employee'])
					.where({
						and: [
							['Current', 'eq', 1],
							['Employee/Id', 'eq', dataService.properties.currentUser.employeeInfo.Id]
						]
					})
					.execute(false)
					.success(function(data) {
						var createDays = function(data) {
							var days = new Array(7),
								i = 0;
							for (i = 0; i < days.length; i++) {
								days[i] = {
									day: Date.sun()
										.addDays(i)
										.toString('dddd'),
									availabilities: []
								};
							}
							for (i = 0; i < data.length; i++) {
								daysCounter = 0;
								do {
									currentDay = days[daysCounter];
									if (data[i].Day === currentDay.day) {
										currentDay.availabilities.push({
											Id: data[i].Id,
											startTime: data[i].StartTime,
											endTime: data[i].EndTime
										});
										daysCounter = days.length;
									} else {
										daysCounter++;
									}
								} while (daysCounter < days.length);
							}
							return days;
						};
						$scope.arrays.availabilityDays = createDays(data.d.results);

					});
				new dataService.getItems('Schedule')
					.top(999999999)
					.select(['Id', 'Shift/Id', 'Shift/Day', 'Shift/StartTime', 'Shift/EndTime', 'Employee/Id'])
					.expand(['Shift', 'Employee'])
					.where({
						and: [
							['Employee/Id', 'eq', dataService.properties.currentUser.employeeInfo.Id],
							['Active', 'eq', 1]
						]
					})
					.execute(false)
					.success(function(data) {
						var schedules = data.d.results;
						new dataService.getItems('SubShift')
							.select(['Substitute/Id', 'Date', 'Shift/Id', 'Shift/StartTime', 'Shift/EndTime', 'Id'])
							.expand(['Substitute', 'Shift'])
							.where({
								and: [
									['Substitute', 'eq', dataService.properties.currentUser.employeeInfo.Id],
									['Date', 'ge datetime', new Date()
										.toISOString()
									],
									['Active', 'eq', 1]
								]
							})
							.execute(false)
							.success(function(data) {
								var subShifts = data.d.results,
									schedulesCounter = 0,
									date = '',
									weeks = [{
										title: 'This Week',
										days: []
									}, {
										title: 'Next Week',
										days: []
									}, {
										title: 'The Week After',
										days: []
									}],
									createNewShift = function(shift, subShift, subShiftId) {
										subShift = subShift || false;
										subShiftId = subShiftId || 0;
										return {
											Id: shift.Id,
											startTime: shift.StartTime,
											endTime: shift.EndTime,
											subShiftId: subShiftId,
											subRequested: false,
											subCovered: false,
											subShift: subShift
										};
									},
									getSubShifts = function(schedule) {
										if (schedulesCounter === schedules.length) {
											for (var l = 0; l < subShifts.length; l++) {
												for (var m = 0; m < weeks.length; m++) {
													for (var n = 0; n < weeks[m].days.length; n++) {
														if (Date.equals(weeks[m].days[n].date, new Date(subShifts[l].Date))) {
															weeks[m].days[n].shifts.push(createNewShift(subShifts[l].Shift, true, subShifts[l].Id));
														}
													}
												}
											}
											$scope.arrays.weeks = weeks;
										} else {
											var scheduleDays = schedule.Shift.Day.split(' - '),
												shiftCounter;
											for (var i = 0; i < scheduleDays.length; i++) {
												for (var j = 0; j < weeks.length; j++) {
													for (var k = 0; k < weeks[j].days.length; k++) {
														if (scheduleDays[i] === weeks[j].days[k].day) {
															weeks[j].days[k].shifts.push(createNewShift(schedule.Shift));
														}
													}
												}
											}
											new dataService.getItems('SubShift')
												.where({
													and: [
														['Shift', 'eq', schedule.Shift.Id],
														['Requester', 'eq', dataService.properties.currentUser.employeeInfo.Id],
														['Active', 'eq', 1]
													]
												})
												.execute(false)
												.success(function(data) {
													var subShift = {},
														date = '',
														checkShifts = function(shifts) {
															for (var i = 0; i < shifts.length; i++) {
																if (shifts[i].Id === subShift.ShiftId) {
																	shifts[i].subShiftId = subShift.Id;
																	if (subShift.SubstituteId === null) {
																		shifts[i].subRequested = true;
																	} else {
																		shifts[i].subCovered = true;
																		shifts[i].subRequested = true;
																	}

																}
															}
														};
													for (var i = 0; i < data.d.results.length; i++) {
														subShift = data.d.results[i];
														date = new Date(subShift.Date);
														for (var j = 0; j < weeks.length; j++) {
															for (var k = 0; k < weeks[j].days.length; k++) {
																if (Date.equals(weeks[j].days[k].date, date)) {
																	checkShifts(weeks[j].days[k].shifts);
																}
															}
														}
													}
													schedulesCounter++;
													getSubShifts(schedules[schedulesCounter]);
												});
										}
									};
								for (var i = 0; i < weeks.length; i++) {
									for (var j = 0; j < 7; j++) {
										date = Date.sun()
											.addDays(j)
											.addWeeks(i);
										weeks[i].days.push({
											day: date.toString('ddd'),
											date: date,
											past: date < Date.today(),
											shifts: []
										});
									}
								}
								getSubShifts(schedules[schedulesCounter]);
							});
					})
					.error(function(data) {
						$scope.arrays.errors.push(data);
					});
				new dataService.getItems('Schedule')
					.top(999999999)
					.select(['Id', 'Shift/Id', 'Shift/Day', 'Shift/StartTime', 'Shift/EndTime', 'Employee/Id', 'Employee/FirstName', 'Employee/LastName', 'Employee/PreferredName', 'Employee/Picture'])
					.expand(['Shift', 'Employee'])
					.where(['Active', 'eq', 1])
					.execute(false)
					.success(function(data) {
						var createDays = function() {
								var days = new Array(6);
								for (var i = 0; i < days.length; i++) {
									days[i] = {
										day: Date.mon()
											.addDays(i)
											.toString('ddd'),
										visible: true,
										shifts: []
									};
								}
								return days;
							},
							addEmployees = function(shift) {
								var employees = [],
									i = 0;
								for (i = 0; i < schedules.length; i++) {
									if (schedules[i].Shift.Id === shift.Id) {
										delete schedules[i].Employee.__metadata;
										schedules[i].Employee.ShiftId = shift.Id;
										schedules[i].Employee.ScheduleId = schedules[i].Id;
										employees.push(schedules[i].Employee);
									}
								}
								remainingSlots = shift.Slots - employees.length;
								if (remainingSlots !== 0) {
									for (i = 0; i < remainingSlots; i++) {
										employees.push({
											Id: 0,
											FirstName: 'No',
											LastName: 'Employee',
											PreferredName: '',
											Picture: '/media/missing.png',
											ShiftId: shift.Id,
											ScheduleId: 0
										});
									}
								}
								shift.employees = employees;
								return shift;
							},
							createShift = function(shift) {
								return {
									startTime: new Date(shift.StartTime),
									endTime: new Date(shift.EndTime),
									position: shift.Position.Position,
									employees: shift.employees
								};
							},
							compileSchedules = function() {
								var shift = {},
									tempDays = [],
									day = {},
									daysCounter = 0,
									shiftsCounter = 0;
								for (var i = 0; i < shifts.length; i++) {
									shift = createShift(addEmployees(shifts[i]));
									tempDays = shifts[i].Day.split(' - ');
									for (var j = 0; j < tempDays.length; j++) {
										daysCounter = 0;
										do {
											day = days[daysCounter];
											if (day.day === tempDays[j]) {
												if (day.shifts.length > 0) {
													shiftsCounter = 0;
													do {
														currentShift = day.shifts[shiftsCounter];
														if ((currentShift.startTime.toString('HH:mm') === shift.startTime.toString('HH:mm') && currentShift.endTime.toString('HH:mm') === shift.endTime.toString('HH:mm')) && currentShift.position === shift.position) {
															for (var k = 0; k < shift.employees.length; k++) {
																currentShift.employees.push(shift.employees[k]);
															}
															shiftsCounter = day.shifts.length;
														} else if (shiftsCounter === day.shifts.length - 1) {
															day.shifts.push(createShift(addEmployees(shifts[i])));
															shiftsCounter = day.shifts.length;
														} else {
															shiftsCounter++;
														}
													} while (shiftsCounter < day.shifts.length);
												} else {
													day.shifts.push(createShift(addEmployees(shifts[i])));
												}
												daysCounter = days.length;
											} else {
												daysCounter++;
											}
										} while (daysCounter < days.length);
									}
								}
							},
							getShifts = function() {
								new dataService.getItems('Shift')
									.top(999999999)
									.select(['Id', 'Day', 'Slots', 'Current', 'ShiftGroup/Description', 'ShiftGroup/Id', 'Position/Position', 'Position/Id', 'StartTime', 'EndTime'])
									.expand(['ShiftGroup', 'Position'])
									.where(['Current', 'eq', '1'])
									.execute(false)
									.success(function(data) {
										shifts = data.d.results;
										compileSchedules();
									});
							},
							days = createDays(),
							shifts = [],
							schedules = data.d.results;
						getShifts();
						compileSchedules();
						$scope.arrays.days = days;
					});
				new dataService.getItems('SubShift')
					.top(999999999)
					.select(['Substitute/Id', 'Date', 'Shift/Id', 'Shift/StartTime', 'Shift/EndTime', 'Id', 'Requester/FirstName', 'Requester/PreferredName', 'Requester/LastName', 'Requester/Id'])
					.expand(['Substitute', 'Shift', 'Requester'])
					.where({
						and: [
							['Date', 'ge datetime', new Date()
								.addDays(-1)
								.toISOString()
							],
							['Active', 'eq', 1]
						]
					})
					.execute(false)
					.success(function(data) {
						var createWeeks = function() {
								var weeks = new Array(3);
								for (var i = 0; i < weeks.length; i++) {
									weeks[i] = {
										title: 'Week ' + (i + 1),
										days: new Array(7)
									};
									for (var j = 0; j < weeks[i].days.length; j++) {
										weeks[i].days[j] = {
											date: Date.sun()
												.addDays(j)
												.addWeeks(i),
											shifts: []
										};
									}
								}
								return weeks;
							},
							subShifts = data.d.results,
							week = {},
							day = {},
							daysCounter = 0,
							weeksCounter = 0,
							weeks = createWeeks();
						for (var i = 0; i < subShifts.length; i++) {
							if (subShifts[i].Substitute.Id === undefined) {
								weeksCounter = 0;
								daysCounter = 0;
								do {
									week = weeks[weeksCounter];
									do {
										day = week.days[daysCounter];
										if (Date.equals(new Date(subShifts[i].Date), day.date)) {
											subShifts[i].Shift.SubShiftId = subShifts[i].Id;
											subShifts[i].Shift.Requester = subShifts[i].Requester;
											day.shifts.push(subShifts[i].Shift);
											daysCounter = week.days.length;
											weeksCounter = weeks.length;
										}
										daysCounter++;
									} while (daysCounter < week.days.length);
									daysCounter = 0;
									weeksCounter++;
								} while (weeksCounter < weeks.length);
							}
						}
						$scope.arrays.subShifts = weeks;
					});
				ctrl.isToday = function(date) {
					var today = Date.today();
					date = new Date(date);
					if (Date.equals(date, today)) {
						return true;
					} else {
						return false;
					}
				};
				ctrl.isWeekend = function(date) {
					date = new Date(date)
						.toString('dddd');
					if (date === 'Sunday' || date === 'Saturday') {
						return true;
					} else {
						return false;
					}
				};
			};
			ctrl.refreshContent();
			$scope.$on('Refresh Content', function() {
				ctrl.refreshContent();
			});
		}
	]);

	schedule.controller('AvailabilityCtrl', ['$scope', '$modal', 'dataService',
		function($scope, $modal, dataService) {
			var createDays = function() {
					var days = new Array(6);
					for (var i = 0; i < days.length; i++) {
						days[i] = {
							day: Date.mon()
								.addDays(i)
								.toString('ddd'),
							visible: true,
							shifts: []
						};
					}
					return days;
				},
				getShifts = function() {
					new dataService.getItems('Shift')
						.top(999999999)
						.select(['Id', 'Day', 'Current', 'ShiftGroup/Description', 'ShiftGroup/Id', 'Position/Position', 'Position/Id', 'StartTime', 'EndTime'])
						.expand(['ShiftGroup', 'Position'])
						.where(['Current', 'eq', '1'])
						.execute(false)
						.success(function(data) {
							shifts = data.d.results;
							getAvailabilities();
						});
				},
				getAvailabilities = function() {
					new dataService.getItems('Availability')
						.top(999999999)
						.select(['Employee/Id', 'Day', 'StartTime', 'EndTime', 'Id'])
						.expand(['Employee'])
						.where(['Current', 'eq', 1])
						.execute(false)
						.success(function(data) {
							allAvailabilities = data.d.results;
							getSchedules();
						});
				},
				getSchedules = function() {
					new dataService.getItems('Schedule')
						.top(999999999)
						.select(['Shift/StartTime', 'Shift/EndTime', 'Employee/Id'])
						.expand(['Shift', 'Employee'])
						.where(['Active', 'eq', 1])
						.execute(false)
						.success(function(data) {
							allSchedules = data.d.results;
							getEmployees();
						});
				},
				getEmployees = function() {
					new dataService.getItems('Employee')
						.top(999999999)
						.select(['Id', 'PreferredName', 'FirstName', 'LastName', 'PhoneNumber', 'EmailAddress', 'Picture', 'Position/Position', 'Position/Id', 'Area/Id', 'Area/Area'])
						.expand(['Position', 'Area'])
						.where(['Active', 'eq', 1])
						.execute(false)
						.success(function(data) {
							allActiveEmployees = data.d.results;
							compileDays();
						});
				},
				compileDays = function() {
					for (var day in days) {
						day = days[day];
						for (var shift in shifts) {
							checkShifts: {
								var needsNewShift = true,
									foundEmployee = false;
								shift = shifts[shift];
								shift.StartTime = new Date(shift.StartTime);
								shift.EndTime = new Date(shift.EndTime);
								shift.Position = shift.Position.Position || shift.Position;
								shift.Employees = [];
								var tempDays = shift.Day.replace(/\s/g, '')
									.split('-');
								for (var tempDay in tempDays) {
									tempDay = tempDays[tempDay];
									if (tempDay === day.day) {
										for (var dayShift in day.shifts) {
											dayShift = day.shifts[dayShift];

										}
										for (var employee in allActiveEmployees) {
											employee = allActiveEmployees[employee];
											if (shift.Position === employee.Position.Position ||
												(employee.Position.Position === 'Coordinator' &&
													employee.Area.Area === 'SARAS' &&
													shift.Position === 'Presenter') ||
												(employee.Position.Position === 'Coordinator' &&
													employee.Area.Area === 'Technology' &&
													shift.Position === 'Techy') ||
												(employee.Position.Position === 'Coordinator' &&
													employee.Area.Area === 'Main' &&
													shift.Position === 'Proctor')) {
												for (dayShift in day.shifts) {
													dayShift = day.shifts[dayShift];
													if (dayShift.StartTime.toString('HH:mm') === shift.StartTime.toString('HH:mm') &&
														dayShift.EndTime.toString('HH:mm') === shift.EndTime.toString('HH:mm') &&
														dayShift.Position === shift.Position) {
														break checkShifts;
													}
												}
												var notWorkingTheShift = !(checkSchedules(employee, shift));
												if (notWorkingTheShift) {
													checkAvailabilities(employee, shift, tempDay);
												}
											}
										}
										if (needsNewShift) {
											day.shifts.push({
												StartTime: shift.StartTime,
												EndTime: shift.EndTime,
												Position: shift.Position,
												Employees: shift.Employees
											});
											delete shift.Employees;
										}
									}
								}
							}
						}
					}
				},
				checkSchedules = function(employee, shift) {
					for (var schedule in allSchedules) {
						schedule = allSchedules[schedule];
						schedule.Shift.StartTime = new Date(schedule.Shift.StartTime);
						schedule.Shift.EndTime = new Date(schedule.Shift.EndTime);
						// alert(schedule.EmployeeId + ' === ' + employee.Id + '\n' + schedule.ShiftId + ' === ' + shift.Id);
						if (schedule.Employee.Id === employee.Id) {
							if ((schedule.Shift.StartTime.toString('HH:mm') === shift.StartTime.toString('HH:mm') ||
								schedule.Shift.EndTime.toString('HH:mm') === shift.EndTime.toString('HH:mm'))) {
								return true;
							}
						}
					}
					return false;
				},
				checkAvailabilities = function(employee, shift, day) {
					for (var availability in allAvailabilities) {
						availability = allAvailabilities[availability];
						availability.StartTime = new Date(availability.StartTime);
						availability.EndTime = new Date(availability.EndTime);
						// alert(day + ' === ' + availability.Day.substring(0,3));
						if (availability.Employee.Id === employee.Id &&
							availability.Day.substring(0, 3) === day &&
							availability.StartTime.toString('HH:mm') <= shift.StartTime.toString('HH:mm') &&
							availability.EndTime.toString('HH:mm') >= shift.EndTime.toString('HH:mm')) {
							shift.Employees.push({
								FirstName: employee.FirstName,
								PreferredName: employee.PreferredName,
								LastName: employee.LastName,
								Picture: employee.Picture,
								EmailAddress: employee.EmailAddress,
								PhoneNumber: employee.PhoneNumber
							});
							break;
						}
					}
				},
				days = createDays(),
				shifts = [],
				allActiveEmployees = [],
				allAvailabilities = [],
				allSchedules = [];
			getShifts();
			$scope.arrays.allAvailabilityDays = days;
		}
	]);

	schedule.controller('HrScheduleCtrl', ['$scope', '$modal', 'dataService',
		function($scope, $modal, dataService) {
			var ctrl = this;
			new dataService.getItems('Area')
				.top(999999999)
				.execute(true)
				.success(function(data) {
					$scope.arrays.areas = data.d.results;
				})
				.error(function(data) {
					$scope.arrays.errors.push(data);
				});
			new dataService.getItems('Track')
				.top(999999999)
				.execute(true)
				.success(function(data) {
					$scope.arrays.tracks = data.d.results;
				})
				.error(function(data) {
					$scope.arrays.errors.push(data);
				});
			ctrl.removeEmployee = function() {
				var item = {
					'__metadata': {
						'type': 'SP.Data.ScheduleListItem'
					},
					'Active': false
				};
				dataService.updateItem('Schedule', $scope.employee.ScheduleId, item, '*')
					.success(function(data) {
						$modal({
							show: true,
							placement: 'center',
							title: 'Notice',
							content: 'That employee no longer works this shift!'
						});
						$scope.$emit('Refresh Content');
					});
			};
			ctrl.assignShift = function(shiftId, employeeId) {
				var newSchedule = {
					'__metadata': {
						type: 'SP.Data.ScheduleListItem'
					},
					ShiftId: shiftId,
					EmployeeId: employeeId
				};
				dataService.addItem('Schedule', newSchedule)
					.success(function(data) {
						$modal({
							show: true,
							placement: 'center',
							title: 'Notice',
							content: 'The shift has been assigned!'
						});
						$scope.$emit('Refresh Content');
					});
			};
		}
	]);

	schedule.controller('TodayCtrl', ['$scope', '$modal', 'dataService',
		function($scope, $modal, dataService) {
			var ctrl = this;
			ctrl.getTodaySchedule = function() {
				var addEmployees = function(shift) {
						var employees = [],
							newEmployee = {},
							i = 0;
						for (i = 0; i < schedules.length; i++) {
							if (schedules[i].Shift.Id === shift.Id) {
								delete schedules[i].Employee.__metadata;
								schedules[i].Employee.ShiftId = shift.Id;
								newEmployee = schedules[i].Employee;
								newEmployee.NeedsASub = false;
								if (subShifts.length) {
									for (var j = 0; j < subShifts.length; j++) {
										if (subShifts[j].Shift.Id === shift.Id) {
											if (subShifts[j].Requester.Id === schedules[i].Employee.Id) {
												newEmployee.NeedsASub = true;
												if (subShifts[j].Substitute.Id !== undefined) {
													newEmployee = {
														Id: subShifts[j].Substitute.Id,
														FirstName: subShifts[j].Substitute.FirstName,
														LastName: subShifts[j].Substitute.LastName,
														PreferredName: subShifts[j].Substitute.PreferredName,
														Picture: subShifts[j].Substitute.Picture,
														ShiftId: shift.Id,
														NeedsASub: false,
														originalPreferredName: schedules[i].Employee.PreferredName,
														originalLastName: schedules[i].Employee.LastName,
														originalPicture: schedules[i].Employee.Picture
													};
												}
											}
										}
									}
									employees.push(newEmployee);
								} else {
									employees.push(newEmployee);
								}
							}
						}
						remainingSlots = shift.Slots - employees.length;
						if (remainingSlots !== 0) {
							for (i = 0; i < remainingSlots; i++) {
								employees.push({
									Id: 0,
									FirstName: 'No',
									LastName: 'Employee',
									PreferredName: '',
									Picture: '/media/missing.png',
									ShiftId: shift.Id,
									ScheduleId: 0
								});
							}
						}
						shift.employees = employees;
						return shift;
					},
					createShift = function(shift) {
						return {
							startTime: new Date(shift.StartTime),
							endTime: new Date(shift.EndTime),
							position: shift.Position.Position,
							employees: shift.employees
						};
					},
					compileSchedule = function() {
						var shift = {},
							tempDays = [],
							daysCounter = 0,
							shiftsCounter = 0;
						for (var i = 0; i < shifts.length; i++) {
							shift = createShift(addEmployees(shifts[i]));
							tempDays = shifts[i].Day.split(' - ');
							for (var j = 0; j < tempDays.length; j++) {
								if (day.day === tempDays[j]) {
									if (day.shifts.length > 0) {
										shiftsCounter = 0;
										do {
											currentShift = day.shifts[shiftsCounter];
											if ((currentShift.startTime.toString('HH:mm') === shift.startTime.toString('HH:mm') && currentShift.endTime.toString('HH:mm') === shift.endTime.toString('HH:mm')) && currentShift.position === shift.position) {
												for (var k = 0; k < shift.employees.length; k++) {
													currentShift.employees.push(shift.employees[k]);
												}
												shiftsCounter = day.shifts.length;
											} else if (shiftsCounter === day.shifts.length - 1) {
												day.shifts.push(createShift(addEmployees(shifts[i])));
												shiftsCounter = day.shifts.length;
											} else {
												shiftsCounter++;
											}
										} while (shiftsCounter < day.shifts.length);
									} else {
										day.shifts.push(createShift(addEmployees(shifts[i])));
									}
								}
							}
						}
						$scope.properties.today = day;
					},
					getShifts = function() {
						new dataService.getItems('Shift')
							.top(999999999)
							.select(['Id', 'Day', 'Slots', 'Current', 'ShiftGroup/Description', 'ShiftGroup/Id', 'Position/Position', 'Position/Id', 'StartTime', 'EndTime'])
							.expand(['ShiftGroup', 'Position'])
							.where(['Current', 'eq', '1'])
							.execute(false)
							.success(function(data) {
								shifts = data.d.results;
								compileSchedule();
							});
					},
					getSubShifts = function() {
						new dataService.getItems('SubShift')
							.top(999999999)
							.select(['Substitute/Id', 'Substitute/FirstName', 'Substitute/LastName', 'Substitute/PreferredName', 'Substitute/Picture', 'Date', 'Shift/Id', 'Shift/StartTime', 'Shift/EndTime', 'Id', 'Requester/Id'])
							.expand(['Substitute', 'Shift', 'Requester'])
							.where({
								and: [
									['Date', 'eq datetime', Date.today()
										.toISOString()
									],
									['Active', 'eq', 1]
								]
							})
							.execute(false)
							.success(function(data) {
								subShifts = data.d.results;
								getShifts();
							});
					},
					getSchedules = function() {
						new dataService.getItems('Schedule')
							.top(999999999)
							.select(['Id', 'Shift/Id', 'Shift/Day', 'Shift/StartTime', 'Shift/EndTime', 'Employee/Id', 'Employee/FirstName', 'Employee/LastName', 'Employee/PreferredName', 'Employee/Picture'])
							.expand(['Shift', 'Employee'])
							.where(['Active', 'eq', 1])
							.execute(false)
							.success(function(data) {
								schedules = data.d.results;
								getSubShifts();
							});
					},
					day = {
						day: Date.today()
							.toString('ddd'),
						shifts: []
					},
					subShifts = [],
					shifts = [],
					schedules = [];
				getSchedules();
			};
			ctrl.getTodaySchedule();
		}
	]);

	schedule.controller('MyScheduleCtrl', ['$scope', '$modal', 'dataService',
		function($scope, $modal, dataService) {
			var ctrl = this;
			ctrl.requestSub = function(shiftId, date) {
				var subRequest = {
					'__metadata': {
						type: 'SP.Data.SubShiftListItem'
					},
					ShiftId: shiftId,
					RequesterId: dataService.properties.currentUser.employeeInfo.Id,
					Date: date
				};
				dataService.addItem('SubShift', subRequest)
					.success(function(data) {
						$modal({
							show: true,
							placement: 'center',
							title: 'Notice',
							content: 'The sub has been requested!  You are responsible for this shift until a sub has taken it!'
						});
					});
				$scope.$emit('Refresh Content');

			};
			ctrl.cancelSubRequest = function() {
				var item = {
					'__metadata': {
						'type': 'SP.Data.SubShiftListItem'
					},
					'Active': false
				};
				dataService.updateItem('SubShift', $scope.shift.subShiftId, item, '*')
					.success(function(data) {
						$modal({
							show: true,
							placement: 'center',
							title: 'Notice',
							content: 'You are now responsible for this shift!'
						});
						$scope.$emit('Refresh Content');
					});
			};
		}
	]);

	schedule.controller('SubShiftCtrl', ['$scope', '$modal', 'dataService',
		function($scope, $modal, dataService) {
			var ctrl = this;
			ctrl.takeSubShift = function(subShiftId, shiftId, subShiftDate) {
				var shift = $scope.shift,
					item = {
						'__metadata': {
							'type': 'SP.Data.SubShiftListItem'
						},
						'SubstituteId': dataService.properties.currentUser.employeeInfo.Id
					};
				new dataService.getItems('Schedule')
					.select(['Shift/Id', 'Employee/Id'])
					.expand(['Shift', 'Employee'])
					.where({
						and: [
							['Shift/Id', 'eq', shiftId],
							['Employee/Id', 'eq', dataService.properties.currentUser.employeeInfo.Id],
							['Active', 'eq', 1]
						]
					})
					.execute(false)
					.success(function(data) {
						if (data.d.results.length > 0) {
							$modal({
								show: true,
								placement: 'center',
								title: 'Notice',
								content: 'You already work this shift!'
							});
						} else {
							new dataService.getItems('SubShift')
								.select(['Shift/Id', 'Substitute/Id'])
								.expand(['Shift', 'Substitute'])
								.where({
									and: [
										['Shift/Id', 'eq', shiftId],
										['Substitute/Id', 'eq', dataService.properties.currentUser.employeeInfo.Id],
										['Date', 'eq datetime', new Date(subShiftDate)
											.toISOString()
										],
										['Active', 'eq', 1]
									]
								})
								.execute(false)
								.success(function(data) {
									if (data.d.results.length > 0) {
										$modal({
											show: true,
											placement: 'center',
											title: 'Notice',
											content: 'You are already substituting for this shift!'
										});
									} else {
										dataService.updateItem('SubShift', subShiftId, item, '*')
											.success(function(data) {
												$modal({
													show: true,
													placement: 'center',
													title: 'Notice',
													content: 'You are now responsible for this shift!'
												});
												$scope.$emit('Refresh Content');
											})
											.error(function(data) {
												$modal({
													show: true,
													placement: 'center',
													title: 'Notice',
													content: JSON.stringify(data, null, '\t')
												});
											});
									}
								});
						}
					});
			};
		}
	]);

	schedule.controller('ShiftEditCtrl', ['$scope', '$modal', 'dataService',
		function($scope, $modal, dataService) {
			var ctrl = this,
				shift = $scope.shift,
				tmp = '';
			// init methods
			ctrl.workDays = [];
			ctrl.newShift = {
				'__metadata': {
					'type': 'SP.Data.ShiftListItem'
				},
				Day: '',
				temp: shift.Day.replace(/\s/g, '')
					.split('-'),
				Slots: shift.Slots,
				StartTime: shift.StartTime,
				EndTime: shift.EndTime,
				PositionId: shift.Position.Id,
				ShiftGroupId: shift.ShiftGroup.Id
			};
			for (var i = 0; i < 6; i++) {
				tmp = Date.mon()
					.addDays(i);
				ctrl.workDays[i] = {
					value: tmp.toString('ddd'),
					day: tmp.toString('dddd')
				};
			}
			ctrl.updateShift = function() {
				for (var i = 0; i < ctrl.newShift.temp.length; i++) {
					ctrl.newShift.Day += (i === ctrl.newShift.temp.length - 1) ? ctrl.newShift.temp[i].substr(0, 3) : ctrl.newShift.temp[i].substr(0, 3) + ' - ';
				}
				delete ctrl.newShift.temp;
				dataService.updateItem('Shift', shift.Id, ctrl.newShift, shift.__metadata.etag)
					.success(function(data) {
						$modal({
							show: true,
							placement: 'center',
							title: 'Notice',
							content: 'The shift has been updated!'
						});
						$scope.$emit('Refresh Content');
					})
					.error(function(data) {
						$modal({
							show: true,
							placement: 'center',
							title: 'Notice',
							content: JSON.stringify(data, null, '\t')
						});
					});
			};
			ctrl.deleteShift = function() {
				new dataService.getItems('Schedule')
					.select(['Id', 'Shift/Id'])
					.expand(['Shift'])
					.where({
						and: [
							['Active', 'eq', 1],
							['Shift/Id', 'eq', shift.Id]
						]
					})
					.execute(false)
					.success(function(data) {
						var schedules = data.d.results,
							schedulesCounter = 0,
							inactivateSchedule = function(schedule) {
								if (schedulesCounter === schedules.length) {
									dataService.updateItem('Shift', shift.Id, {
										'__metadata': {
											'type': 'SP.Data.ShiftListItem'
										},
										Current: false
									}, shift.__metadata.etag)
										.success(function(data) {
											$modal({
												show: true,
												placement: 'center',
												title: 'Notice',
												content: 'The shift has been deleted!'
											});
											$scope.$emit('Refresh Content');
										});
								} else {
									dataService.updateItem('Schedule', schedule.Id, {
										'__metadata': {
											'type': 'SP.Data.ScheduleListItem'
										},
										Active: false
									}, shift.__metadata.etag)
										.success(function(data) {
											schedulesCounter++;
											inactivateSchedule(schedulesCounter[schedulesCounter]);
										});
								}
							};
						inactivateSchedule(schedules[schedulesCounter]);
					});
				// dataService.deleteItem('Shift', id)
				// 	.success(function(data) {
				// 		$modal({
				// 			show: true,
				// 			placement: 'center',
				// 			title: 'Notice',
				// 			content: 'The shift has been deleted!'
				// 		});
				// 		$scope.$emit('Refresh Content');
				// 	})
				// 	.error(function(data) {
				// 		$scope.arrays.errors.push(data);
				// 	});
			};
			ctrl.takeShift = function(shiftId) {
				var newSchedule = {
					'__metadata': {
						type: 'SP.Data.ScheduleListItem'
					},
					ShiftId: shiftId,
					EmployeeId: dataService.properties.currentUser.employeeInfo.Id
				};
				new dataService.getItems('Schedule')
					.select(['Shift/Id', 'Employee/Id'])
					.expand(['Shift', 'Employee'])
					.where({
						and: [
							['Shift/Id', 'eq', shiftId],
							['Employee/Id', 'eq', dataService.properties.currentUser.employeeInfo.Id],
							['Active', 'eq', 1]
						]
					})
					.execute(false)
					.success(function(data) {
						if (data.d.results.length > 0) {
							$modal({
								show: true,
								placement: 'center',
								title: 'Notice',
								content: 'You already work this shift!'
							});
						} else {
							dataService.addItem('Schedule', newSchedule)
								.success(function(data) {
									$modal({
										show: true,
										placement: 'center',
										title: 'Notice',
										content: 'You are now responsible to work this shift!'
									});
									$scope.$emit('Refresh Content');
								});
						}
					});
			};
		}
	]);

	schedule.controller('ShiftCreationCtrl', ['$scope', '$modal', 'dataService',
		function($scope, $modal, dataService) {
			var ctrl = this,
				newItem = {};
			$scope.newShift = {
				'__metadata': {
					type: 'SP.Data.ShiftListItem'
				},
				Day: '',
				Current: true
			};
			ctrl.addShift = function() {
				for (var i = 0; i < $scope.newShift.temp.length; i++) {
					$scope.newShift.Day += (i === $scope.newShift.temp.length - 1) ? $scope.newShift.temp[i].substr(0, 3) : $scope.newShift.temp[i].substr(0, 3) + ' - ';
				}
				delete $scope.newShift.temp;
				for (var attribute in $scope.newShift) {
					if (attribute.indexOf('Id') > 0) {
						$scope.newShift[attribute] = parseInt($scope.newShift[attribute]);
					}
				}
				newItem = $scope.newShift;
				dataService.addItem('Shift', newItem)
					.success(function(data) {
						$modal({
							show: true,
							placement: 'center',
							title: 'Notice',
							content: 'The shift has been added!'
						});
					})
					.error(function(data) {
						$scope.arrays.errors.push(data);
					});

				$scope.newShift = {
					'__metadata': {
						type: 'SP.Data.ShiftListItem'
					},
					Day: '',
					Current: true
				};
				$scope.$emit('Refresh Content');
			};
		}
	]);

	schedule.controller('MyAvailabilityCtrl', ['$scope', '$modal', 'dataService',
		function($scope, $modal, dataService) {
			var ctrl = this;
			ctrl.newAvailability = {
				'__metadata': {
					type: 'SP.Data.AvailabilityListItem'
				},
				Day: $scope.day.day,
				StartTime: $scope.availability.startTime || '',
				EndTime: $scope.availability.endTime || '',
				EmployeeId: dataService.properties.currentUser.employeeInfo.Id
			};
			ctrl.updateAvailability = function() {
				delete ctrl.newAvailability.EmployeeId;
				delete ctrl.newAvailability.Day;
				dataService.updateItem('Availability', $scope.availability.Id, ctrl.newAvailability, '*')
					.success(function(data) {
						$modal({
							show: true,
							placement: 'center',
							title: 'Notice',
							content: 'The shift has been updated!'
						});
						$scope.$emit('Refresh Content');
					})
					.error(function(data) {
						$modal({
							show: true,
							placement: 'center',
							title: 'Notice',
							content: JSON.stringify(data, null, '\t')
						});
					});
			};
			ctrl.removeAvailability = function() {
				dataService.deleteItem('Availability', $scope.availability.Id)
					.success(function(data) {
						$modal({
							show: true,
							placement: 'center',
							title: 'Notice',
							content: 'The availability has been removed!'
						});
						$scope.$emit('Refresh Content');
					});
			};
		}
	]);
	schedule.controller('AddAvailability', ['$scope', '$modal', 'dataService',
		function($scope, $modal, dataService) {
			var ctrl = this;
			ctrl.newAvailability = {
				'__metadata': {
					type: 'SP.Data.AvailabilityListItem'
				},
				Day: $scope.day.day,
				StartTime: '',
				EndTime: '',
				EmployeeId: dataService.properties.currentUser.employeeInfo.Id
			};
			ctrl.addAvailability = function() {
				ctrl.newAvailability.StartTime = ctrl.newAvailability.StartTime.toISOString();
				ctrl.newAvailability.EndTime = ctrl.newAvailability.EndTime.toISOString();
				dataService.addItem('Availability', ctrl.newAvailability)
					.success(function(data) {
						$modal({
							show: true,
							placement: 'center',
							title: 'Notice',
							content: 'The availability has been added!'
						});
						$scope.$emit('Refresh Content');
					});
			};
		}
	]);

})();
