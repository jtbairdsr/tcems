/*
 * @Author: Jonathan Baird
 * @Date:   2014-10-28 15:04:12
 * @Last Modified 2014-12-02
 * @Last Modified time: 2015-01-17 21:55:56
 */
/* global angular, _ */

(function() {
	var app = angular.module('Services');

	app.service('dataService', ['$http', '$timeout', '$alert', '$q', '$location',
		function($http, $timeout, $alert, $q, $location) {
			var service = this;

			/////////////////
			// init $scope //
			/////////////////
			service.properties = {
				currentSemester: {},
				currentUser: {},
				defaultPosition: '',
				extendedPrivledges: false,
				loadEmployeeData: false,
				localUrl: 'http://testcenterems.byui.edu',
				nextSemester: {},
				sharePointUrl: 'https://inet.byui.edu/sites/TestingServices/',
				validation: '',
				validationTimeout: 0
			};
			service.data = {
				areas: [],
				availabilities: [],
				employees: [],
				employments: [],
				messages: [],
				noTestingDays: [],
				positions: [],
				professors: [],
				schedules: [],
				semesters: [],
				shiftGroups: [],
				shifts: [],
				subShifts: [],
				tracks: [],
			};
			service.arrays = {
				positions: [],
				shiftGroups: [],
				shifts: [],
				employees: [],
				directoryEmployees: [],
				weeks: [],
				days: [],
				subShifts: [],
				professors: [],
				availabilityDays: [],
				allAvailabilityDays: []
			};

			////////////////////
			// PUBLIC METHODS //
			////////////////////

			//////////////////
			// Data Getters //
			//////////////////
			service.getAreas = function() {
				var deffered = $q.defer();
				new service.getItems('Area')
					.top()
					.execute()
					.success(function(data) {
						service.data.areas = [];
						_.each(data.d.results, function(area) {
							service.data.areas.push(new Area(area));
						});
						deffered.resolve();
					});
				return deffered.promise;
			};
			service.getAvailabilities = function() {
				var deffered = $q.defer();
				new service.getItems('Availability')
					.top()
					.execute()
					.success(function(data) {
						service.data.availabilities = [];
						_.each(data.d.results, function(availability) {
							service.data.availabilities.push(new Availability(availability));
						});
						deffered.resolve();
					});
				return deffered.promise;
			};
			service.getEmployees = function() {
				var deffered = $q.defer();
				new service.getItems('Employee')
					.top()
					.execute()
					.success(function(data) {
						service.data.employees = [];
						_.each(data.d.results, function(employee) {
							service.data.employees.push(new Employee(employee));
						});
						service.arrays.employees = _.filter(service.data.employee, function(employee) {
							return employee.Active;
						});
						service.arrays.directoryEmployees = service.data.employees;
						deffered.resolve();
					});
				return deffered.promise;
			};
			service.getEmployments = function() {
				var deffered = $q.defer();
				new service.getItems('Employment')
					.top()
					.execute()
					.success(function(data) {
						service.data.employments = [];
						_.each(data.d.results, function(employment) {
							service.data.employments.push(new Employment(employment));
						});
						deffered.resolve();
					});
				return deffered.promise;
			};
			service.getCurrentUserInfo = function() {
				var deffered = $q.defer();
				service.getCurrentUser()
					.success(function(data) {
						var userInfo = data.d;
						new service.getItems('Employee')
							.where(['EmailAddress', 'eq', data.d.Email])
							.execute()
							.success(function(data) {
								if (data.d.results.length > 0) {
									if (data.d.results[0].Active) {
										service.properties.loadEmployeeData = true;
										service.getPositions()
											.then(function() {
												service.getAreas()
													.then(function() {
														service.getTracks()
															.then(function() {
																service.properties.currentUser = new Employee(data.d.results[0]);
																deffered.resolve();
															});
													});
											});
									} else if (/([a-zA-Z]){3}\d{5}/.test(userInfo.Email)) {
										$location.path("/inactiveEmployee");
										deffered.resolve();
									}
								} else {
									new service.getItems('Professor')
										.where(['EmailAddress', 'eq', data.d.Email])
										.execute()
										.success(function(data) {
											$location.path("/main/faculty/info");
											if (data.d.results.length > 0) {
												service.getFacultyTestingInfo()
													.then(function() {
														service.properties.currentUser = new Professor(data.d.results[0]);
													});
											} else {
												service.properties.currentUser = new Professor({
													EmailAddress: userInfor.Email
												});
											}
											deffered.resolve();
										});
								}
							});
					});
				return deffered.promise;
			};
			service.getMessages = function() {
				var deffered = $q.defer();
				new service.getItems('Message')
					.top()
					.execute()
					.success(function(data) {
						service.data.messages = [];
						_.each(data.d.results, function(message) {
							service.data.messages.push(new Message(message));
						});
						deffered.resolve();
					});
				return deffered.promise;
			};
			service.getNoTestingDays = function() {
				var deffered = $q.defer();
				new service.getItems('NoTestingDay')
					.top()
					.execute()
					.success(function(data) {
						service.data.noTestingDays = [];
						_.each(data.d.results, function(noTestingDay) {
							service.data.noTestingDays.push(new NoTestingDay(noTestingDay));
						});
						deffered.resolve();
					});
				return deffered.promise;
			};
			service.getPositions = function() {
				var deffered = $q.defer();
				new service.getItems('Position')
					.top()
					.execute()
					.success(function(data) {
						service.data.positions = [];
						_.each(data.d.results, function(position) {
							service.data.positions.push(new Position(position));
						});
						service.arrays.positions = _.filter(service.data.positions, function(position) {
							return position.Position !== 'FTE' && position.Position !== 'Applicant' && position.Position !== 'Admin';
						});
						service.arrays.allPositions = service.data.positions;
						deffered.resolve();
					});
				return deffered.promise;
			};
			service.getProfessors = function() {
				var deffered = $q.defer();
				new service.getItems('Professor')
					.top()
					.execute()
					.success(function(data) {
						service.data.professors = [];
						_.each(data.d.results, function(professor) {
							service.data.professors.push(new Professor(professor));
						});
						deffered.resolve();
					});
				return deffered.promise;
			};
			service.getSchedules = function() {
				var deffered = $q.defer();
				new service.getItems('Schedule')
					.top()
					.execute()
					.success(function(data) {
						service.data.schedules = [];
						_.each(data.d.results, function(schedule) {
							service.data.schedules.push(new Schedule(schedule));
						});
						deffered.resolve();
					});
				return deffered.promise;
			};
			service.getSentMessages = function() {
				var deffered = $q.defer();
				new service.getItems('SentMessage')
					.top()
					.execute()
					.success(function(data) {
						service.data.sentMessages = [];
						_.each(data.d.results, function(value, key, list) {
							service.data.sentMessages.push(new SentMessage(sentMessage));
						});
						deffered.resolve();
					});
				return deffered.promise;
			};
			service.getSemesters = function() {
				var deffered = $q.defer();
				new service.getItems('Semester')
					.top()
					.execute()
					.success(function(data) {
						service.data.semesters = [];
						_.each(data.d.results, function(semester) {
							service.data.semesters.push(new Semester(semester));
						});
						service.properties.currentSemester = _.find(service.data.semesters, function(semester) {
							return semester.Active;
						});
						if (service.properties.currentSemester.NextSemesterId !== '') {
							service.properties.nextSemester = _.find(service.data.semesters, function(semester) {
								return semester.Id === service.properties.currentSemester.NextSemesterId;
							});
						}
						deffered.resolve();
					});
				return deffered.promise;
			};
			service.getShiftGroups = function() {
				var deffered = $q.defer();
				new service.getItems('ShiftGroup')
					.top()
					.execute()
					.success(function(data) {
						service.data.shiftGroups = [];
						_.each(data.d.results, function(shiftGroup) {
							service.data.shiftGroups.push(new ShiftGroup(shiftGroup));
						});
						deffered.resolve();
					});
				return deffered.promise;
			};
			service.getShifts = function() {
				var deffered = $q.defer();
				new service.getItems('Shift')
					.top()
					.execute()
					.success(function(data) {
						service.data.shifts = [];
						_.each(data.d.results, function(shift) {
							service.data.shifts.push(new Shift(shift));
						});
						deffered.resolve();
					});
				return deffered.promise;
			};
			service.getSubShifts = function() {
				var deffered = $q.defer();
				new service.getItems('SubShift')
					.top()
					.execute()
					.success(function(data) {
						service.data.subShifts = [];
						_.each(data.d.results, function(subShift) {
							service.data.subShifts.push(new SubShift(subShift));
						});
						deffered.resolve();
					});
				return deffered.promise;
			};
			service.getTracks = function() {
				var deffered = $q.defer();
				new service.getItems('Track')
					.top()
					.execute()
					.success(function(data) {
						service.data.tracks = [];
						_.each(data.d.results, function(track) {
							service.data.tracks.push(new Track(track));
						});
						deffered.resolve();
					});
				return deffered.promise;
			};

			////////////////////
			// Data Utilities //
			////////////////////
			service.getJson = function(url, cache) {
				cache = cache || false;
				return $http.get(url, {
					headers: {
						'accept': 'application/json;odata=verbose',
						'cache': cache
					}
				});
			};
			service.getCurrentUser = function() {
				return service.getJson(service.properties.sharePointUrl +
					'_api/web/currentUser', true);
			};
			service.addItem = function(listName, item) {
				$http.defaults.headers.post = {
					'Accept': 'application/json;odata=verbose',
					'Content-Type': 'application/json;odata=verbose',
					'X-RequestDigest': service.properties.validation,
				};
				return $http.post(service.properties.sharePointUrl +
					'_api/lists/getbytitle(\'' + listName + '\')/items', item);
			};
			// create the updateItem method
			service.updateItem = function(listName, itemId, item, etag) {
				etag = etag || '*';
				return $http({
					method: 'POST',
					url: service.properties.sharePointUrl + '_api/lists/getbytitle(\'' +
						listName + '\')/items(' + itemId + ')',
					data: item,
					headers: {
						'accept': 'application/json;odata=verbose',
						'content-type': 'application/json;odata=verbose',
						'X-RequestDigest': service.properties.validation,
						'IF-MATCH': etag,
						'X-HTTP-Method': 'MERGE'
					}
				});
			};
			// create the deleteItem method
			service.deleteItem = function(listName, itemId) {
				return $http({
					method: 'POST',
					url: service.properties.sharePointUrl + '_api/lists/getbytitle(\'' +
						listName + '\')/items(' + itemId + ')',
					headers: {
						'X-HTTP-Method': 'DELETE',
						'IF-MATCH': '*',
						'X-RequestDigest': service.properties.validation
					}
				});
			};
			// create the getItem method
			service.getItem = function(listName, itemId) {
				return service.getJson(service.properties.sharePointUrl +
					'_api/lists/getbytitle(\'' + listName + '\')/items(\'' + itemId +
					'\')', false);
			};
			// create the getItems Object
			service.getItems = function(listName) {
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
							if (service.getClass(orRequest) === 'String') {
								query += orRequest;
							} else {
								for (i = 0; i < orRequest.length; i++) {
									if (service.getClass(orRequest[i]) === 'String') {
										query += orRequest[i];
									} else {
										query += orRequest[i][0] + ' ' + orRequest[i][1] + ((service.getClass(
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
							if (service.getClass(andRequest) === 'String') {
								query += andRequest;
							} else {
								for (i = 0; i < andRequest.length; i++) {
									if (service.getClass(andRequest[i]) === 'String') {
										query += andRequest[i];
									} else {
										query += andRequest[i][0] + ' ' + andRequest[i][1] + ((service.getClass(
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
						filterQuery += params[0] + ' ' + params[1] + ((service.getClass(
							params[2]) === 'String') ? (((params[1].split(' ')
							.length > 0) ? '\'' : ' \'') + params[2] + '\'') : ' ' + params[
							2]);
						filterFlag = false;
					} else {
						if (params.or !== undefined) {
							if (service.getClass(params.or) !== 'Array') {
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
							if (service.getClass(params.and) !== 'Array') {
								if (params.and.or !== undefined) {
									tempQueryHolder.push('(' + addOr(params.and.or) + ')');
								}
								if (params.and.and !== undefined) {
									tempQueryHolder.push('(' + addAnd(params.and.and) + ')');
								}
								if (params.and.other !== undefined) {
									// if (service.getClass(params.and.other) === 'Array') {
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
					return service.getJson(service.properties.sharePointUrl +
						'_api/lists/getbytitle(\'' + this.listName + '\')/items' + this.query,
						cache);
				};
			}; // end of getItems Object
			// Create the getUserByEmail method
			service.getUserByEmail = function(email) {
				return $http.get(service.properties.sharePointUrl +
					'_api/web/siteusers/getbyemail(\'' + email + '\')', {
						headers: {
							'accept': 'application/json;odata=verbose'
						}
					});
			}; //end of getUserByEmail method

			//////////////////
			// Misc Methods //
			//////////////////
			// Create isTimeBefore method
			service.isTimeBefore = function(date1, date2) {
				var hr1 = date1.getHours();
				var hr2 = date2.getHours();
				var min1 = date1.getMinutes();
				var min2 = date2.getMinutes();
				var returnValue;
				if (hr1 < hr2) {
					returnValue = true;
				} else if (hr1 === hr2 && min1 < min2) {
					returnValue = true;
				} else {
					returnValue = false;
				}
				return returnValue;
			}; //end of isTimeBefore method
			// Create getClass method
			service.getClass = function(object) {
				return Object.prototype.toString.call(object)
					.slice(8, -1);
			}; //end of getClass method


			// create the refreshSecurityValidation method.
			service.refreshSecurityValidation = function() {
				$http.post(service.properties.sharePointUrl + '_api/contextinfo')
					.success(function(data) {
						var siteContextinfo = data.d.GetContextWebInformation;
						service.properties.validationTimeout = siteContextinfo.FormDigestTimeoutSeconds -
							10;
						service.properties.validation = siteContextinfo.FormDigestValue;
						$timeout(function() {
							service.refreshSecurityValidation();
							service.refreshData();
						}, service.properties.validationTimeout * 1000);
					})
					.error(function(data) {
						service.errors.push(data);
					});
			};
			service.refreshData = function() {

			};
			service.getInitialData = function() {
				var deffered = $q.defer();
				service.getCurrentUserInfo()
					.then(function() {
						if (service.properties.loadEmployeeData) {
							service.getPositions()
								.then(function() {
									service.getAreas()
										.then(function() {
											service.getEmployees();
										});
								});
							service.getMessages()
								.then(function() {
									service.getSentMessages();
								});
							service.getShiftGroups()
								.then(function() {
									service.getSemesters();
								});
							deffered.resolve();
						}
					});
				return deffered.promise;
			};
			service.Position = function(data) {
				data = data || {};
				// alias this
				var position = this;
				initAttributes(data);

				position.add = function() {
					console.log('INSIDE ADD METHOD');
					updateData();
					if (position.__metadata.etag !== undefined) {
						$alert({
							show: true,
							placement: 'top-right',
							content: position.Position + ' already exists!',
							animation: 'am-fade-and-slide-top',
							duration: '3',
							type: 'success',
							template: 'partials/alerts/success-alert.html'
						});
					} else {
						service.addItem('Position', position.data)
							.success(function(data) {
								service.data.positions.push(position);
								console.log(data);
								$alert({
									show: true,
									placement: 'top-right',
									content: position.Position + ' has been added!',
									animation: 'am-fade-and-slide-top',
									duration: '3',
									type: 'success',
									template: 'partials/alerts/success-alert.html'
								});
							});
					}
				};
				position.remove = function() {
					service.deleteItem('Position', position.Id)
						.success(function(data) {
							service.data.positions = _.without(service.data.positions, position);
							$alert({
								show: true,
								placement: 'top-right',
								content: position.Position + ' has been removed!',
								animation: 'am-fade-and-slide-top',
								duration: '3',
								type: 'success',
								template: 'partials/alerts/success-alert.html'
							});
						});
				};
				position.setAccess = function() {
					position.Access = (position.Position === service.properties.currentUser.Position.Position ||
						position.Position === service.properties.defaultPosition ||
						position.Position === 'Proctor' ||
						service.properties.currentUser.Position.Position === 'FTE' ||
						service.properties.currentUser.Admin);
				};
				position.setActive = function() {
					position.Active = ((position.Position === service.properties.defaultPosition &&
							service.properties.currentUser.Position.Position === 'FTE') ^
						position.Position === service.properties.currentUser.Position.Position);
				};

				function initAttributes(data) {
					position.Created = data.Created || '';
					position.GUID = data.GUID || '';
					position.Id = data.Id || '';
					position.Modified = data.Modified || '';
					position.Position = data.Position || '';
					position.__metadata = data.__metadata || {
						type: 'SP.Data.PositionListItem'
					};
					updateData();
				}

				function updateData() {
					position.data = {
						Position: position.Position,
						__metadata: position.__metadata
					};
				}
			};


			// init the service
			init();
			return service;

			// create the init function... similar to a class constructor
			function init() {
				$http.defaults.headers.post = {
					'Accept': 'application/json;odata=verbose',
					'Content-Type': 'application/json;odata=verbose',
					'X-RequestDigest': service.properties.validation,
					'X-HTTP-Method': 'POST',
					'If-Match': '*'
				};
				service.refreshSecurityValidation();
				// service.refreshData();
				// service.getCurrentUser();
			}

			/////////////
			// Classes //
			/////////////
			function Area(data) {
				// alias this
				var area = this;
				initAttributes(data);
				////////////////////
				// Public Methods //
				////////////////////
				area.add = function() {};
				area.remove = function() {};
				/////////////////////
				// Private Methods //
				/////////////////////
				function initAttributes(data) {
					area.Area = data.Area || '';
					area.Created = data.Created || '';
					area.GUID = data.GUID || '';
					area.Id = data.Id || '';
					area.Modified = data.Modified || '';
					area.__metadata = data.__metadata || {
						type: 'SP.Data.AreaListItem'
					};
					updateData();
				}

				function updateData() {
					area.data = {
						Area: area.Area,
						__metadata: area.__metadata
					};
				}
			}

			function Availability(data) {
				// alias this
				var availability = this;
				initAttributes(data);
				////////////////////
				// Public Methods //
				////////////////////
				availability.add = function() {};
				availability.remove = function() {};
				/////////////////////
				// Private Methods //
				/////////////////////
				function initAttributes(data) {}

				function updateData() {}
			}

			function Employee(data) {
				var employee = this;
				initAttributes(data);

				////////////////////
				// Public Methods //
				////////////////////
				employee.update = function() {
					updateData();
					service.updateItem('Employee', employee.Id, employee.data, '*')
						.success(function(data) {
							employee.refresh();
							var content = '';
							if (employee.Id === service.properties.currentUser.Id) {
								content = 'Your information has been updated';
							} else {
								content = employee.PreferredName + ' ' + employee.LastName + '\'s information has been updated!';
							}
							$alert({
								show: true,
								placement: 'top-right',
								content: content,
								animation: 'am-fade-and-slide-top',
								duration: '3',
								type: 'success',
								template: 'partials/alerts/success-alert.html'
							});
						});
				};
				employee.refresh = function() {
					service.getItem('Employee', employee.Id)
						.success(function(data) {
							initAttributes(data.d);
						});
				};
				employee.create = function() {
					updateData();
					if (position.__metadata.etag !== undefined) {
						$alert({
							show: true,
							placement: 'top-right',
							content: employee.PreferredName + ' ' + employee.PreferredName + ' already exists!',
							animation: 'am-fade-and-slide-top',
							duration: '3',
							type: 'success',
							template: 'partials/alerts/success-alert.html'
						});
					} else {
						service.addItem('Employee', employee.data)
							.success(function(data) {
								service.data.employees.push(employee);
								employee.activate();
							});
					}
				};
				employee.activate = function() {
					var employment = new Employment();
					employment.start();
					employee.Active = true;
					updateData();
					employee.update();
				};
				employee.deactivate = function() {
					var employment = _.find(service.data.employments, function(employment) {
						return employment.EndDate === undefined &&
							employment.EmployeeId === employee.Id;
					});
					employment.end();
					employee.Active = false;
					updateData();
					employee.update();
				};
				employee.remove = function() {
					service.deleteItem('Employee', employee.Id)
						.success(function(data) {
							service.data.employees = _.without(service.data.employees, employee);
							$alert({
								show: true,
								placement: 'top-right',
								content: employee.PreferredName + ' ' + employee.LastName + ' has been removed!',
								animation: 'am-fade-and-slide-top',
								duration: '3',
								type: 'success',
								template: 'partials/alerts/success-alert.html'
							});
						});
				};
				employee.setEmployements = function() {
					employee.Employments = _.filter(service.data.employments, function(employment) {
						return employment.EmployeeId === employee.Id;
					});
				};
				employee.setIntent = function() {
					employee.Intent = _.find(service.data.intents, function(intent) {
						return intent.EmployeeId === employee.Id;
					});
				};
				employee.declareIntent = function() {};

				/////////////////////
				// Private Methods //
				/////////////////////

				function initAttributes() {
					employee.Active = data.Active || false;
					employee.Admin = data.Admin || false;
					employee.AreaId = data.AreaId || '';
					employee.Created = data.Created || '';
					employee.EmailAddress = data.EmailAddress || '';
					employee.FirstName = data.FirstName || '';
					employee.GUID = data.GUID || '';
					employee.Id = data.Id || '';
					employee.INumber = data.INumber || '';
					employee.LastName = data.LastName || '';
					employee.Modified = data.Modified || '';
					employee.PhoneNumber = data.PhoneNumber || '';
					employee.Picture = data.Picture || '';
					employee.PositionId = data.PositionId || '';
					employee.PreferredName = data.PreferredName || '';
					employee.Reader = data.Reader || false;
					employee.TeamId = data.TeamId || '';
					employee.TrackId = data.TrackId || '';
					employee.__metadata = data.__metadata || {
						type: 'SP.Data.EmployeeListItem'
					};
					updateData();
					expandData();
				}

				function updateData() {
					employee.data = {
						Active: employee.Active,
						Admin: employee.Admin,
						AreaId: employee.AreaId,
						EmailAddress: employee.EmailAddress,
						FirstName: employee.FirstName,
						INumber: employee.INumber,
						LastName: employee.LastName,
						PhoneNumber: employee.PhoneNumber,
						Picture: employee.Picture,
						PositionId: employee.PositionId,
						PreferredName: employee.PreferredName,
						Reader: employee.Reader,
						// TeamId: employee.TeamId,
						TrackId: employee.TrackId,
						__metadata: employee.__metadata
					};
				}

				function expandData() {
					setArea();
					setPosition();
					// setTeam();
					setTrack();
					employee.Created = (employee.Created !== '') ? Date.parse(employee.Created) : '';
					employee.Modified = (employee.Modified !== '') ? Date.parse(employee.Modified) : '';
					if (employee.Position.Position === 'FTE' ||
						employee.Position.Position === 'HR' ||
						employee.Admin) {
						employee.ExtendedPrivledges = true;
					}
				}

				function setArea() {
					employee.Area = _.find(service.data.areas, function(area) {
						return area.Id === employee.AreaId;
					}) || {};
				}

				function setPosition() {
					employee.Position = _.find(service.data.positions, function(position) {
						return position.Id === employee.PositionId;
					}) || {};
				}

				function setTeam() {
					employee.Team = _.find(service.data.teams, function(team) {
						return team.Id === employee.TeamId;
					}) || {};
				}

				function setTrack() {
					employee.Track = _.find(service.data.tracks, function(track) {
						return track.Id === employee.TrackId;
					}) || {};
				}
			}

			function Employment(data) {
				// alias this
				var employment = this;
				initAttributes(data);
				////////////////////
				// Public Methods //
				////////////////////
				employment.add = function() {};
				employment.remove = function() {};
				employment.update = function() {};
				employment.start = function() {};
				employment.end = function() {};
				/////////////////////
				// Private Methods //
				/////////////////////
				function initAttributes(data) {}

				function updateData() {}
			}

			function Message(data) {
				// alias this
				var message = this;
				initAttributes(data);
				////////////////////
				// Public Methods //
				////////////////////
				message.add = function() {};
				message.remove = function() {};
				message.send = function() {};
				message.read = function() {};
				message.update = function() {};
				message.setToList = function() {
					var sentMessages = _.filter(service.data.sentMessages, function(sentMessage) {
						return sentMessage.MessageId === message.Id;
					});
					_.each(sentMessages, function(sentMessage) {
						message.ToList.push(_.find(service.data.employees, function(employee) {
							return employee.Id === sentMessage.EmployeeId;
						}));
					});
				};
				/////////////////////
				// Private Methods //
				/////////////////////
				function initAttributes(data) {
					message.Active = data.Active || false;
					message.Body = data.Body || '';
					message.Created = data.Created || '';
					message.DueDate = data.DueDate || '';
					message.ExpDate = data.ExpDate || '';
					message.GUID = data.GUID || '';
					message.Id = data.Id || '';
					message.Manditory = data.Manditory || false;
					message.Modified = data.Modified || '';
					message.Policy = data.Policy || false;
					message.SemesterId = data.SemesterId || '';
					message.Subject = data.Subject || '';
					message.__metadata = data.__metadata || {
						type: 'SP.Data.AreaListItem'
					};
					updateData();
					expandData();
				}

				function updateData() {
					message.data = {
						Active: message.Active,
						Body: message.Body,
						DueDate: message.DueDate,
						ExpDate: message.ExpDate,
						Manditory: message.Manditory,
						Policy: message.Policy,
						SemesterId: message.SemesterId,
						Subject: message.Subject,
						__metadata: message.__metadata
					};
				}

				function expandData() {
					message.Created = (message.Created !== '') ? Date.parse(message.Created) : '';
					message.DueDate = (message.DueDate !== '') ? Date.parse(message.DueDate) : '';
					message.ExpDate = (message.ExpDate !== '') ? Date.parse(message.ExpDate) : '';
					message.Modified = (message.Modified !== '') ? Date.parse(message.Modified) : '';
				}
				console.log(message);
			}

			function NoTestingDay(data) {
				// alias this
				var noTestingDay = this;
				initAttributes(data);
				////////////////////
				// Public Methods //
				////////////////////
				noTestingDay.add = function() {};
				noTestingDay.remove = function() {};
				/////////////////////
				// Private Methods //
				/////////////////////
				function initAttributes(data) {}

				function updateData() {}
			}

			function Position(data) {
				// alias this
				var position = this;
				initAttributes(data);

				position.add = function() {
					updateData();
					if (position.__metadata.etag !== undefined) {
						$alert({
							show: true,
							placement: 'top-right',
							content: position.Position + ' already exists!',
							animation: 'am-fade-and-slide-top',
							duration: '3',
							type: 'success',
							template: 'partials/alerts/success-alert.html'
						});
					} else {
						service.addItem('Position', position.data)
							.success(function(data) {
								service.data.positions.push(position);
								$alert({
									show: true,
									placement: 'top-right',
									content: position.Position + ' has been added!',
									animation: 'am-fade-and-slide-top',
									duration: '3',
									type: 'success',
									template: 'partials/alerts/success-alert.html'
								});
							});
					}
				};
				position.remove = function() {
					service.deleteItem('Position', position.Id)
						.success(function(data) {
							service.data.positions = _.without(service.data.positions, position);
							$alert({
								show: true,
								placement: 'top-right',
								content: position.Position + ' has been removed!',
								animation: 'am-fade-and-slide-top',
								duration: '3',
								type: 'success',
								template: 'partials/alerts/success-alert.html'
							});
						});
				};
				position.setAccess = function() {
					position.Access = (position.Position === service.properties.currentUser.Position.Position ||
						position.Position === service.properties.defaultPosition ||
						position.Position === 'Proctor' ||
						service.properties.currentUser.Position.Position === 'FTE' ||
						service.properties.currentUser.Admin);
				};
				position.setActive = function() {
					position.Active = ((position.Position === service.properties.defaultPosition &&
							service.properties.currentUser.Position.Position === 'FTE') ^
						position.Position === service.properties.currentUser.Position.Position);
				};

				function initAttributes(data) {
					position.Created = data.Created || '';
					position.GUID = data.GUID || '';
					position.Id = data.Id || '';
					position.Modified = data.Modified || '';
					position.Position = data.Position || '';
					position.__metadata = data.__metadata || {
						type: 'SP.Data.PositionListItem'
					};
					updateData();
				}

				function updateData() {
					position.data = {
						Position: position.Position,
						__metadata: position.__metadata
					};
				}
			}

			function Professor(data) {
				// alias this
				var professor = this;
				initAttributes(data);
				////////////////////
				// Public Methods //
				////////////////////
				professor.add = function() {};
				professor.remove = function() {};
				professor.update = function() {};
				/////////////////////
				// Private Methods //
				/////////////////////
				function initAttributes(data) {}

				function updateData() {}
			}

			function Schedule(data) {
				// alias this
				var schedule = this;
				initAttributes(data);
				////////////////////
				// Public Methods //
				////////////////////
				schedule.add = function() {};
				schedule.remove = function() {};
				schedule.update = function() {};
				/////////////////////
				// Private Methods //
				/////////////////////
				function initAttributes(data) {}

				function updateData() {}
			}

			function SentMessage(data) {
				// alias this
				var sentMessage = this;
				initAttributes(data);
				////////////////////
				// Public Methods //
				////////////////////
				sentMessage.add = function() {};
				sentMessage.remove = function() {};
				sentMessage.update = function() {};
				/////////////////////
				// Private Methods //
				/////////////////////
				function initAttributes(data) {}

				function updateData() {}
			}

			function Semester(data) {
				// alias this
				var semester = this;
				initAttributes(data);
				////////////////////
				// Public Methods //
				////////////////////
				semester.add = function() {};
				semester.remove = function() {};
				semester.update = function() {};
				/////////////////////
				// Private Methods //
				/////////////////////
				function initAttributes(data) {
					semester.Active = data.Active || false;
					semester.Created = data.Created || '';
					semester.FirstDay = data.FirstDay || '';
					semester.GUID = data.GUID || '';
					semester.Id = data.Id || '';
					semester.LastDay = data.LastDay || '';
					semester.Modified = data.Modified || '';
					semester.NextSemesterId = data.NextSemesterId || '';
					semester.ShiftGroupId = data.ShiftGroupId || '';
					semester.Year = data.Year || '';
					semester.__metadata = data.__metadata || {
						type: 'SP.Data.SemesterListItem'
					};
					expandData();
					updateData();
				}

				function expandData() {
					if (semester.NextSemesterId !== '') {
						semester.NextSemester = _.find(service.data.semesters, function(foundSemester) {
							return foundSemester.Id === semester.NextSemesterId;
						});
					}
					semester.ShiftGroup = _.find(service.data.shiftGroups, function(shiftGroup) {
						return shiftGroup.Id === semester.ShiftGroupId;
					});
					semester.Created = (semester.Created !== '') ? Date.parse(semester.Created) : '';
					semester.FirstDay = (semester.FirstDay !== '') ? Date.parse(semester.FirstDay) : '';
					semester.LastDay = (semester.LastDay !== '') ? Date.parse(semester.LastDay) : '';
					semester.Modified = (semester.Modified !== '') ? Date.parse(semester.Modified) : '';
				}

				function updateData() {
					semester.data = {
						Active: semester.Active,
						FirstDay: semester.FirstDay,
						LastDay: semester.LastDay,
						NextSemesterId: semester.NextSemesterId,
						ShiftGroupId: semester.ShiftGroupId,
						Year: semester.Year,
						__metadata: semester.__metadata
					};
				}
			}

			function ShiftGroup(data) {
				// alias this
				var shiftGroup = this;
				initAttributes(data);
				////////////////////
				// Public Methods //
				////////////////////
				shiftGroup.add = function() {};
				shiftGroup.remove = function() {};
				/////////////////////
				// Private Methods //
				/////////////////////
				function initAttributes(data) {
					shiftGroup.Created = data.Created || '';
					shiftGroup.Description = data.Description || '';
					shiftGroup.GUID = data.GUID || '';
					shiftGroup.Id = data.Id || '';
					shiftGroup.Modified = data.Modified || '';
					shiftGroup.__metadata = data.__metadata || {
						type: 'SP.Data.ShiftGroupListItem'
					};
					expandData();
					updateData();
				}

				function expandData() {
					shiftGroup.Created = (shiftGroup.Created !== '') ? Date.parse(shiftGroup.Created) : '';
					shiftGroup.Modified = (shiftGroup.Modified !== '') ? Date.parse(shiftGroup.Modified) : '';
				}

				function updateData() {
					shiftGroup.data = {
						Description: shiftGroup.Description,
						__metadata: shiftGroup.__metadata
					};
				}
			}

			function Shift(data) {
				// alias this
				var shift = this;
				initAttributes(data);
				////////////////////
				// Public Methods //
				////////////////////
				shift.add = function() {};
				shift.remove = function() {};
				/////////////////////
				// Private Methods //
				/////////////////////
				function initAttributes(data) {}

				function updateData() {}
			}

			function SubShift(data) {
				// alias this
				var subShift = this;
				initAttributes(data);
				////////////////////
				// Public Methods //
				////////////////////
				subShift.add = function() {};
				subShift.remove = function() {};
				/////////////////////
				// Private Methods //
				/////////////////////
				function initAttributes(data) {}

				function updateData() {}
			}

			function Track(data) {
				// alias this
				var track = this;
				initAttributes(data);
				////////////////////
				// Public Methods //
				////////////////////
				track.add = function() {};
				track.remove = function() {};
				/////////////////////
				// Private Methods //
				/////////////////////
				function initAttributes(data) {
					track.Created = data.Created || '';
					track.Description = data.Description || '';
					track.GUID = data.GUID || '';
					track.Id = data.Id || '';
					track.Modified = data.Modified || '';
					track.__metadata = data.__metadata || {
						type: 'SP.Data.TrackListItem'
					};
					updateData();
				}

				function updateData() {
					track.data = {
						Description: track.Description,
						__metadata: track.__metadata
					};
				}
			}
		}
	]);

	app.config(['$httpProvider',
		function($httpProvider) {
			$httpProvider.defaults.useXDomain = true;
			delete $httpProvider.defaults.headers.common['X-Requested-With'];
		}
	]);

	app.filter('numberFixedLen', function() {
		return function(a, b) {
			return (1e4 + a + '')
				.slice(-b);
		};
	});
	app.filter('partition', function() {
		var cache = {};
		var filter = function(arr, size) {
			if (!arr) {
				return;
			}
			var newArr = [];
			for (var i = 0; i < arr.length; i += size) {
				newArr.push(arr.slice(i, i + size));
			}
			var arrString = JSON.stringify(arr);
			var fromCache = cache[arrString + size];
			if (JSON.stringify(fromCache) === JSON.stringify(newArr)) {
				return fromCache;
			}
			cache[arrString + size] = newArr;
			return newArr;
		};
		return filter;
	});
	app.filter('tel', function() {
		return function(tel) {
			if (!tel) {
				return '';
			}

			var value = tel.toString()
				.trim()
				.replace(/^\+/, '');

			if (value.match(/[^0-9]/)) {
				return tel;
			}

			var country, city, number;

			switch (value.length) {
				case 10: // +1PPP####### -> C (PPP) ###-####
					country = 1;
					city = value.slice(0, 3);
					number = value.slice(3);
					break;

				case 11: // +CPPP####### -> CCC (PP) ###-####
					country = value[0];
					city = value.slice(1, 4);
					number = value.slice(4);
					break;

				case 12: // +CCCPP####### -> CCC (PP) ###-####
					country = value.slice(0, 3);
					city = value.slice(3, 5);
					number = value.slice(5);
					break;

				default:
					return tel;
			}

			if (country === 1) {
				country = '';
			}

			number = number.slice(0, 3) + '-' + number.slice(3);

			return (country + ' (' + city + ') ' + number)
				.trim();
		};
	});
	app.filter('unique', function() {
		return function(items, filterOn) {
			if (filterOn === false) {
				return items;
			}
			if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(
					items)) {
				var newItems = [];
				var extractValueToCompare = function(item) {
					if (angular.isObject(item) && angular.isString(filterOn)) {
						return item[filterOn];
					} else {
						return item;
					}
				};

				angular.forEach(items, function(item) {
					var isDuplicate = false;
					for (var i = 0; i < newItems.length; i++) {
						if (angular.equals(extractValueToCompare(newItems[i]),
								extractValueToCompare(item))) {
							isDuplicate = true;
							break;
						}
					}
					if (!isDuplicate) {
						newItems.push(item);
					}
				});
				items = newItems;
			}
			return items;
		};
	});
	app.filter('truncate', function() {
		return function(text, length, end) {
			if (isNaN(length))
				length = 10;

			if (end === undefined)
				end = "...";

			if (text.length <= length) {
				return text;
			} else {
				return String(text).substring(0, length) + end;
			}

		};
	});
})();
//  || text.length - end.length <= length
//  - end.length
