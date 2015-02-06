/*
 * @Author: Jonathan Baird
 * @Date:   2014-10-28 15:04:12
 * @Last Modified 2014-12-02
 * @Last Modified time: 2015-02-05 20:18:56
 */
/* global angular, _ */

(function() {
	'use strict';
	Function.prototype.method = function(name, func) {
		this.prototype[name] = func;
		return this;
	};
	Function.method('inherits', function(parent) {
		this.prototype = new parent();
		var d = {},
			p = this.prototype;
		this.prototype.constructor = parent;
		this.method('uber', function uber(name) {
			if (!(name in d)) {
				d[name] = 0;
			}
			var f, r, t = d[name],
				v = parent.prototype;
			if (t) {
				while (t) {
					v = v.constructor.prototype.constructor;
					t -= 1;
				}
				f = v[name];
			} else {
				f = p[name];
				if (f == this[name]) {
					f = v[name];
				}
			}
			d[name] += 1;
			r = f.apply(this, Array.prototype.slice.apply(arguments, [1]));
			d[name] -= 1;
			return r;
		});
		return this;
	});
	var app = angular.module('Services');

	app.service('dataService', ['$http', '$timeout', '$q', '$location', 'generalService', 'cfpLoadingBar', '$alert',
		function($http, $timeout, $q, $location, generalService, cfpLoadingBar, $alert) {
			var service = this;
			var dataInitialized = false;
			/////////////////////////////
			// Set aliases to the data //
			/////////////////////////////
			var DATA = generalService.data,
				ARRAYS = generalService.arrays,
				PROPERTIES = generalService.properties;

			///////////////////////////////////
			// Initialize service categories //
			///////////////////////////////////
			service.classes = {};
			service.get = {};
			service.set = {};
			service.utilities = {};
			service.refresh = {
				successAlert: {
					show: true,
					placement: 'top-right',
					content: 'Data has been refreshed!',
					animation: 'am-fade-and-slide-top',
					duration: '3',
					type: 'success',
					template: 'partials/alerts/error-alert.html'
				}
			};

			///////////////////////////////////////
			// Set aliases to service categories //
			///////////////////////////////////////
			var GET = service.get,
				SET = service.set,
				REFRESH = service.refresh,
				CLASSES = service.classes,
				UTILITIES = service.utilities;

			//////////////////
			// DATA GETTERS //
			//////////////////
			GET.areas = function() {
				var deffered = $q.defer();
				UTILITIES.fetchAllItems('Area')
					.success(function(data) {
						DATA.areas = [];
						_.each(data.d.results, function(area) {
							DATA.areas.push(new CLASSES.Area(area));
						});
						deffered.resolve();
					});
				return deffered.promise;
			};
			GET.areaPositions = function() {
				var deffered = $q.defer();
				UTILITIES.fetchAllItems('AreaPosition')
					.success(function(data) {
						DATA.areaPositions = [];
						_.each(data.d.results, function(areaPosition) {
							areaPosition = new CLASSES.AreaPosition(areaPosition);
							DATA.areaPositions.push(areaPosition);
							if (areaPosition.Position.Description !== 'FTE' &&
								areaPosition.Position.Description !== 'Applicant' &&
								areaPosition.Position.Description !== 'Admin') {
								if (PROPERTIES.currentUser.PositionId !== PROPERTIES.currentUser.Area.DefaultPositionId &&
									// PROPERTIES.currentUser.Position.Description !== 'FTE' &&
									!PROPERTIES.currentUser.Admin) {
									if (areaPosition.AreaId === PROPERTIES.currentUser.AreaId) {
										ARRAYS.positions.push(areaPosition.Position);
									}
								}
							}
						});
						deffered.resolve();
					});
				return deffered.promise;
			};
			GET.availabilities = function() {
				var deffered = $q.defer();
				UTILITIES.fetchAllItems('Availability')
					.success(function(data) {
						DATA.availabilitys = [];
						_.each(data.d.results, function(availability) {
							DATA.availabilitys.push(new CLASSES.Availability(availability));
						});
						deffered.resolve();
					});
				return deffered.promise;
			};
			GET.employees = function() {
				var deffered = $q.defer();
				UTILITIES.fetchAllItems('Employee')
					.success(function(data) {
						DATA.employees = [];
						ARRAYS.employees = [];
						_.each(data.d.results, function(employee) {
							employee = new CLASSES.Employee(employee);
							DATA.employees.push(employee);
							ARRAYS.employees.push(employee);
							if (employee.Id === PROPERTIES.currentUser.Id) {
								PROPERTIES.currentUser = employee;
							}
						});
						deffered.resolve();
					});
				return deffered.promise;
			};
			GET.employments = function() {
				var deffered = $q.defer();
				UTILITIES.fetchAllItems('Employment')
					.success(function(data) {
						DATA.employments = [];
						_.each(data.d.results, function(employment) {
							DATA.employments.push(new CLASSES.Employment(employment));
						});
						deffered.resolve();
					});
				return deffered.promise;
			};
			GET.facultyTestingInfos = function() {
				var deffered = $q.defer();
				UTILITIES.fetchAllItems('FacultyTestingInfo')
					.success(function(data) {
						DATA.facultyTestingInfos = [];
						_.each(data.d.results, function(facultyTestingInfo) {
							facultyTestingInfo = new CLASSES.FacultyTestingInfo(facultyTestingInfo);
							DATA.facultyTestingInfos.push(facultyTestingInfo);
						});
						deffered.resolve();
					});
				return deffered.promise;
			};
			GET.messages = function() {
				var deffered = $q.defer();
				UTILITIES.fetchAllItems('Message')
					.success(function(data) {
						DATA.messages = [];
						ARRAYS.policies = [];
						_.each(data.d.results, function(message) {
							message = new CLASSES.Message(message);
							DATA.messages.push(message);
							if ((message.AreaId === PROPERTIES.currentUser.AreaId ||
									message.Area.Description === 'Director') &&
								message.Active &&
								message.Policy) {
								ARRAYS.policies.push(message);
							}
						});
						deffered.resolve();
					});
				return deffered.promise;
			};
			GET.noTestingDays = function() {
				var deffered = $q.defer();
				UTILITIES.fetchAllItems('NoTestingDay')
					.success(function(data) {
						DATA.noTestingDays = [];
						_.each(data.d.results, function(noTestingDay) {
							DATA.noTestingDays.push(new CLASSES.NoTestingDay(noTestingDay));
						});
						deffered.resolve();
					});
				return deffered.promise;
			};
			GET.positions = function() {
				var deffered = $q.defer();
				UTILITIES.fetchAllItems('Position')
					.success(function(data) {
						DATA.positions = [];
						ARRAYS.positions = [];
						_.each(data.d.results, function(position) {
							position = new CLASSES.Position(position);
							DATA.positions.push(position);
							if (position.Description !== 'FTE' &&
								position.Description !== 'Applicant' &&
								position.Description !== 'Admin') {
								if (PROPERTIES.currentUser.Id) {
									if (PROPERTIES.currentUser.Admin
										/*||
																				PROPERTIES.currentUser.Position.Description === 'FTE'*/
									) {
										ARRAYS.positions.push(position);
									} else if (
										PROPERTIES.currentUser.PositionId === PROPERTIES.currentUser.Area.DefaultPositionId &&
										PROPERTIES.currentUser.PositionId === position.Id
									) {
										ARRAYS.positions.push(position);
									}
								}
							}
						});
						ARRAYS.allPositions = DATA.positions;
						deffered.resolve();
					});
				return deffered.promise;
			};
			GET.professors = function() {
				var deffered = $q.defer();
				UTILITIES.fetchAllItems('Professor')
					.success(function(data) {
						DATA.professors = [];
						_.each(data.d.results, function(professor) {
							DATA.professors.push(new CLASSES.Professor(professor));
						});
						deffered.resolve();
					});
				return deffered.promise;
			};
			GET.schedules = function() {
				var deffered = $q.defer();
				UTILITIES.fetchAllItems('Schedule')
					.success(function(data) {
						DATA.schedules = [];
						_.each(data.d.results, function(schedule) {
							DATA.schedules.push(new CLASSES.Schedule(schedule));
						});
						deffered.resolve();
					});
				return deffered.promise;
			};
			GET.sentMessages = function() {
				var deffered = $q.defer();
				UTILITIES.fetchAllItems('SentMessage')
					.success(function(data) {
						DATA.sentMessages = [];
						ARRAYS.messages = [];
						PROPERTIES.unreadMessages = 0;
						_.each(data.d.results, function(sentMessage) {
							sentMessage = new CLASSES.SentMessage(sentMessage);
							if (sentMessage.Message.Active &&
								sentMessage.EmployeeId === PROPERTIES.currentUser.Id &&
								sentMessage.Message.Semester.Id === PROPERTIES.currentSemester.Id &&
								Date.today().compareTo(sentMessage.Message.ExpDate) < 1) {
								if (!sentMessage.Read &&
									sentMessage.Message.Mandatory) {
									PROPERTIES.unreadMessages++;
								}
								ARRAYS.messages.push(sentMessage);
							}
							DATA.sentMessages.push(sentMessage);
						});
						ARRAYS.messages.activePanel = -1;
						deffered.resolve();
					});
				return deffered.promise;
			};
			GET.semesters = function() {
				var deffered = $q.defer();
				UTILITIES.fetchAllItems('Semester')
					.success(function(data) {
						DATA.semesters = [];
						data.d.results.reverse();
						_.each(data.d.results, function(semester) {
							DATA.semesters.push(new CLASSES.Semester(semester));
						});
						SET.propertyCurrentSemester();
						deffered.resolve();
					});
				return deffered.promise;
			};
			GET.shiftGroups = function() {
				var deffered = $q.defer();
				UTILITIES.fetchAllItems('ShiftGroup')
					.success(function(data) {
						DATA.shiftGroups = [];
						_.each(data.d.results, function(shiftGroup) {
							DATA.shiftGroups.push(new CLASSES.ShiftGroup(shiftGroup));
						});
						deffered.resolve();
					});
				return deffered.promise;
			};
			GET.shifts = function() {
				var deffered = $q.defer();
				UTILITIES.fetchAllItems('Shift')
					.success(function(data) {
						DATA.shifts = [];
						_.each(data.d.results, function(shift) {
							DATA.shifts.push(new CLASSES.Shift(shift));
						});
						deffered.resolve();
					});
				return deffered.promise;
			};
			GET.subShifts = function() {
				var deffered = $q.defer();
				UTILITIES.fetchAllItems('SubShift')
					.success(function(data) {
						DATA.subShifts = [];
						data.d.results.reverse();
						_.each(data.d.results, function(subShift) {
							DATA.subShifts.push(new CLASSES.SubShift(subShift));
						});
						deffered.resolve();
					});
				return deffered.promise;
			};
			GET.tracks = function() {
				var deffered = $q.defer();
				UTILITIES.fetchAllItems('Track')
					.success(function(data) {
						DATA.tracks = [];
						_.each(data.d.results, function(track) {
							DATA.tracks.push(new CLASSES.Track(track));
						});
						deffered.resolve();
					});
				return deffered.promise;
			};

			//////////////////////
			// PROPERTY SETTERS //
			//////////////////////
			SET.propertyCurrentUser = function() {
				// TODO: break this down into multiple functions
				var deffered = $q.defer();
				UTILITIES.fetchCurrentUser()
					.success(function(data) {
						var userInfo = data.d;
						new UTILITIES.fetchItems('Employee')
							.where(['EmailAddress', 'eq', userInfo.Email])
							.execute()
							.success(function(data) {
								if (data.d.results.length > 0) {
									if (data.d.results[0].Active) {
										PROPERTIES.loadEmployeeData = true;
										GET.positions()
											.then(function() {
												GET.areas()
													.then(function() {
														GET.tracks()
															.then(function() {
																PROPERTIES.currentUser = new CLASSES.Employee(data.d.results[0]);
																PROPERTIES.extendedPrivledges = (
																	PROPERTIES.currentUser.Admin ||
																	PROPERTIES.currentUser.Position.Description === 'FTE' ||
																	PROPERTIES.currentUser.Position.Description === 'HR'
																);
																deffered.resolve();
															});
													});
											});
									} else if (/([a-zA-Z]){3}\d{5}/.test(userInfo.Email)) {
										$location.path("/inactiveEmployee");
										deffered.resolve();
									}
								} else if (!(/([a-zA-Z]){3}\d{5}/.test(userInfo.Email))) {
									new UTILITIES.fetchItems('Professor')
										.where(['EmailAddress', 'eq', data.d.Email])
										.execute()
										.success(function(data) {
											$location.path("/main/faculty/info");
											if (data.d.results.length > 0) {
												PROPERTIES.currentUser = new CLASSES.Professor(data.d.results[0]);
											} else {
												PROPERTIES.currentUser = new CLASSES.Professor({
													EmailAddress: userInfo.Email
												});
											}
											deffered.resolve();
										});
								} else {
									$location.path("/inactiveEmployee");
									deffered.resolve();
								}
							});
					});
				return deffered.promise;
			};
			SET.propertyCurrentSemester = function() {
				PROPERTIES.currentSemester = _.find(DATA.semesters, function(semester) {
					return semester.Active;
				});
				if (PROPERTIES.currentSemester.NextSemesterId !== undefined) {
					PROPERTIES.nextSemester = _.find(DATA.semesters, function(semester) {
						return semester.Id === PROPERTIES.currentSemester.NextSemesterId;
					});
				}
			};
			SET.propertyToday = function(date) {
				date = date || PROPERTIES.today.date;
				var dayView = {
					title: date.toString('dddd'),
					day: date.toString('ddd'),
					shifts: [],
					date: date
				};
				_.each(DATA.shifts, function(shift) {
					if (shift.Active &&
						shift.ShiftGroupId === PROPERTIES.currentSemester.ShiftGroupId &&
						shift.Day.indexOf(date.toString('ddd')) >= 0) {
						// get employee Information for this shift.
						var assignableEmployees = getShiftEmployees(shift);
						// check to see if we have already dealt with this time period
						var currentShift = _.find(dayView.shifts, function(dayShift) {
							return (
								dayShift.StartTime.toTimeString() === shift.StartTime.toTimeString() &&
								dayShift.EndTime.toTimeString() === shift.EndTime.toTimeString() &&
								dayShift.PositionId === shift.PositionId
							);
						});
						// if we have add the employees to the previousShift
						if (currentShift) {
							_.each(assignableEmployees, function(employee) {
								currentShift.Employees.push(employee);
							});
							// if we haven't create a new shift and add the employees to that.
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
				PROPERTIES.today = dayView;

				function addEmployee(params) {
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
				}

				function getShiftEmployees(shift) {
					var subShifts, returnEmployeeArray;
					returnEmployeeArray = [];
					subShifts = _.filter(DATA.subShifts, function(subShift) {
						return (
							subShift.Shift.Id === shift.Id &&
							subShift.Active &&
							subShift.Date.equals(date)
						);
					});
					_.each(DATA.schedules, function(schedule) {
						if (schedule.Active &&
							schedule.Shift.Day.indexOf(date.toString('ddd')) >= 0 &&
							schedule.Shift.Id === shift.Id) {
							var substitute = _.find(subShifts, function(subShift) {
								return subShift.Requester.Id === schedule.Employee.Id;
							});
							if (substitute !== undefined) {
								subShifts = _.without(subShifts, substitute);
								while (substitute.NewRequest.Id !== undefined) {
									substitute = substitute.NewRequest;
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
						}
					});
					while (returnEmployeeArray.length < shift.Slots) {
						returnEmployeeArray.push(addEmployee({
							needsASub: true
						}));
					}
					_.each(subShifts, function(subShift) {
						var extraEmployee = {
							PreferredName: 'Extra',
							LastName: '',
							PhoneNumber: '',
							EmailAddress: '',
							Picture: 'media/missing.png'
						};
						while (subShift.NewRequest.Id !== undefined) {
							subShift = subShift.NewRequest;
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
					return returnEmployeeArray;
				}
			};
			///////////////////
			// ARRAY SETTERS //
			///////////////////
			SET.arrayNoAvailabilityEmployees = function() {
				ARRAYS.noAvailabilityEmployees = [];
				_.each(DATA.employees, function(employee) {
					var submittedAvailabilities = _.find(DATA.availabilitys, function(availability) {
						return (
							availability.Employee.Id === employee.Id &&
							availability.Semester.Id === PROPERTIES.currentSemester.Id
						);
					});
					if (submittedAvailabilities === undefined &&
						employee.Position.Description !== 'FTE' &&
						employee.Position.Description !== 'Applicant' &&
						employee.Active) {
						ARRAYS.noAvailabilityEmployees.push(employee);
					}
				});
			};
			SET.arrayWeeks = function(numWeeks) {
				numWeeks = numWeeks || 3;
				ARRAYS.weeks = [];
				var sunDate = Date.sunday();
				var weekTitle = '';
				for (var i = 0; i < numWeeks; i++) {
					weekTitle = 'Week ' + (i + 1);
					ARRAYS.weeks.push(new CLASSES.Week(weekTitle, sunDate));
					sunDate.addWeeks(1);
				}
			};
			SET.arrayShifts = function() {
				ARRAYS.shifts = [];
				_.each(DATA.shifts, function(shift) {
					shift.setAvailableSlots();
				});
				ARRAYS.shifts = _.filter(DATA.shifts, function(shift) {
					return shift.Active;
				});
			};
			SET.arrayShiftGroups = function() {
				ARRAYS.shiftGroups = [];
				_.each(DATA.shiftGroups, function(shiftGroup) {
					if (PROPERTIES.nextSemester.ShiftGroup !== undefined) {
						shiftGroup.Active = (
							shiftGroup.Id === PROPERTIES.currentSemester.ShiftGroup.Id ||
							shiftGroup.Id === PROPERTIES.nextSemester.ShiftGroup.Id
						);
						ARRAYS.shiftGroups.push(shiftGroup);
					} else {
						shiftGroup.Active = (shiftGroup.Id === PROPERTIES.currentSemester.ShiftGroup.Id);
						ARRAYS.shiftGroups.push(shiftGroup);
					}
				});
			};
			SET.arraySentMessages = function() {
				ARRAYS.sentMessages = [];
				_.each(DATA.messages, function(message) {
					if (PROPERTIES.currentUser.Area.Description === 'Campus' && (
							PROPERTIES.currentUser.Position.Description === 'FTE' ||
							PROPERTIES.currentUser.Position.Description === 'HR')) {
						if (message.From.Area.Description === 'Campus' && (
								message.From.Position.Description === 'FTE' ||
								message.From.Position.Description === 'HR'
							)) {
							ARRAYS.sentMessages.push(message);
						}
					} else {
						if (PROPERTIES.currentUser.Id === message.FromId) {
							ARRAYS.sentMessages.push(message);
						}
					}
				});
				ARRAYS.sentMessages.activePanel = -1;
			};

			/////////////
			// REFRESH //
			/////////////
			/**
			 * This function gets the first tier of data.
			 *
			 * @returns    {promise}    this promise will be resolved when
			 *    all the data is returned and we can move on to the second
			 *    tier.
			 */
			REFRESH.getData = function(dataCalls) {
				var deffered = $q.defer();

				$q.all(dataCalls)
					.then(function() {
						deffered.resolve();
					});
				return deffered.promise;
			};
			REFRESH.securityValidation = function() {
				$http.post(PROPERTIES.sharePointUrl + '_api/contextinfo')
					.success(function(data) {
						var siteContextinfo = data.d.GetContextWebInformation;
						PROPERTIES.validationTimeout = siteContextinfo.FormDigestTimeoutSeconds -
							10;
						PROPERTIES.validation = siteContextinfo.FormDigestValue;
						$timeout(function() {
							REFRESH.securityValidation();
							if (dataInitialized) {
								REFRESH.data();
							}
						}, PROPERTIES.validationTimeout * 1000);
					})
					.error(function(data) {
						service.errors.push(data);
					});
			};
			/**
			 * Refresh all of the DATA arrays
			 *
			 * @returns    {promise}    this promise will be resolved when all of the data is ready.
			 */
			REFRESH.data = function() {
				var deffered1 = $q.defer();
				REFRESH.getData([GET.shiftGroups(), GET.positions(), GET.areas(), GET.tracks(), /*GET.Teams(),*/ GET.professors()])
					.then(function() {
						cfpLoadingBar.set(cfpLoadingBar.status() + 0.1);
						REFRESH.getData([GET.shifts(), GET.employees(), GET.semesters(), GET.areaPositions(), GET.facultyTestingInfos()])
							.then(function() {
								cfpLoadingBar.set(cfpLoadingBar.status() + 0.1);
								REFRESH.getData([GET.schedules(), GET.subShifts(), GET.availabilities(), GET.employments(), GET.messages(), GET.noTestingDays()])
									.then(function() {
										cfpLoadingBar.set(cfpLoadingBar.status() + 0.1);
										REFRESH.getData([GET.sentMessages()])
											.then(function() {
												cfpLoadingBar.set(cfpLoadingBar.status() + 0.1);
												SET.arrayShifts();
												SET.arrayShiftGroups();
												SET.arraySentMessages();
												SET.arrayWeeks();
												SET.arrayNoAvailabilityEmployees();
												cfpLoadingBar.complete();
												deffered1.resolve();
											});
									});
							});
					});
				return deffered1.promise;
			};
			REFRESH.subShifts = function(hideAlert) {
				hideAlert = hideAlert || false;
				var deffered = $q.defer();
				REFRESH.getData([GET.shifts(), GET.employees()])
					.then(function() {
						REFRESH.getData([GET.schedules(), GET.subShifts()])
							.then(function() {
								SET.arrayWeeks();
								if (!hideAlert) {
									$alert(REFRESH.successAlert);
								}
								deffered.resolve();
							});
					});
				return deffered.promise;
			};
			REFRESH.availability = function(hideAlert) {
				hideAlert = hideAlert || false;
				var deffered = $q.defer();
				REFRESH.getData([GET.shifts(), GET.employees()])
					.then(function() {
						REFRESH.getData([GET.schedules(), GET.availabilities()])
							.then(function() {
								SET.arrayWeeks();
								SET.arrayNoAvailabilityEmployees();
								if (!hideAlert) {
									$alert(REFRESH.successAlert);
								}
								deffered.resolve();
							});
					});
				return deffered.promise;
			};
			REFRESH.schedule = function(hideAlert) {
				hideAlert = hideAlert || false;
				var deffered = $q.defer();
				REFRESH.getData([GET.shifts(), GET.employees()])
					.then(function() {
						GET.schedules()
							.then(function() {
								SET.arrayWeeks();
								if (!hideAlert) {
									$alert(REFRESH.successAlert);
								}
								deffered.resolve();
							});
					});
				return deffered.promise;
			};
			REFRESH.availableShifts = function(hideAlert) {
				hideAlert = hideAlert || false;
				var deffered = $q.defer();
				REFRESH.getData([GET.shifts(), GET.employees()])
					.then(function() {
						GET.schedules()
							.then(function() {
								SET.arrayShifts();
								if (!hideAlert) {
									$alert(REFRESH.successAlert);
								}
								deffered.resolve();
							});
					});
				return deffered.promise;
			};
			REFRESH.myAvailability = function(hideAlert) {
				hideAlert = hideAlert || false;
				var deffered = $q.defer();
				GET.availabilities()
					.then(function() {
						SET.arrayWeeks();
						if (!hideAlert) {
							$alert(REFRESH.successAlert);
						}
						deffered.resolve();
					});
				return deffered.promise;
			};
			REFRESH.mySchedule = function(hideAlert) {
				hideAlert = hideAlert || false;
				var deffered = $q.defer();
				GET.shifts()
					.then(function() {
						REFRESH.getData([GET.schedules(), GET.subShifts()])
							.then(function() {
								SET.arrayWeeks();
								if (!hideAlert) {
									$alert(REFRESH.successAlert);
								}
								deffered.resolve();
							});
					});
				return deffered.promise;
			};
			REFRESH.today = function(hideAlert) {
				hideAlert = hideAlert || false;
				var deffered = $q.defer();
				REFRESH.getData([GET.shifts(), GET.employees()])
					.then(function() {
						REFRESH.getData([GET.schedules(), GET.subShifts()])
							.then(function() {
								SET.propertyToday();
								if (!hideAlert) {
									$alert(REFRESH.successAlert);
								}
								deffered.resolve();
							});
					});
				return deffered.promise;
			};
			REFRESH.directory = function(hideAlert) {
				hideAlert = hideAlert || false;
				var deffered = $q.defer();
				GET.employees()
					.then(function() {
						GET.employments()
							.then(function() {
								if (!hideAlert) {
									$alert(REFRESH.successAlert);
								}
								deffered.resolve();
							});
					});
				return deffered.promise;
			};
			REFRESH.messages = function(hideAlert) {
				hideAlert = hideAlert || false;
				var deffered = $q.defer();
				GET.messages()
					.then(function() {
						GET.sentMessages()
							.then(function() {
								SET.arraySentMessages();
								if (!hideAlert) {
									$alert(REFRESH.successAlert);
								}
								deffered.resolve();
							});
					});
				return deffered.promise;
			};

			///////////////
			// UTILITIES //
			///////////////
			UTILITIES.fetchJson = function(url, cache) {
				cache = cache || false;
				return $http.get(url, {
					headers: {
						'accept': 'application/json;odata=verbose',
						'cache': cache
					}
				});
			};
			UTILITIES.fetchCurrentUser = function() {
				return UTILITIES.fetchJson(PROPERTIES.sharePointUrl +
					'_api/web/currentUser', true);
			};
			UTILITIES.addItem = function(listName, item) {
				$http.defaults.headers.post = {
					'Accept': 'application/json;odata=verbose',
					'Content-Type': 'application/json;odata=verbose',
					'X-RequestDigest': PROPERTIES.validation,
				};
				return $http.post(PROPERTIES.sharePointUrl +
					'_api/lists/getbytitle(\'' + listName + '\')/items', item);
			};
			UTILITIES.updateItem = function(listName, itemId, item, etag) {
				etag = etag || '*';
				return $http({
					method: 'POST',
					url: PROPERTIES.sharePointUrl + '_api/lists/getbytitle(\'' +
						listName + '\')/items(' + itemId + ')',
					data: item,
					headers: {
						'accept': 'application/json;odata=verbose',
						'content-type': 'application/json;odata=verbose',
						'X-RequestDigest': PROPERTIES.validation,
						'IF-MATCH': etag,
						'X-HTTP-Method': 'MERGE'
					}
				});
			};
			UTILITIES.deleteItem = function(listName, itemId) {
				return $http({
					method: 'POST',
					url: PROPERTIES.sharePointUrl + '_api/lists/getbytitle(\'' +
						listName + '\')/items(' + itemId + ')',
					headers: {
						'X-HTTP-Method': 'DELETE',
						'IF-MATCH': '*',
						'X-RequestDigest': PROPERTIES.validation
					}
				});
			};
			UTILITIES.fetchItem = function(listName, itemId) {
				return UTILITIES.fetchJson(PROPERTIES.sharePointUrl +
					'_api/lists/getbytitle(\'' + listName + '\')/items(\'' + itemId +
					'\')', false);
			};
			UTILITIES.fetchItems = function(listName) {
				// init properties
				this.query = '';
				this.flag = true;
				this.listName = listName;
				// init methods
				this.select = function(params) {
					var selectQuery = '$select=';
					for (var i = 0; i < params.length; i++) {
						selectQuery += params[i];
						selectQuery += (i === params.length - 1) ? '' : ',';
					}
					this.query += (this.flag) ? '?' + selectQuery : '&' + selectQuery;
					this.flag = false;
					return this;
				};
				this.expand = function(params) {
					var expandQuery = '$expand=';
					for (var i = 0; i < params.length; i++) {
						expandQuery += params[i];
						expandQuery += (i === params.length - 1) ? '' : ',';
					}
					this.query += (this.flag) ? '?' + expandQuery : '&' + expandQuery;
					this.flag = false;
					return this;
				};
				this.where = function(params) {
					var filterQuery = '$filter=',
						andQuery = '',
						orQuery = '',
						filterFlag = true,
						i = 0,
						tempQueryHolder = [],
						addOr = function(orRequest) {
							var query = '';
							if (generalService.getClass(orRequest) === 'String') {
								query += orRequest;
							} else {
								for (i = 0; i < orRequest.length; i++) {
									if (generalService.getClass(orRequest[i]) === 'String') {
										query += orRequest[i];
									} else {
										query += orRequest[i][0] + ' ' + orRequest[i][1] + ((generalService.getClass(
												orRequest[i][2]) === 'String') ? (((orRequest[i][1].split(' ')
												.length > 0) ? '\'' : ' \'') + params.or[i][2] + '\'') : ' ' +
											orRequest[i][2]);
									}
									query += (i === orRequest.length - 1) ? '' : ' or ';
								}
							}
							return query;
						},
						addAnd = function(andRequest) {
							var query = '';
							if (generalService.getClass(andRequest) === 'String') {
								query += andRequest;
							} else {
								for (i = 0; i < andRequest.length; i++) {
									if (generalService.getClass(andRequest[i]) === 'String') {
										query += andRequest[i];
									} else {
										query += andRequest[i][0] + ' ' + andRequest[i][1] + ((generalService.getClass(
												andRequest[i][2]) === 'String') ? (((andRequest[i][1].split(
													' ')
												.length > 0) ? '\'' : ' \'') + andRequest[i][2] + '\'') : ' ' +
											andRequest[i][2]);
									}
									query += (i === andRequest.length - 1) ? '' : ' and ';
								}
							}
							return query;
						};
					if (params.or === undefined && params.and === undefined) {
						filterQuery += params[0] + ' ' + params[1] + ((generalService.getClass(
							params[2]) === 'String') ? (((params[1].split(' ')
							.length > 0) ? '\'' : ' \'') + params[2] + '\'') : ' ' + params[
							2]);
						filterFlag = false;
					} else {
						if (params.or !== undefined) {
							if (generalService.getClass(params.or) !== 'Array') {
								if (params.or.and !== undefined) {
									tempQueryHolder.push('(' + addAnd(params.or.and) + ')');
								}
								if (params.or.or !== undefined) {
									tempQueryHolder.push('(' + addOr(params.or.or) + ')');
								}
								if (params.or.other !== undefined) {
									tempQueryHolder.push(params.or.other);
								}
								orQuery = addOr(tempQueryHolder);
							} else {
								orQuery = addOr(params.or);
							}
							filterQuery += (filterFlag) ? orQuery : ' or ' + orQuery;
							filterFlag = false;
						}
						if (params.and !== undefined) {
							if (generalService.getClass(params.and) !== 'Array') {
								if (params.and.or !== undefined) {
									tempQueryHolder.push('(' + addOr(params.and.or) + ')');
								}
								if (params.and.and !== undefined) {
									tempQueryHolder.push('(' + addAnd(params.and.and) + ')');
								}
								if (params.and.other !== undefined) {
									// if (generalService.getClass(params.and.other) === 'Array') {
									//  _.each(params.and.other, function(otherQuery) {
									//      tempQueryHolder.push(otherQuery);
									//  });
									// } else {
									tempQueryHolder.push(params.and.other);
									// }
								}
								andQuery = addAnd(tempQueryHolder);
							} else {
								andQuery = addAnd(params.and);
							}
							filterQuery += (filterFlag) ? andQuery : ' and ' + andQuery;
							filterFlag = false;
						}
					}
					if (filterFlag) {
						return this;
					} else {
						this.query += (this.flag) ? '?' + filterQuery : '&' + filterQuery;
						this.flag = false;
						return this;
					}
				};
				this.top = function(param) {
					param = param || 999999999;
					var topQuery = '$top=' + param;
					this.query += (this.flag) ? '?' + topQuery : '&' + topQuery;
					this.flag = false;
					return this;
				};
				this.execute = function(cache) {
					return UTILITIES.fetchJson(PROPERTIES.sharePointUrl +
						'_api/lists/getbytitle(\'' + this.listName + '\')/items' + this.query,
						cache);
				};
			};
			UTILITIES.fetchAllItems = function(listName) {
				return new UTILITIES.fetchItems(listName).top().execute();
			};
			UTILITIES.fetchUserByEmail = function(email) {
				return $http.get(PROPERTIES.sharePointUrl +
					'_api/web/siteusers/getbyemail(\'' + email + '\')', {
						headers: {
							'accept': 'application/json;odata=verbose'
						}
					});
			};

			/////////////
			// CLASSES //
			/////////////
			// ***********************************************************************
			// DEFINE THE DATA CLASS
			// ***********************************************************************
			CLASSES.Data = function() {
				this.newData = {};
				this.listName = '';
			};
			CLASSES.Data.method('initPublicAttributes', function() {
				this.Created = (this.newData.Created) ? Date.parse(this.newData.Created) : undefined;
				this.GUID = this.newData.GUID || undefined;
				this.Id = this.newData.Id || undefined;
				this.Modified = (this.newData.Modified) ? Date.parse(this.newData.Modified) : undefined;
				this.__metadata = this.newData.__metadata || {
					type: 'SP.Data.' + this.listName + 'ListItem',
				};
				this.defaultAlertContent = this.toString();
				this.addAlertContent = this.defaultAlertContent + ' has been added!';
				this.removeAlertContent = this.defaultAlertContent + ' has been removed!';
				this.updateAlertContent = this.defaultAlertContent + ' has been updated!';
			});
			CLASSES.Data.method('updateData', function() {
				return {
					__metadata: this.__metadata
				};
			});
			CLASSES.Data.method('add', function(hideAlert, newObject) {
				/** @privateAtribute {object} an alias for this */
				var object = this;
				hideAlert = hideAlert || false;
				newObject = newObject || false;
				var deffered = $q.defer();
				this.data = this.updateData();
				if (this.__metadata.etag === undefined) {
					UTILITIES.addItem(this.listName, this.data)
						.success(function(data) {
							if (!newObject) {
								object.newData = data.d;
								object.initPublicAttributes();
								DATA[object.listName.charAt(0).toLowerCase() + object.listName.slice(1) + 's'].push(object);
							}
							if (!hideAlert) {
								$alert({
									show: true,
									placement: 'top-right',
									content: object.addAlertContent,
									animation: 'am-fade-and-slide-top',
									duration: '3',
									type: 'success',
									template: 'partials/alerts/success-alert.html'
								});
							}
							deffered.resolve(object.Id);
						});
				}
				return deffered.promise;
			});
			CLASSES.Data.method('remove', function(hideAlert) {
				/** @privateAtribute {object} an alias for this */
				var object = this;
				hideAlert = hideAlert || false;
				var deffered = $q.defer();
				UTILITIES.deleteItem(this.listName, this.Id)
					.success(function() {
						DATA[object.listName.charAt(0).toLowerCase() + object.listName.slice(1) + 's'] = _.without(DATA[object.listName.charAt(0).toLowerCase() + object.listName.slice(1) + 's'], object);
						if (!hideAlert) {
							$alert({
								show: true,
								placement: 'top-right',
								content: object.removeAlertContent,
								animation: 'am-fade-and-slide-top',
								duration: '3',
								type: 'success',
								template: 'partials/alerts/success-alert.html'
							});
						}
						deffered.resolve();
					});
				return deffered.promise;
			});
			CLASSES.Data.method('update', function(hideAlert) {
				var deffered = $q.defer();
				/** @privateAtribute {object} an alias for this */
				var object = this;
				hideAlert = hideAlert || false;
				this.__metadata.etag = this.__metadata.etag || '*';
				this.data = this.updateData();
				UTILITIES.updateItem(this.listName, this.Id, this.data, this.__metadata.etag)
					.success(function() {
						object.refresh()
							.then(function() {
								if (!hideAlert) {
									$alert({
										show: true,
										placement: 'top-right',
										content: object.updateAlertContent,
										animation: 'am-fade-and-slide-top',
										duration: '3',
										type: 'success',
										template: 'partials/alerts/success-alert.html'
									});
								}
								deffered.resolve();
							});
					})
					.error(function(data) {
						console.error('There has been an error with your network request.', data);
						$alert({
							show: true,
							placement: 'top-right',
							content: 'You must refesh your data before you can change that item',
							animation: 'am-fade-and-slide-top',
							duration: '3',
							type: 'danger',
							template: 'partials/alerts/error-alert.html'
						});
					});
				return deffered.promise;
			});
			CLASSES.Data.method('refresh', function() {
				var deffered = $q.defer();
				/** @privateAtribute {object} an alias for this */
				var object = this;
				UTILITIES.fetchItem(this.listName, this.Id)
					.success(function(data) {
						object.newData = data.d;
						object.initPublicAttributes();
						deffered.resolve();
					});
				return deffered.promise;
			});
			// ***********************************************************************
			// DEFINE THE AREA CLASS
			// ***********************************************************************
			CLASSES.Area = function(data) {
				this.newData = data || {};
				this.initPublicAttributes();
				this.listName = 'Area';
			};
			CLASSES.Area.inherits(CLASSES.Data);
			CLASSES.Area.method('initPublicAttributes', function() {
				/** @privateAtribute {object} an alias for this */
				var object = this;
				this.Area = this.newData.Area || undefined;
				this.Description = this.newData.Description || undefined;
				this.DefaultPositionId = this.newData.DefaultPositionId || undefined;
				this.DefaultPosition = (this.newData.DefaultPositionId) ? _.find(DATA.positions, function(position) {
					return position.Id === object.DefaultPositionId;
				}) : {};
				this.Positions = this.newData.Positions || [];
				this.uber('initPublicAttributes');
				this.data = this.updateData();
			});
			CLASSES.Area.method('updateData', function() {
				var returnData = this.uber('updateData');
				returnData.Area = this.Area;
				returnData.Description = this.Description;
				returnData.DefaultPositionId = this.DefaultPositionId;
				return returnData;
			});
			CLASSES.Area.method('toString', function() {
				return this.Description + ' Area';
			});
			CLASSES.Area.method('setPositions', function() {
				var object = this;
				this.Positions = [];
				_.each(DATA.areaPositions, function(areaPosition) {
					if (areaPosition.Area.Id === object.Id) {
						object.Positions.push(areaPosition.Position);
					}
				});
			});
			// ***********************************************************************
			// DEFINE THE AREAPOSITION CLASS
			// ***********************************************************************
			CLASSES.AreaPosition = function(data) {
				this.newData = data || {};
				this.initPublicAttributes();
				this.listName = 'AreaPosition';
			};
			CLASSES.AreaPosition.inherits(CLASSES.Data);
			CLASSES.AreaPosition.method('initPublicAttributes', function() {
				/** @privateAtribute {object} an alias for this */
				var object = this;
				this.AreaId = this.newData.AreaId || undefined;
				this.Area = (this.newData.AreaId) ? _.find(DATA.areas, function(area) {
					return area.Id === object.AreaId;
				}) : {};
				this.PositionId = this.newData.PositionId || undefined;
				this.Position = (this.newData.PositionId) ? _.find(DATA.positions, function(position) {
					return position.Id === object.PositionId;
				}) : {};
				this.setAreasPosition();
				this.uber('initPublicAttributes');
				this.data = this.updateData();
			});
			CLASSES.AreaPosition.method('updateData', function() {
				var returnData = this.uber('updateData');
				returnData.AreaId = this.AreaId;
				returnData.PositionId = this.PositionId;
				return returnData;
			});
			CLASSES.AreaPosition.method('toString', function() {
				return this.Area.Description + ' ' + this.Position.Description;
			});
			CLASSES.AreaPosition.method('setAreasPosition', function() {
				this.Area.Positions.push(this.Position);
			});
			// ***********************************************************************
			// DEFINE THE AVAILABILITY CLASS
			// ***********************************************************************
			CLASSES.Availability = function(data) {
				this.newData = data || {};
				this.listName = 'Availability';
				this.initPublicAttributes();
				this.defaultAlertContent = (this.Id === PROPERTIES.currentUser.Id) ? 'Your information' : this.toString();
			};
			CLASSES.Availability.inherits(CLASSES.Data);
			CLASSES.Availability.method('initPublicAttributes', function() {
				/** @privateAtribute {object} an alias for this */
				var object = this;
				this.Active = this.newData.Active || this.newData.Current || false;
				this.Current = this.newData.Current || false;
				this.Day = this.newData.Day || undefined;
				this.EmployeeId = this.newData.EmployeeId || undefined;
				this.Employee = (this.newData.EmployeeId) ? _.find(DATA.employees, function(employee) {
					return employee.Id === object.EmployeeId;
				}) : {};
				this.EndTime = (this.newData.EndTime) ? Date.parse(this.newData.EndTime) : undefined;
				this.SemesterId = this.newData.SemesterId || undefined;
				this.Semester = (this.newData.SemesterId) ? _.find(DATA.semesters, function(semseter) {
					return semseter.Id === object.SemesterId;
				}) : {};
				this.StartTime = (this.newData.StartTime) ? Date.parse(this.newData.StartTime) : undefined;
				this.uber('initPublicAttributes');
				this.data = this.updateData();
			});
			CLASSES.Availability.method('updateData', function() {
				var returnData = this.uber('updateData');
				returnData.Active = this.Current;
				returnData.Current = this.Current;
				returnData.Day = this.Day;
				returnData.EmployeeId = this.EmployeeId;
				returnData.EndTime = this.EndTime;
				returnData.SemesterId = this.SemesterId;
				returnData.StartTime = this.StartTime;
				return returnData;
			});
			CLASSES.Availability.method('add', function() {
				var deffered = $q.defer();
				this.Active = true;
				this.Current = true;
				this.uber('add')
					.then(function() {
						deffered.resolve();
					});
				return deffered.promise;
			});
			CLASSES.Availability.method('toString', function() {
				return this.Employee.toString() + '\'s availability';
			});
			CLASSES.Availability.method('deactivate', function() {
				var deffered = $q.defer();
				this.Active = false;
				this.Current = false;
				this.update()
					.then(function() {
						deffered.resolve();
					});
				return deffered.promise;
			});
			// ***********************************************************************
			// DEFINE THE EMPLOYEE CLASS
			// ***********************************************************************
			CLASSES.Employee = function(data) {
				this.newData = data || {};
				this.listName = 'Employee';
				this.initPublicAttributes();
				this.defaultAlertContent = (this.Id === PROPERTIES.currentUser.Id) ? 'Your information' : this.toString();
			};
			CLASSES.Employee.inherits(CLASSES.Data);
			CLASSES.Employee.method('initPublicAttributes', function() {
				/** @privateAtribute {object} an alias for this */
				var object = this;
				this.Active = this.newData.Active || false;
				this.Admin = this.newData.Admin || false;
				this.AreaId = this.newData.AreaId || undefined;
				this.Area = (this.newData.AreaId) ? _.find(DATA.areas, function(area) {
					return area.Id === object.AreaId;
				}) : {};
				this.EmailAddress = this.newData.EmailAddress || undefined;
				this.FirstName = this.newData.FirstName || undefined;
				this.INumber = this.newData.INumber || undefined;
				this.LastName = this.newData.LastName || undefined;
				this.PhoneNumber = this.newData.PhoneNumber || undefined;
				this.Picture = this.newData.Picture || undefined;
				this.PositionId = this.newData.PositionId || undefined;
				this.Position = (this.newData.PositionId) ? _.find(DATA.positions, function(position) {
					return position.Id === object.PositionId;
				}) : {};
				this.PreferredName = this.newData.PreferredName || undefined;
				this.Reader = this.newData.Reader || false;
				this.Retired = this.newData.Retired || false;
				this.TeamId = this.newData.TeamId || undefined;
				this.Team = (this.newData.TeamId) ? _.find(DATA.teams, function(team) {
					return team.Id === object.TeamId;
				}) : {};
				this.TrackId = this.newData.TrackId || undefined;
				this.Track = (this.newData.TrackId) ? _.find(DATA.tracks, function(track) {
					return track.Id === object.TrackId;
				}) : {};
				this.ExtendedPrivledges = (
					this.Position.Position === 'FTE' ||
					this.Position.Position === 'HR' ||
					this.Admin
				);
				this.Employments = [];
				this.Intent = {};
				this.Label = (
					'<div><img class="img-circle" src="' + this.Picture +
					'" fallback-src="/media/missing.png" width="50px" height="' + ((this.Position.Description === 'FTE') ? 70.8333 : 50) + 'px"> <b>' +
					this.PreferredName + ' ' + this.LastName + '</b></div>'
				);
				this.uber('initPublicAttributes');
				this.data = this.updateData();
			});
			CLASSES.Employee.method('updateData', function() {
				var returnData = this.uber('updateData');
				returnData.Active = this.Active;
				returnData.Admin = this.Admin;
				returnData.AreaId = this.AreaId;
				returnData.EmailAddress = this.EmailAddress;
				returnData.FirstName = this.FirstName;
				returnData.INumber = this.INumber;
				returnData.LastName = this.LastName;
				returnData.Picture = this.Picture;
				returnData.PhoneNumber = this.PhoneNumber;
				returnData.PreferredName = this.PreferredName;
				returnData.PositionId = this.PositionId;
				returnData.Reader = this.Reader;
				returnData.Retired = this.Retired;
				// returnData.TeamId = this.TeamId;
				returnData.TrackId = this.TrackId;
				return returnData;
			});
			CLASSES.Employee.method('toString', function(param) {
				if (param) {
					if (param === 'name') {
						return this.PreferredName + ' ' + this.LastName;
					}
				} else {
					return this.Position.Description + ': ' + this.PreferredName + ' ' + this.LastName;
				}
			});
			CLASSES.Employee.method('activate', function() {
				var employment = new CLASSES.Employment({
					AreaId: this.AreaId,
					EmployeeId: this.Id,
					PositionId: this.PositionId
				});
				employment.start(true);
				this.Active = true;
				this.update();
			});
			CLASSES.Employee.method('deactivate', function() {
				/** @privateAtribute {object} an alias for this */
				var object = this;
				_.each(DATA.employments, function(employment) {
					if (employment.EndDate === undefined &&
						employment.EmployeeId === object.Id) {
						employment.end(true);
					}
				});
				this.Active = false;
				this.update();
			});
			CLASSES.Employee.method('retire', function() {
				var deffered = $q.defer();
				/** @privateAtribute {object} an alias for this */
				var object = this;
				_.each(DATA.employments, function(employment) {
					if (employment.EndDate === undefined &&
						employment.EmployeeId === object.Id) {
						employment.end(true);
					}
				});
				this.Active = false;
				this.Retired = true;
				this.update().then(function() {
					deffered.resolve();
				});
				return deffered.promise;
			});
			CLASSES.Employee.method('add', function() {
				var object = this;
				this.uber('add').then(function() {
					object.activate();
				});
			});
			CLASSES.Employee.method('setEmployements', function() {
				var object = this;
				this.Employments = _.filter(DATA.employments, function(employment) {
					return employment.EmployeeId === object.Id;
				});
			});
			CLASSES.Employee.method('setIntent', function() {
				this.Intent = _.find(DATA.intents, function(intent) {
					return intent.EmployeeId === employee.Id;
				});
			});
			CLASSES.Employee.method('declareIntent', function() {});
			// ***********************************************************************
			// DEFINE THE EMPLOYMENT CLASS
			// ***********************************************************************
			CLASSES.Employment = function(data) {
				this.newData = data || {};
				this.listName = 'Employment';
				this.initPublicAttributes();
				this.defaultAlertContent = (this.Id === PROPERTIES.currentUser.Id) ? 'Your employment' : this.toString();
			};
			CLASSES.Employment.inherits(CLASSES.Data);
			CLASSES.Employment.method('initPublicAttributes', function() {
				/** @privateAtribute {object} an alias for this */
				var object = this;
				this.AreaId = this.newData.AreaId || undefined;
				this.Area = (this.newData.AreaId) ? _.find(DATA.areas, function(area){
					return area.Id === object.AreaId;
				}) : {};
				this.EmployeeId = this.newData.EmployeeId || undefined;
				this.Employee = (this.newData.EmployeeId) ? _.find(DATA.employees, function(employee) {
					return employee.Id === object.EmployeeId;
				}) : {};
				this.EndDate = (this.newData.EndDate) ? Date.parse(this.newData.EndDate) : undefined;
				this.PositionId = this.newData.PositionId || undefined;
				this.Position = (this.newData.PositionId) ? _.find(DATA.positions, function(position){
					return position.Id === object.PositionId;
				}) : {};
				this.StartDate = (this.newData.StartDate) ? Date.parse(this.newData.StartDate) : undefined;
				this.Edit = false;
				this.uber('initPublicAttributes');
				this.data = this.updateData();
			});
			CLASSES.Employment.method('updateData', function() {
				var returnData = this.uber('updateData');
				returnData.AreaId = this.AreaId;
				returnData.EmployeeId = this.EmployeeId;
				returnData.EndDate = this.EndDate;
				returnData.StartDate = this.StartDate;
				returnData.PositionId = this.PositionId;
				return returnData;
			});
			CLASSES.Employment.method('toString', function() {
				return this.Employee.toString() + '\'s employment';
			});
			CLASSES.Employment.method('start', function(hideAlert) {
				hideAlert = hideAlert || false;
				this.StartDate = new Date();
				this.add(hideAlert);
			});
			CLASSES.Employment.method('end', function(hideAlert) {
				hideAlert = hideAlert || false;
				this.EndDate = new Date();
				this.update(hideAlert);
			});
			// ***********************************************************************
			// DEFINE THE FACULTYTESTINGINFO CLASS
			// ***********************************************************************
			CLASSES.FacultyTestingInfo = function(data) {
				this.newData = data || {};
				this.listName = 'FacultyTestingInfo';
				this.initPublicAttributes();
			};
			CLASSES.FacultyTestingInfo.inherits(CLASSES.Data);
			CLASSES.FacultyTestingInfo.method('initPublicAttributes', function() {
				/** @privateAtribute {object} an alias for this */
				var object = this;
				this.ProfessorId = this.newData.ProfessorId || undefined;
				this.Professor = (this.newData.ProfessorId) ? _.find(DATA.professors, function(professor) {
					return professor.Id === object.ProfessorId;
				}) || _.find(DATA.employees, function(employee) {
					return employee.Id === object.ProfessorId;
				}) : {};
				this.Stipulation = this.newData.Stipulation || 'No stipulation.';
				this.Other = this.newData.Other || undefined;
				this.uber('initPublicAttributes');
				this.data = this.updateData();
			});
			CLASSES.FacultyTestingInfo.method('updateData', function() {
				var returnData = this.uber('updateData');
				returnData.ProfessorId = this.ProfessorId;
				returnData.Stipulation = this.Stipulation;
				returnData.Other = this.Other;
				return returnData;
			});
			CLASSES.FacultyTestingInfo.method('toString', function() {
				if (this.Professor.Id) {
					return this.Professor.toString() + '\'s testing information';
				} else {
					return 'New FacultyTestingInfo';
				}
			});
			// ***********************************************************************
			// DEFINE THE MESSAGE CLASS
			// ***********************************************************************
			CLASSES.Message = function(data) {
				this.newData = data || {};
				this.listName = 'Message';
				this.initPublicAttributes();
				this.defaultAlertContent = (this.Id === PROPERTIES.currentUser.Id) ? 'Your employment' : this.toString();
			};
			CLASSES.Message.inherits(CLASSES.Data);
			CLASSES.Message.method('initPublicAttributes', function() {
				/** @privateAtribute {object} an alias for this */
				var object = this;
				this.Active = this.newData.Active || false;
				this.AreaId = this.newData.AreaId || undefined;
				this.Area = (this.newData.AreaId) ? _.find(DATA.areas, function(area) {
					return area.Id === object.AreaId;
				}) : {};
				this.Body = (this.newData.Body) ? this.newData.Body.replace(/<[a-z]*(.*\W)?>/g, '').replace(/<\/[a-z]*(.*\W)?>/g, '') : undefined;
				this.FormattedBody = (this.newData.Body) ? Autolinker.link(this.newData.Body, {
					truncate: 10
				}).replace(/\n\r?/g, '<br />') : undefined;
				this.DueDate = (this.newData.DueDate) ? Date.parse(this.newData.DueDate) : undefined;
				this.ExpDate = (this.newData.ExpDate) ? Date.parse(this.newData.ExpDate) : undefined;
				this.FromId = this.newData.FromId || false;
				this.From = (this.newData.FromId) ? _.find(DATA.employees, function(employee) {
					return employee.Id === object.FromId;
				}) : {};
				this.Mandatory = this.newData.Mandatory || false;
				this.Policy = this.newData.Policy || false;
				this.SemesterId = this.newData.SemesterId || undefined;
				this.Semester = (this.newData.SemesterId) ? _.find(DATA.semesters, function(semester) {
					return semester.Id === object.SemesterId;
				}) : {};
				this.Subject = this.newData.Subject || undefined;
				this.UniversalPolicy = (this.AreaId) ? this.Area.Description === 'Directory' : false;
				this.tempBody = this.Body;
				this.Recipients = this.newData.Recipients || [];
				this.Edit = false;
				this.uber('initPublicAttributes');
				this.data = this.updateData();
			});
			CLASSES.Message.method('updateData', function() {
				var returnData = this.uber('updateData');
				returnData.Active = this.Active;
				returnData.AreaId = this.AreaId;
				returnData.Body = this.Body;
				returnData.DueDate = this.DueDate;
				returnData.ExpDate = this.ExpDate;
				returnData.FromId = this.FromId;
				returnData.Mandatory = this.Mandatory;
				returnData.Policy = this.Policy;
				returnData.SemesterId = this.SemesterId;
				returnData.Subject = this.Subject;
				return returnData;
			});
			CLASSES.Message.method('toString', function() {
				return 'Subject: ' + this.Subject + '\n From: ' + this.From.toString('name');
			});
			CLASSES.Message.method('add', function() {
				var deffered = $q.defer();
				this.Active = true;
				this.uber('add')
					.then(function() {
						deffered.resolve();
					});
				return deffered.promise;
			});
			CLASSES.Message.method('send', function() {
				var deffered = $q.defer();
				/** @privateAtribute {object} an alias for this */
				var object = this;
				var recipients = this.Recipients;
				var recipientCounter = 0;
				this.SemesterId = PROPERTIES.currentSemester.Id;
				this.add()
					.then(function() {
						sendMessage(recipients[recipientCounter]);
					});
				return deffered.promise;
				/**
				 * This function sends a message to each employee on the Recipients list.
				 *
				 * @param      {Object}    recipient    The Employee object the message is being sent to
				 * @returns    {null}
				 */
				function sendMessage(recipient) {
					var sentMessage = new CLASSES.SentMessage({
						EmployeeId: recipient.Id,
						MessageId: object.Id
					});
					sentMessage.add(true)
						.then(function() {
							if (++recipientCounter < recipients.length) {
								sendMessage(recipients[recipientCounter]);
							} else {
								$alert({
									show: true,
									placement: 'top-right',
									content: 'Your message has been sent!',
									animation: 'am-fade-and-slide-top',
									duration: '3',
									type: 'success',
									template: 'partials/alerts/success-alert.html'
								});
								deffered.resolve();
							}
						});
				}
			});
			CLASSES.Message.method('getRecipients', function() {
				var sentMessages = _.filter(service.data.sentMessages, function(sentMessage) {
					return sentMessage.MessageId === this.Id;
				});
				_.each(sentMessages, function(sentMessage) {
					this.Recipients.push(sentMessage.Employee);
				});
			});
			CLASSES.Message.method('deactivate', function() {
				var deffered = $q.defer();
				this.Active = false;
				this.update()
					.then(function() {
						deffered.resolve();
					});
				return deffered.promise;
			});
			// ***********************************************************************
			// DEFINE THE NOTESTINGDAY CLASS
			// ***********************************************************************
			CLASSES.NoTestingDay = function(data) {
				this.newData = data || {};
				this.listName = 'NoTestingDay';
				this.initPublicAttributes();
			};
			CLASSES.NoTestingDay.inherits(CLASSES.Data);
			CLASSES.NoTestingDay.method('initPublicAttributes', function() {
				/** @privateAtribute {object} an alias for this */
				var object = this;
				this.Title = this.newData.Title || undefined;
				this.Date = (this.newData.Date) ? Date.parse(this.newData.Date) : undefined;
				this.Description = this.newData.Description || undefined;
				this.SemesterId = this.newData.SemesterId || undefined;
				this.Semester = (this.newData.SemesterId) ? _.find(DATA.semesters, function(semester) {
					return semester.Id === object.SemesterId;
				}) : {};
				this.uber('initPublicAttributes');
				this.data = this.updateData();
			});
			CLASSES.NoTestingDay.method('updateData', function() {
				var returnData = this.uber('updateData');
				returnData.Title = this.Title;
				returnData.Date = this.Date;
				returnData.Description = this.Description;
				returnData.SemesterId = this.SemesterId;
				return returnData;
			});
			CLASSES.NoTestingDay.method('toString', function() {
				return this.Title;
			});
			// ***********************************************************************
			// DEFINE THE POSITION CLASS
			// ***********************************************************************
			CLASSES.Position = function(data) {
				this.newData = data || {};
				this.listName = 'Position';
				this.initPublicAttributes();
			};
			CLASSES.Position.inherits(CLASSES.Data);
			CLASSES.Position.method('initPublicAttributes', function() {
				this.Position = this.newData.Position || undefined;
				this.Description = this.newData.Description || undefined;
				this.Active = true;
				this.Access = true;
				this.setAccess();
				this.setActive();
				this.uber('initPublicAttributes');
				this.data = this.updateData();
			});
			CLASSES.Position.method('updateData', function() {
				var returnData = this.uber('updateData');
				returnData.Position = this.Position;
				returnData.Description = this.Description;
				return returnData;
			});
			CLASSES.Position.method('toString', function() {
				return this.Description + ' position';
			});
			CLASSES.Position.method('setAccess', function() {
				if (PROPERTIES.currentUser.Position !== undefined &&
					PROPERTIES.currentUser.Area.DefaultPosition !== undefined) {
					this.Access = (
						this.Id === PROPERTIES.currentUser.Area.DefaultPosition.Id ||
						this.Description === PROPERTIES.currentUser.Position.Description ||
						this.Description === 'Proctor' ||
						PROPERTIES.currentUser.Position.Description === 'FTE' ||
						PROPERTIES.currentUser.Admin
					);
				}
			});
			CLASSES.Position.method('setActive', function() {
				if (PROPERTIES.currentUser.Position !== undefined &&
					PROPERTIES.currentUser.Area.DefaultPosition !== undefined) {
					this.Active = (
						((this.Id === PROPERTIES.currentUser.Area.DefaultPosition.Id &&
								PROPERTIES.currentUser.Position.Description === 'FTE') ^
							this.Description === PROPERTIES.currentUser.Position.Description) === 1
					);
				}
			});
			// ***********************************************************************
			// DEFINE THE PROFESSOR CLASS
			// ***********************************************************************
			CLASSES.Professor = function(data) {
				this.newData = data || {};
				this.listName = 'Professor';
				this.initPublicAttributes();
				this.defaultAlertContent = (this.Id === PROPERTIES.currentUser.Id) ? 'Your information' : this.toString();
			};
			CLASSES.Professor.inherits(CLASSES.Data);
			CLASSES.Professor.method('initPublicAttributes', function() {
				this.EmailAddress = this.newData.EmailAddress || undefined;
				this.FirstName = this.newData.FirstName || undefined;
				this.LastName = this.newData.LastName || undefined;
				this.OfficeAddress = this.newData.OfficeAddress || undefined;
				this.OfficePhone = this.newData.OfficePhone || undefined;
				this.OtherPhone = this.newData.OtherPhone || undefined;
				this.Picture = this.newData.Picture || undefined;
				this.uber('initPublicAttributes');
				this.data = this.updateData();
			});
			CLASSES.Professor.method('updateData', function() {
				var returnData = this.uber('updateData');
				returnData.EmailAddress = this.EmailAddress;
				returnData.FirstName = this.FirstName;
				returnData.LastName = this.LastName;
				returnData.OfficeAddress = this.OfficeAddress;
				returnData.OfficePhone = this.OfficePhone;
				returnData.OtherPhone = this.OtherPhone;
				returnData.Picture = this.Picture;
				return returnData;
			});
			CLASSES.Professor.method('toString', function() {
				return this.listName + ': ' + this.FirstName + ' ' + this.LastName;
			});
			// ***********************************************************************
			// DEFINE THE SCHEDULE CLASS
			// ***********************************************************************
			CLASSES.Schedule = function(data) {
				this.newData = data || {};
				this.listName = 'Schedule';
				this.initPublicAttributes();
				this.defaultAlertContent = (this.Id === PROPERTIES.currentUser.Id) ? 'Your schedule' : this.toString();
			};
			CLASSES.Schedule.inherits(CLASSES.Data);
			CLASSES.Schedule.method('add', function() {
				var deffered = $q.defer();
				this.Active = true;
				this.uber('add')
					.then(function() {
						deffered.resolve();
					});
				return deffered.promise;
			});
			CLASSES.Schedule.method('initPublicAttributes', function() {
				/** @privateAtribute {object} an alias for this */
				var object = this;
				this.Active = this.newData.Active || false;
				this.EmployeeId = this.newData.EmployeeId || undefined;
				this.Employee = _.find(DATA.employees, function(employee) {
					return employee.Id === object.EmployeeId;
				}) || {};
				this.ShiftId = this.newData.ShiftId || undefined;
				this.Shift = _.find(DATA.shifts, function(shift) {
					return shift.Id === object.ShiftId;
				}) || {};
				this.SemesterId = this.newData.SemesterId || undefined;
				this.Semester = (this.newData.SemesterId) ? _.find(DATA.semesters, function(semester) {
					return semester.Id === object.SemesterId;
				}) : {};
				this.uber('initPublicAttributes');
				this.data = this.updateData();
			});
			CLASSES.Schedule.method('updateData', function() {
				var returnData = this.uber('updateData');
				returnData.Active = this.Active;
				returnData.EmployeeId = this.EmployeeId;
				returnData.ShiftId = this.ShiftId;
				returnData.SemesterId = this.SemesterId;
				return returnData;
			});
			CLASSES.Schedule.method('toString', function() {
				return this.Employee.toString() + '\'s schedule';
			});
			CLASSES.Schedule.method('deactivate', function() {
				var deffered = $q.defer();
				this.Active = false;
				this.update()
					.then(function() {
						deffered.resolve();
					});
				return deffered.promise;
			});
			// ***********************************************************************
			// DEFINE THE SENTMESSAGE CLASS
			// ***********************************************************************
			CLASSES.SentMessage = function(data) {
				this.newData = data || {};
				this.listName = 'SentMessage';
				this.initPublicAttributes();
			};
			CLASSES.SentMessage.inherits(CLASSES.Data);
			CLASSES.SentMessage.method('initPublicAttributes', function() {
				/** @privateAtribute {object} an alias for this */
				var object = this;
				this.AckDate = (this.newData.AckDate) ? Date.parse(this.newData.AckDate) : undefined;
				this.EmployeeId = this.newData.EmployeeId || undefined;
				this.Employee = (this.newData.EmployeeId) ? _.find(DATA.employees, function(employee) {
					return employee.Id === object.EmployeeId;
				}) : {};
				this.MessageId = this.newData.MessageId || undefined;
				this.Message = (this.newData.MessageId) ? _.find(DATA.messages, function(message) {
					return message.Id === object.MessageId;
				}) : {};
				this.Policy = this.Message.Policy || false;
				this.Read = this.newData.Read || false;
				this.Disabled = (this.newData.MessageId) ? (this.Message.DueDate.compareTo(Date.today()) < 1) : false;
				this.uber('initPublicAttributes');
				this.data = this.updateData();
			});
			CLASSES.SentMessage.method('updateData', function() {
				var returnData = this.uber('updateData');
				returnData.AckDate = this.AckDate;
				returnData.EmployeeId = this.EmployeeId;
				returnData.MessageId = this.MessageId;
				returnData.Read = this.Read;
				return returnData;
			});
			CLASSES.SentMessage.method('toString', function() {
				return 'Message from ' + this.Message.From.toString().split(': ')[1] + ' to ' + this.Employee.toString().split(': ')[1] +
					'\nSubject: ' + this.Message.Subject;
			});
			CLASSES.SentMessage.method('read', function() {
				var deffered = $q.defer();
				this.Read = true;
				this.AckDate = new Date();
				this.update()
					.then(function() {
						deffered.resolve();
					});
				return deffered.promise;
			});
			// ***********************************************************************
			// DEFINE THE SEMESTER CLASS
			// ***********************************************************************
			CLASSES.Semester = function(data) {
				this.newData = data || {};
				this.listName = 'Semester';
				this.initPublicAttributes();
			};
			CLASSES.Semester.inherits(CLASSES.Data);
			CLASSES.Semester.method('initPublicAttributes', function() {
				/** @privateAtribute {object} an alias for this */
				var object = this;
				this.Active = this.newData.Active || false;
				this.FirstDay = (this.newData.FirstDay) ? Date.parse(this.newData.FirstDay) : undefined;
				this.LastDay = (this.newData.LastDay) ? Date.parse(this.newData.LastDay) : undefined;
				this.NextSemesterId = this.newData.NextSemesterId || undefined;
				this.NextSemester = (this.newData.NextSemesterId) ? _.find(DATA.semesters, function(semseter) {
					return semseter.Id === object.NextSemesterId;
				}) : {};
				this.ShiftGroupId = this.newData.ShiftGroupId || undefined;
				this.ShiftGroup = (this.newData.ShiftGroupId) ? _.find(DATA.shiftGroups, function(shiftGroup) {
					return shiftGroup.Id === object.ShiftGroupId;
				}) : {};
				this.Year = this.newData.Year || undefined;
				this.Description = this.newData.Description || undefined;
				this.uber('initPublicAttributes');
				this.data = this.updateData();
			});
			CLASSES.Semester.method('updateData', function() {
				var returnData = this.uber('updateData');
				returnData.Active = this.Active;
				returnData.FirstDay = this.FirstDay;
				returnData.LastDay = this.LastDay;
				returnData.NextSemesterId = this.NextSemesterId;
				returnData.ShiftGroupId = this.ShiftGroupId;
				returnData.Year = this.Year;
				return returnData;
			});
			CLASSES.Semester.method('toString', function() {
				return this.ShiftGroup.Description + ' ' + this.Year + ' Semester';
			});
			CLASSES.Semester.method('deactivate', function() {
				this.Active = false;
				this.update();
			});
			// ***********************************************************************
			// DEFINE THE SHIFT CLASS
			// ***********************************************************************
			CLASSES.Shift = function(data) {
				this.newData = data || {};
				this.listName = 'Shift';
				this.initPublicAttributes();
			};
			CLASSES.Shift.inherits(CLASSES.Data);
			CLASSES.Shift.method('add', function() {
				var deffered = $q.defer();
				this.Active = true;
				this.Current = true;
				this.uber('add')
					.then(function() {
						deffered.resolve();
					});
				return deffered.promise;
			});
			CLASSES.Shift.method('initPublicAttributes', function() {
				/** @privateAtribute {object} an alias for this */
				var object = this;
				this.Day = this.newData.Day || undefined;
				this.Days = (this.newData.Day) ? this.newData.Day.replace(/\s/g, '').split('-') : [];
				this.Slots = this.newData.Slots || undefined;
				this.AvailableSlots = this.Slots;
				this.Active = (this.newData.Current !== this.newData.Active) ? this.newData.Current : this.newData.Active || false;
				this.Current = this.newData.Current || false;
				this.ShiftGroupId = this.newData.ShiftGroupId || undefined;
				this.ShiftGroup = (this.newData.ShiftGroupId) ? _.find(DATA.shiftGroups, function(shiftGroup) {
					return shiftGroup.Id === object.ShiftGroupId;
				}) : {};
				this.PositionId = this.newData.PositionId || undefined;
				this.Position = (this.newData.PositionId) ? _.find(DATA.positions, function(position) {
					return position.Id === object.PositionId;
				}) : {};
				this.StartTime = (this.newData.StartTime) ? Date.parse(this.newData.StartTime) : undefined;
				this.EndTime = (this.newData.EndTime) ? Date.parse(this.newData.EndTime) : undefined;
				this.uber('initPublicAttributes');
				this.data = this.updateData();
			});
			CLASSES.Shift.method('updateData', function() {
				var returnData = this.uber('updateData');
				returnData.Day = this.Day;
				returnData.Slots = this.Slots;
				returnData.Active = this.Active;
				returnData.Current = this.Current;
				returnData.ShiftGroupId = this.ShiftGroupId;
				returnData.PositionId = this.PositionId;
				returnData.StartTime = this.StartTime;
				returnData.EndTime = this.EndTime;
				return returnData;
			});
			CLASSES.Shift.method('toString', function() {
				if (this.Id === undefined) {
					return 'New shift';
				} else {
					return this.Position.Description + ': ' + this.Day.replace(/\s/g, '').replace(/[-]/g, ', ') + '\n' + this.StartTime.toString('h:mm') + ' - ' + this.EndTime.toString('h:mm');
				}
			});
			CLASSES.Shift.method('setAvailableSlots', function() {
				var shift = this;
				this.AvailableSlots = this.Slots - _.filter(DATA.schedules, function(schedule) {
					return (
						schedule.ShiftId === shift.Id &&
						schedule.Active
					);
				}).length;
			});
			CLASSES.Shift.method('update', function() {
				/** @privateAtribute {object} an alias for this */
				var object = this;
				this.uber('update')
					.then(function() {
						object.setAvailableSlots();
					});
			});
			CLASSES.Shift.method('deactivate', function() {
				/** @privateAtribute {object} an alias for this */
				var shift = this;
				_.each(DATA.schedules, function(schedule) {
					if (schedule.ShiftId === shift.Id &&
						schedule.Active) {
						schedule.deactivate();
					}
				});
				this.Active = false;
				this.Current = false;
				this.update();
			});
			// ***********************************************************************
			// DEFINE THE SHIFTGROUP CLASS
			// ***********************************************************************
			CLASSES.ShiftGroup = function(data) {
				this.newData = data || {};
				this.listName = 'ShiftGroup';
				this.initPublicAttributes();
			};
			CLASSES.ShiftGroup.inherits(CLASSES.Data);
			CLASSES.ShiftGroup.method('initPublicAttributes', function() {
				this.Description = this.newData.Description || undefined;
				this.uber('initPublicAttributes');
				this.data = this.updateData();
			});
			CLASSES.ShiftGroup.method('updateData', function() {
				var returnData = this.uber('updateData');
				returnData.Description = this.Description;
				return returnData;
			});
			CLASSES.ShiftGroup.method('toString', function() {
				return 'The ' + this.Description + ' semester type';
			});
			// ***********************************************************************
			// DEFINE THE SUBSHIFT CLASS
			// ***********************************************************************
			CLASSES.SubShift = function(data) {
				this.newData = data || {};
				this.listName = 'SubShift';
				this.initPublicAttributes();
			};
			CLASSES.SubShift.inherits(CLASSES.Data);
			CLASSES.SubShift.method('add', function() {
				var deffered = $q.defer();
				this.Active = true;
				this.uber('add')
					.then(function() {
						deffered.resolve();
					});
				return deffered.promise;
			});
			CLASSES.SubShift.method('initPublicAttributes', function() {
				/** @privateAtribute {object} an alias for this */
				var object = this;
				this.Active = (this.newData.Active !== undefined) ? this.newData.Active : true;
				this.Date = (this.newData.Date) ? Date.parse(this.newData.Date) : undefined;
				this.NewRequestId = this.newData.NewRequestId || undefined;
				this.NewRequest = (this.newData.NewRequestId) ? _.find(DATA.subShifts, function(newRequest) {
					return newRequest.Id === object.NewRequestId;
				}) : {};
				this.RequesterId = this.newData.RequesterId || undefined;
				this.Requester = (this.newData.RequesterId) ? _.find(DATA.employees, function(employee) {
					return employee.Id === object.RequesterId;
				}) : {};
				this.SemesterId = this.newData.SemesterId || undefined;
				this.Semester = (this.newData.SemesterId) ? _.find(DATA.semesters, function(semester) {
					return semester.Id === object.SemesterId;
				}) : {};
				this.ShiftId = this.newData.ShiftId || undefined;
				this.Shift = (this.newData.ShiftId) ? _.find(DATA.shifts, function(shift) {
					return shift.Id === object.ShiftId;
				}) : {};
				this.SubstituteId = this.newData.SubstituteId || undefined;
				this.Substitute = (this.newData.SubstituteId) ? _.find(DATA.employees, function(employee) {
					return employee.Id === object.SubstituteId;
				}) : {};
				this.uber('initPublicAttributes');
				this.data = this.updateData();
			});
			CLASSES.SubShift.method('updateData', function() {
				var returnData = this.uber('updateData');
				returnData.Active = this.Active;
				returnData.Date = this.Date;
				returnData.NewRequestId = this.NewRequestId;
				returnData.RequesterId = this.RequesterId;
				returnData.SemesterId = this.SemesterId;
				returnData.ShiftId = this.ShiftId;
				returnData.SubstituteId = this.SubstituteId;
				return returnData;
			});
			CLASSES.SubShift.method('toString', function() {
				if (this.SubstituteId) {
					return this.Substitute.toString().split(': ')[1] + ' subbing for ' + this.Requester.toString().split(': ')[1] + '\n' + this.Date.toString('dddd MMM dS') + ' from ' + this.Shift.toString().split('\n')[1];
				} else if (this.RequesterId) {
					return this.Requester.toString().split(': ')[1] + ' Sub Request\n' + this.Date.toString('dddd') + ' ' + this.Shift.toString().split('\n')[1];
				} else {
					return 'New SubShift';
				}
			});
			CLASSES.SubShift.method('deactivate', function() {
				var deffered = $q.defer();
				this.Active = false;
				this.update()
					.then(function() {
						deffered.resolve();
					});
				return deffered.promise;
			});
			CLASSES.SubShift.method('newRequest', function() {
				var deffered = $q.defer();
				/** @privateAtribute {object} an alias for this */
				var object = this;
				var newRequest = new CLASSES.SubShift();
				newRequest.Date = this.Date;
				newRequest.RequesterId = PROPERTIES.currentUser.Id;
				newRequest.ShiftId = this.ShiftId;
				newRequest.SemesterId = this.SemesterId;
				newRequest.add()
					.then(function() {
						object.NewRequestId = newRequest.Id;
						object.update(true)
							.then(function() {
								deffered.resolve();
							});
					});
				return deffered.promise;
			});
			CLASSES.SubShift.method('cancel', function() {
				var deffered = $q.defer();
				this.deactivate()
					.then(function() {
						deffered.resolve();
					});
				return deffered.promise;
			});
			// ***********************************************************************
			// DEFINE THE TRACK CLASS
			// ***********************************************************************
			CLASSES.Track = function(data) {
				this.newData = data || {};
				this.listName = 'Track';
				this.initPublicAttributes();
			};
			CLASSES.Track.inherits(CLASSES.Data);
			CLASSES.Track.method('initPublicAttributes', function() {
				this.Description = this.newData.Description || undefined;
				this.uber('initPublicAttributes');
				this.data = this.updateData();
			});
			CLASSES.Track.method('updateData', function() {
				var returnData = this.uber('updateData');
				returnData.Description = this.Description;
				return returnData;
			});
			CLASSES.Track.method('toString', function() {
				return 'The ' + this.Description + ' track';
			});
			// ***********************************************************************
			// DEFINE THE WEEK CLASS
			// ***********************************************************************
			CLASSES.Week = function(title, firstDay) {
				this.days = [];
				this.firstDay = new Date(firstDay) || new Date(Date.sunday());
				this.title = title || 'Week 1';
				this.weekNumber = getWeekNumber(this.firstDay);
				this.days = [];
				this.getDays();
				/**
				 * This method is private and gets the semester week number
				 *
				 * @param      {date}    day    first day of the week to compare
				 *    to the first day of the semester
				 *
				 * @returns    {int}            the week number
				 */
				function getWeekNumber(day) {
					var milliseconds = Math.floor(PROPERTIES.currentSemester.FirstDay - day) * -1;
					var seconds = (milliseconds / 1000) | 0;
					milliseconds -= seconds * 1000;
					var minutes = (seconds / 60) | 0;
					seconds -= minutes * 60;
					var hours = (minutes / 60) | 0;
					minutes -= hours * 60;
					var days = (hours / 24) | 0;
					hours -= days * 24;
					var weeks = (days / 7) | 0;
					days -= weeks * 7;
					return (weeks + 1);
				}
			};
			CLASSES.Week.method('getDays', function() {
				var dayDate = new Date(this.firstDay);
				for (var i = 0; i < 7; i++) {
					this.days.push(new CLASSES.Day(dayDate));
					dayDate = dayDate.addDays(1);
				}
				return this;
			});
			CLASSES.Week.method('toString', function() {
				return this.title;
			});
			// ***********************************************************************
			// DEFINE THE DAY CLASS
			// ***********************************************************************
			CLASSES.Day = function(date) {
				this.active = true;
				this.title = date.toString('dddd');
				this.day = date.toString('ddd');
				this.date = new Date(date);
				this.weekend = date.is().weekend();
				this.today = date.is().today();
				this.past = (date < Date.today());
				this.shifts = {
					currentSemester: [],
					nextSemester: []
				}; // data used in the Schedule view
				this.availabilities = {
					currentSemester: [],
					nextSemester: []
				}; // data used in the Availability view
				this.subShifts = []; // data used in the Sub Shifts view
				this.myShifts = {
					currentSemester: [],
					nextSemester: []
				}; // data used in the My Schedule view
				this.myAvailabilities = {
					currentSemester: [],
					nextSemester: []
				}; // data used in the My Availability view
				this.getShifts();
				this.getAvailabilities();
				this.getSubShifts();
				this.getMyShifts();
				this.getMyAvailabilities();
			};
			CLASSES.Day.method('refresh', function() {
				this.getShifts();
				this.getAvailabilities();
				this.getSubShifts();
				this.getMyShifts();
				this.getMyAvailabilities();
			});
			CLASSES.Day.method('toString', function() {
				return this.title + ' ' + this.date.toString('MMMM dS');
			});
			/**
			 * This gets the shifts for the day.
			 *
			 * @returns    {object}           this for chaining
			 */
			CLASSES.Day.method('getShifts', function() {
				/** @privateAtribute {day} an alias for this */
				var day = this;
				this.shifts = {
					currentSemester: [],
					nextSemester: []
				}; // data used in the Schedule view
				getSemester(PROPERTIES.currentSemester, this.shifts.currentSemester);
				if (PROPERTIES.nextSemester.Id) {
					getSemester(PROPERTIES.nextSemester, this.shifts.nextSemester);
				}

				function getSemester(semester, returnData) {
					_.each(DATA.shifts, function(shift) {
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

				function fillSlots(currentShift, shift, semesterId) {
					var totalSlots = currentShift.Employees.length + shift.Slots;
					_.each(DATA.schedules, function(schedule) {
						if (schedule.ShiftId === shift.Id &&
							schedule.SemesterId === semesterId &&
							schedule.Active) {
							currentShift.Employees.push({
								Shift: shift,
								Info: schedule.Employee,
								Schedule: schedule
							});
						}
					});
					var remainingSlots = totalSlots - currentShift.Employees.length;
					for (var i = 0; i < remainingSlots; i++) {
						var noEmployee = {
							Shift: shift,
							Info: {
								Id: i - 100,
								PreferredName: 'No',
								LastName: 'Employee',
								Picture: '/media/missing.png'
							},
							Schedule: new CLASSES.Schedule()
						};
						noEmployee.Schedule.ShiftId = shift.Id;
						noEmployee.Schedule.SemesterId = semesterId;
						currentShift.Employees.push(noEmployee);
					}
				}
			});
			/**
			 * This gets the availabilities for the day.
			 *
			 * @returns    {object}           this for chaining
			 */
			CLASSES.Day.method('getAvailabilities', function() {
				/** @privateAtribute {day} an alias for this */
				var day = this;
				this.availabilities = {
					currentSemester: [],
					nextSemester: []
				}; // data used in the Availability view
				getSemester(PROPERTIES.currentSemester, this.availabilities.currentSemester);
				if (PROPERTIES.nextSemester.Id) {
					getSemester(PROPERTIES.nextSemester, this.availabilities.nextSemester);
				}

				function getSemester(semester, returnData) {
					_.each(DATA.shifts, function(shift) {
						if (shift.Active &&
							shift.Day.indexOf(day.day) >= 0 &&
							shift.ShiftGroup.Id === semester.ShiftGroup.Id) {
							// For each relevant shift we:
							// 1. set a flag that determines wether or not to add to returnShiftList
							var addToList = true;
							var currentShift = {};
							// 2. Check to see if this time period is already represented by another shift
							var existingShift = _.find(returnData, function(processedShift) {
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
							_.each(DATA.availabilitys, function(availability) {
								if (availability.Semester.Id === semester.Id &&
									availability.Day === day.title &&
									!(generalService.isTimeBefore(shift.StartTime, availability.StartTime)) &&
									!(generalService.isTimeBefore(availability.EndTime, shift.EndTime))) {
									// For each relevant availability we:
									// 1. check to see if the employee already works during that time period.
									var worksThisSchedule = _.find(DATA.schedules, function(schedule) {
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
			});
			/**
			 * This gets the subShifts for the day.
			 *
			 * @returns    {object}           this for chaining
			 */
			CLASSES.Day.method('getSubShifts', function() {
				/** @privateAtribute {day} an alias for this */
				var day = this;
				this.subShifts = []; // data used in the Sub Shifts view
				_.each(DATA.subShifts, function(subShift) {
					if (subShift.Active &&
						subShift.SemesterId === PROPERTIES.currentSemester.Id &&
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
			});
			/**
			 * This gets the myShifts for the day.
			 *
			 * @returns    {object}           this for chaining
			 */
			CLASSES.Day.method('getMyShifts', function() {
				/** @privateAtribute {day} an alias for this */
				var day = this;
				this.myShifts = {
					currentSemester: [],
					nextSemester: []
				}; // data used in the My Schedule view

				getSemester(PROPERTIES.currentSemester.Id, this.myShifts.currentSemester);
				if (PROPERTIES.nextSemester.Id) {
					getSemester(PROPERTIES.nextSemester.Id, this.myShifts.nextSemester);
				}

				function getSemester(semesterId, returnData) {
					var schedules = _.filter(DATA.schedules, function(schedule) {
						return (
							schedule.Active &&
							schedule.EmployeeId === PROPERTIES.currentUser.Id &&
							schedule.SemesterId === semesterId &&
							schedule.Shift.Day.indexOf(day.day) >= 0
						);
					});
					var subShifts = _.filter(DATA.subShifts, function(subShift) {
						return (
							subShift.Date.toDateString() === day.date.toDateString() &&
							subShift.Active && (
								subShift.SubstituteId === PROPERTIES.currentUser.Id ||
								subShift.RequesterId === PROPERTIES.currentUser.Id
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
						if (subShift.NewRequestId) {
							if (!subShift.NewRequest.SubstituteId) {
								returnData.push({
									shift: subShift.Shift,
									isSubShift: true,
									subShift: subShift,
									subRequest: subShift.NewRequest,
									disabled: (day.date.set({
										hour: parseInt(schedule.Shift.StartTime.toString('H')),
										minute: parseInt(schedule.Shift.StartTime.toString('m'))
									}) <= new Date().today().addDays(1))
								});
							}
						} else {
							returnData.push({
								shift: subShift.Shift,
								isSubShift: true,
								subShift: subShift,
								subRequest: undefined,
								disabled: (day.date.set({
									hour: parseInt(schedule.Shift.StartTime.toString('H')),
									minute: parseInt(schedule.Shift.StartTime.toString('m'))
								}) <= new Date().today().addDays(1))
							});
						}
					});
				}
			});
			/**
			 * This gets the myAvailabilities for the day.
			 *
			 * @returns    {object}           this for chaining
			 */
			CLASSES.Day.method('getMyAvailabilities', function() {
				/** @privateAtribute {day} an alias for this */
				var day = this;
				this.myAvailabilities = {
					currentSemester: [],
					nextSemester: []
				}; // data used in the My Availability view
				getSemester(PROPERTIES.currentSemester.Id, this.myAvailabilities.currentSemester);
				if (PROPERTIES.nextSemester.Id) {
					getSemester(PROPERTIES.nextSemester.Id, this.myAvailabilities.nextSemester);
				}

				function getSemester(semesterId, returnData) {
					_.each(DATA.availabilitys, function(availability) {
						if (availability.Active &&
							availability.EmployeeId === PROPERTIES.currentUser.Id &&
							availability.SemesterId === semesterId &&
							availability.Day === day.title) {
							returnData.push(availability);
						}
					});
				}
				return this;
			});


			service.initializeData = function() {
				var deffered = $q.defer();
				cfpLoadingBar.start();
				SET.propertyCurrentUser()
					.then(function() {
						if (PROPERTIES.loadEmployeeData) {
							cfpLoadingBar.set(cfpLoadingBar.status() + 0.1);
							dataInitialized = true;
							REFRESH.data()
								.then(function() {
									deffered.resolve();
								});
						} else {
							cfpLoadingBar.complete();
						}
					});
				return deffered.promise;
			};

			init();
			return service;

			function init() {
				$http.defaults.headers.post = {
					'Accept': 'application/json;odata=verbose',
					'Content-Type': 'application/json;odata=verbose',
					'X-RequestDigest': PROPERTIES.validation,
					'X-HTTP-Method': 'POST',
					'If-Match': '*'
				};
				REFRESH.securityValidation();
			}

		}
	]);
})();
