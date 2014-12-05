/* 
 * @Author: Jonathan Baird
 * @Date:   2014-11-18 16:24:40
 * @Last Modified 2014-11-20
 * @Last Modified time: 2014-11-20 15:36:53
 */

getTodaySchedule = function() {
	///////////////
	// Variables //
	///////////////

	// Definition
	var subShifts, shifts, schedules;

	// Initialization
	ctrl = this;
	subShifts = [];
	shifts = [];
	schedules = [];

	/////////////
	// Methods //
	/////////////

	// Definition
	var getSubShifts = function() {
		new dataService.getItems('SubShift')
			.top()
			.select(
				['Id',
					'Date',
					'Substitute/Id',
					'Substitute/LastName',
					'Substitute/PreferredName',
					'Substitute/Picture',
					'Substitute/PhoneNumber',
					'Substitute/EmailAddress',
					'Requester/Id',
					'Requester/LastName',
					'Requester/PreferredName',
					'Requester/Picture',
					'Requester/PhoneNumber',
					'Requester/EmailAddress',
					'Shift/Id',
					'Shift/StartTime',
					'Shift/EndTime',
					'Requester/Id',
					'NewRequest/Id'
				]
			)
			.expand(
				['Substitute',
					'Shift',
					'Requester',
					'NewRequest',
				]
			)
			.where({
				and: [
					['Date',
						'eq datetime',
						ctrl.queryDate.toISOString()
					],
					['Active',
						'eq',
						1
					]
				]
			})
			.execute()
			.success(function(data) {
				subShifts = data.d.results;
			});
	};
	var getSchedules = function() {
		new dataService.getItems('Schedule')
			.top()
			.select(
				['Id',
					'Shift/Id',
					'Shift/Day',
					'Employee/Id',
					'Employee/LastName',
					'Employee/PreferredName',
					'Employee/Picture',
					'Employee/PhoneNumber',
					'Employee/EmailAddress'
				]
			)
			.expand(
				['Employee',
					'Shift'
				]
			)
			.where({
				and: [
					['Active',
						'eq',
						1
					], (
						'substringof(\'' +
						ctrl.queryDate.toString('ddd') +
						'\', Shift/Day'
					)
				]
			})
			.execute()
			.success(function(data) {
				schedules = data.d.results;
			});
	};
	var getShifts = function() {
		new dataService.getItems('Shift')
			.top()
			.select(
				['Id',
					'Day',
					'Slots',
					'Current',
					'ShiftGroup/Description',
					'ShiftGroup/Id',
					'Position/Position',
					'Position/Id',
					'StartTime',
					'EndTime'
				]
			)
			.expand(
				['ShiftGroup',
				]
			)
			.where({
				and: [
					['Current',
						'eq',
						1
					], (
						'substringof(\'' +
						ctrl.queryDate.toString('ddd') +
						'\', Day'
					)
				]
			})
			.execute()
			.success(function(data) {
				shifts = data.d.results;
			});
	};
	var addEmployee = function(params) {
		var employee = params.employee || {
			PreferredName: 'No',
			LastName: 'Employee',
			Picture: '/media/missing.png',
		};
		var substitute = params.substitute || {
			PreferredName: '',
			LastName: '',
			Picture: ''
		};
		var needsASub = params.needsASub || false;
		return {
			// original employee info
			employeePreferredName: employee.PreferredName,
			employeeLastName: employee.LastName,
			employeePhoneNumber: employee.PhoneNumber,
			employeeEmailAddress: employee.EmailAddress,
			employeePicture: employee.Picture,
			// substitute employee info
			substitutePreferredName: substitute.PreferredName,
			substituteLastName: substitute.LastName,
			substitutePhoneNumber: substitute.PhoneNumber,
			substituteEmailAddress: substitute.EmailAddress,
			substitutePicture: substitute.Picture,
			// false since there is a sub 
			needsASub: needsASub
		};
	};
	var findNewRequest = function(id) {
		return _.find(subShifts, function(subShift) {
			return subShift.Id === id;
		});
	};
	var getShiftEmployees = function(shift) {
		var relevantSchedules, relevantSubShifts, returnEmployeeArray;
		returnEmployeeArray = [];
		relevantSchedules = _.filter(schedules, function(schedule) {
			return schedule.Shift.Id === shift.Id;
		});
		relevantSubShifts = _.filter(subShifts, function(subShift) {
			return subShift.Shift.Id === shift.Id;
		});
		_.each(relevantSchedules, function(schedule) {
			var substitute = _.find(relevantSubShifts, function(subShift) {
				return subShift.Requester.Id === schedule.Employee.Id;
			});
			if (substitute !== undefined) {
				relevantSubShifts = _.without(relevantSubShifts, substitute);
				while (substitute.NewRequest.Id !== undefined) {
					substitute = findNewRequest(substitute.Id);
					relevantSubShifts = _.without(relevantSubShifts, substitute);
					substitute.isNewRequest = true;
				}
				if (substitute.Substitute.Id !== undefined) {
					// we pass the basics, the original employee and the substitute
					returnEmployeeArray.push(addEmployee({
						substitute: substitute.Substitute,
						employee: schedule.Employee,
					}));
				} else if (substitute.isNewRequest) {
					// we are using the requester as the sub because he/she is the current sub until his/her request is filled
					returnEmployeeArray.push(addEmployee({
						substitute: substitute.Requester,
						employee: schedule.Employee,
						needsASub: true
					}));
				} else {
					// we pass the original employee and true because there is a sub request but no sub yet
					returnEmployeeArray.push(addEmployee({
						employee: schedule.Employee,
						needsASub: true
					}));
				}
			} else {
				// we pass the original employee
				returnEmployeeArray.push(addEmployee({
					employee: schedule.Employee,
				}));
			}
		});
		while (returnEmployeeArray.length < shift.Slots) {
			returnEmployeeArray.push(addEmployee({
				needsASub: true
			}));
		}
		_.each(relevantSubShifts, function(subShift) {
			var extraEmployee = {
				PreferredName: 'Extra',
				LastName: '',
				PhoneNumber: '',
				EmailAddress: '',
				Picture: 'media/missing.png'
			};
			while (subShift.NewRequest.Id !== undefined) {
				subShift = findNewRequest(subShift.Id);
				relevantSubShifts = _.without(relevantSubShifts, subShift);
				subShift.isNewRequest = true;
			}
			if (subShift.Substitute.Id !== undefined) {
				// we pass the basics, the original employee and the substitute
				returnEmployeeArray.push(addEmployee({
					substitute: subShift.Substitute,
					employee: extraEmployee
				}));
			} else if (subShift.isNewRequest) {
				// we are using the requester as the sub because he/she is the current sub until his/her request is filled
				returnEmployeeArray.push(addEmployee({
					substitute: subShift.Requester,
					employee: extraEmployee,
					needsASub: true
				}));
			} else {
				// we pass the original employee and true because there is a sub request but no sub yet
				returnEmployeeArray.push(addEmployee({
					employee: extraEmployee,
					needsASub: true
				}));
			}
		});
	};
	var compileDayViewShifts = function() {
		_.each(shifts, function(shift) {
			dayView.shifts.push({
				startTime: shift.StartTime,
				endTime: shift.EndTime,
				position: shift.Position.Position,
				employees: getShiftEmployees(shift)
			});
		});
	};
};






















.getTodaySchedule = function() {
				var addEmployees = function(shift) {
						var employees = [],
							newEmployee = {},
							j = 0,
							i = 0;
						for (i = 0; i < schedules.length; i++) {
							if (schedules[i].Shift.Id === shift.Id) {
								delete schedules[i].Employee.__metadata;
								schedules[i].Employee.ShiftId = shift.Id;
								newEmployee = schedules[i].Employee;
								newEmployee.NeedsASub = false;
								if (subShifts.length) {
									for (j = 0; j < subShifts.length; j++) {
										if (subShifts[j].Shift.Id === shift.Id) {
											if (subShifts[j].Requester.Id === schedules[i].Employee.Id) {
												subShifts[j].hasBeenAdded = true;
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
						for (j = 0; j < subShifts.length; j++) {
							if (subShifts[j].Shift.Id === shift.Id) {
								if (!subShifts[j].hasBeenAdded) {
									if (subShifts[j].Substitute.Id !== undefined) {
										newEmployee = {
											Id: subShifts[j].Substitute.Id,
											FirstName: subShifts[j].Substitute.FirstName,
											LastName: subShifts[j].Substitute.LastName,
											PreferredName: subShifts[j].Substitute.PreferredName,
											Picture: subShifts[j].Substitute.Picture,
											ShiftId: shift.Id,
											NeedsASub: false,
											originalPreferredName: 'Extra',
											originalLastName: '',
											originalPicture: 'media/missing.png'
										};
									} else {
										newEmployee = {
											Id: subShifts[j].Requester.Id,
											FirstName: '',
											LastName: '',
											PreferredName: 'Extra',
											Picture: 'media/missing.png',
											ShiftId: shift.Id,
											NeedsASub: true
										};
									}
									employees.push(newEmployee);
								}
							}
						}
						var remainingSlots = shift.Slots - employees.length;
						if (remainingSlots > 0) {
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
							// daysCounter = 0,
							shiftsCounter = 0;
						for (var i = 0; i < shifts.length; i++) {
							shift = createShift(addEmployees(shifts[i]));
							tempDays = shifts[i].Day.split(' - ');
							for (var j = 0; j < tempDays.length; j++) {
								if (day.day === tempDays[j]) {
									if (day.shifts.length > 0) {
										shiftsCounter = 0;
										do {
											var currentShift = day.shifts[shiftsCounter];
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
							.select(['Substitute/Id', 'Substitute/FirstName', 'Substitute/LastName', 'Substitute/PreferredName', 'Substitute/Picture', 'Date', 'Shift/Id', 'Shift/StartTime', 'Shift/EndTime', 'Id', 'Requester/Id', 'Requester/FirstName', 'Requester/LastName', 'Requester/PreferredName', 'Requester/Picture'])
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