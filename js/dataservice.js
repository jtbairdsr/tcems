/*
 * @Author: Jonathan Baird
 * @Date:   2014-10-28 15:04:12
 * @Last Modified 2014-12-02
 * @Last Modified time: 2015-01-18 20:36:12
 */
/* global angular, _ */

(function() {
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
	Function.prototype.inheritsFrom = function(parentClassOrObject) {
		if (parentClassOrObject.constructor === Function) {
			//Normal Inheritance
			this.prototype = new parentClassOrObject();
			this.prototype.constructor = this;
			this.prototype.parent = parentClassOrObject.prototype;
		} else {
			//Pure Virtual Inheritance
			this.prototype = parentClassOrObject;
			this.prototype.constructor = this;
			this.prototype.parent = parentClassOrObject;
		}
		return this;
	};
	var app = angular.module('Services');

	app.service('dataService', ['$http', '$timeout', '$q', '$location', 'generalService',
		function($http, $timeout, $q, $location, generalService) {
			var service = this;
			var dataInitialized = false;
			//////////////////
			// Data Getters //
			//////////////////
			service.getAreas = function() {
				var deffered = $q.defer();
				service.getAllItems('Area')
					.success(function(data) {
						generalService.data.areas = [];
						_.each(data.d.results, function(area) {
							generalService.data.areas.push(new service.Area(area));
						});
						deffered.resolve();
					});
				return deffered.promise;
			};
			service.getAvailabilities = function() {
				var deffered = $q.defer();
				service.getAllItems('Availability')
					.success(function(data) {
						generalService.data.availabilities = [];
						_.each(data.d.results, function(availability) {
							generalService.data.availabilities.push(new service.Availability(availability));
						});
						deffered.resolve();
					});
				return deffered.promise;
			};
			service.getEmployees = function() {
				var deffered = $q.defer();
				service.getAllItems('Employee')
					.success(function(data) {
						generalService.data.employees = [];
						_.each(data.d.results, function(employee) {
							generalService.data.employees.push(new service.Employee(employee));
						});
						generalService.arrays.employees = _.filter(generalService.data.employee, function(employee) {
							return employee.Active;
						});
						generalService.arrays.directoryEmployees = generalService.data.employees;
						deffered.resolve();
					});
				return deffered.promise;
			};
			service.getEmployments = function() {
				var deffered = $q.defer();
				service.getAllItems('Employment')
					.success(function(data) {
						generalService.data.employments = [];
						_.each(data.d.results, function(employment) {
							generalService.data.employments.push(new service.Employment(employment));
						});
						deffered.resolve();
					});
				return deffered.promise;
			};
			service.getCurrentUserInfo = function() {
				// TODO: break this down into multiple functions
				var deffered = $q.defer();
				service.getCurrentUser()
					.success(function(data) {
						var userInfo = data.d;
						new service.getItems('Employee')
							.where(['EmailAddress', 'eq', userInfo.Email])
							.execute()
							.success(function(data) {
								if (data.d.results.length > 0) {
									if (data.d.results[0].Active) {
										generalService.properties.loadEmployeeData = true;
										service.getPositions()
											.then(function() {
												service.getAreas()
													.then(function() {
														service.getTracks()
															.then(function() {
																generalService.properties.currentUser = new service.Employee(data.d.results[0]);
																deffered.resolve();
															});
													});
											});
									} else if (/([a-zA-Z]){3}\d{5}/.test(userInfo.Email)) {
										$location.path("/inactiveEmployee");
										deffered.resolve();
									}
								} else if (!(/([a-zA-Z]){3}\d{5}/.test(userInfo.Email))) {
									new service.getItems('Professor')
										.where(['EmailAddress', 'eq', data.d.Email])
										.execute()
										.success(function(data) {
											$location.path("/main/faculty/info");
											if (data.d.results.length > 0) {
												service.getFacultyTestingInfo()
													.then(function() {
														generalService.properties.currentUser = new service.Professor(data.d.results[0]);
													});
											} else {
												generalService.properties.currentUser = new service.Professor({
													EmailAddress: userInfor.Email
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
			service.getCurrentSemester = function() {
				generalService.properties.currentSemester = _.find(generalService.data.semesters, function(semester) {
					return semester.Active;
				});
				if (generalService.properties.currentSemester.NextSemesterId !== '') {
					generalService.properties.nextSemester = _.find(generalService.data.semesters, function(semester) {
						return semester.Id === generalService.properties.currentSemester.NextSemesterId;
					});
				}
			};
			/**
			 * Refresh all of the generalService.data arrays
			 *
			 * @returns    {promise}    this promise will be resolved when all of the data is ready.
			 */
			service.refreshData = function() {
				var deffered1 = $q.defer();
				getFirstTierData()
					.then(function() {
						getSecondTierData()
							.then(function() {
								console.log('DONE WITH SECOND TIER');
								getThirdTierData()
									.then(function() {
										getFourthTierData()
											.then(function() {
												deffered1.resolve();
											});
									});
							});
					});
				return deffered1.promise;
				/**
				 * This function gets the first tier of data.
				 *
				 * @returns    {promise}    this promise will be resolved when
				 *    all the data is returned and we can move on to the second
				 *    tier.
				 */
				function getFirstTierData() {
					var deffered = $q.defer();
					var dataCalls = [
						service.getShiftGroups(),
						service.getPositions(),
						service.getAreas(),
						service.getTracks(),
						// service.getTeams(),
						service.getProfessors()
					];
					$q.all(dataCalls)
						.then(function() {
							deffered.resolve();
						});
					return deffered.promise;
				}

				/**
				 * This function gets the second tier of data.
				 *
				 * @returns    {promise}    this promise will be resolved when
				 *    all the data is returned and we can move on to the third
				 *    tier.
				 */
				function getSecondTierData() {
					var deffered = $q.defer();
					var dataCalls = [
						service.getShifts(),
						service.getEmployees(),
						service.getSemesters(),
					];
					$q.all(dataCalls)
						.then(function() {
							deffered.resolve();
						});
					return deffered.promise;
				}

				/**
				 * This function gets the third tier of data.
				 *
				 * @returns    {promise}    this promise will be resolved when
				 *    all the data is returned and we can move on the fourth
				 *    tier.
				 */
				function getThirdTierData() {
					console.log('INSIDE THIRD TIER');
					var deffered = $q.defer();
					var dataCalls = [
						service.getSchedules(),
						service.getSubShifts(),
						service.getAvailabilities(),
						service.getEmployments(),
						service.getMessages(),
						service.getNoTestingDays()
					];
					$q.all(dataCalls)
						.then(function() {
							deffered.resolve();
						});
					return deffered.promise;
				}

				/**
				 * This function gets the fourth tier of data.
				 *
				 * @returns    {promise}    this promis will be resolved when
				 *    all the data is returned and we can move on to the fourth
				 *    tier.
				 */
				function getFourthTierData() {
					var deffered = $q.defer();
					var dataCalls = [
						service.getSentMessages()
					];
					$q.all(dataCalls)
						.then(function() {
							deffered.resolve();
						});
					return deffered.promise;
				}
			};
			service.getInitialData = function() {
				var deffered = $q.defer();
				service.getCurrentUserInfo()
					.then(function() {
						if (generalService.properties.loadEmployeeData) {
							service.refreshData()
								.then(function() {
									deffered.resolve();
								});
						}
					});
				return deffered.promise;
			};
			service.getMessages = function() {
				var deffered = $q.defer();
				service.getAllItems('Message')
					.success(function(data) {
						generalService.data.messages = [];
						_.each(data.d.results, function(message) {
							generalService.data.messages.push(new service.Message(message));
						});
						deffered.resolve();
					});
				return deffered.promise;
			};
			service.getNoTestingDays = function() {
				var deffered = $q.defer();
				service.getAllItems('NoTestingDay')
					.success(function(data) {
						generalService.data.noTestingDays = [];
						_.each(data.d.results, function(noTestingDay) {
							generalService.data.noTestingDays.push(new service.NoTestingDay(noTestingDay));
						});
						deffered.resolve();
					});
				return deffered.promise;
			};
			service.getPositions = function() {
				var deffered = $q.defer();
				service.getAllItems('Position')
					.success(function(data) {
						generalService.data.positions = [];
						_.each(data.d.results, function(position) {
							generalService.data.positions.push(new service.Position(position));
						});
						generalService.arrays.positions = _.filter(generalService.data.positions, function(position) {
							return position.Position !== 'FTE' && position.Position !== 'Applicant' && position.Position !== 'Admin';
						});
						generalService.arrays.allPositions = generalService.data.positions;
						deffered.resolve();
					});
				return deffered.promise;
			};
			service.getProfessors = function() {
				var deffered = $q.defer();
				service.getAllItems('Professor')
					.success(function(data) {
						generalService.data.professors = [];
						_.each(data.d.results, function(professor) {
							generalService.data.professors.push(new service.Professor(professor));
						});
						deffered.resolve();
					});
				return deffered.promise;
			};
			service.getSchedules = function() {
				var deffered = $q.defer();
				service.getAllItems('Schedule')
					.success(function(data) {
						generalService.data.schedules = [];
						_.each(data.d.results, function(schedule) {
							generalService.data.schedules.push(new service.Schedule(schedule));
						});
						deffered.resolve();
					});
				return deffered.promise;
			};
			service.getSentMessages = function() {
				var deffered = $q.defer();
				service.getAllItems('SentMessage')
					.success(function(data) {
						generalService.data.sentMessages = [];
						_.each(data.d.results, function(sentMessage) {
							generalService.data.sentMessages.push(new service.SentMessage(sentMessage));
						});
						deffered.resolve();
					});
				return deffered.promise;
			};
			service.getSemesters = function() {
				var deffered = $q.defer();
				service.getAllItems('Semester')
					.success(function(data) {
						generalService.data.semesters = [];
						data.d.results.reverse();
						_.each(data.d.results, function(semester) {
							generalService.data.semesters.push(new service.Semester(semester));
						});
						service.getCurrentSemester();
						deffered.resolve();
					});
				return deffered.promise;
			};
			service.getShiftGroups = function() {
				var deffered = $q.defer();
				service.getAllItems('ShiftGroup')
					.success(function(data) {
						generalService.data.shiftGroups = [];
						_.each(data.d.results, function(shiftGroup) {
							generalService.data.shiftGroups.push(new service.ShiftGroup(shiftGroup));
						});
						deffered.resolve();
					});
				return deffered.promise;
			};
			service.getShifts = function() {
				var deffered = $q.defer();
				service.getAllItems('Shift')
					.success(function(data) {
						generalService.data.shifts = [];
						_.each(data.d.results, function(shift) {
							generalService.data.shifts.push(new service.Shift(shift));
						});
						deffered.resolve();
					});
				return deffered.promise;
			};
			service.getSubShifts = function() {
				var deffered = $q.defer();
				service.getAllItems('SubShift')
					.success(function(data) {
						generalService.data.subShifts = [];
						data.d.results.reverse();
						_.each(data.d.results, function(subShift) {
							generalService.data.subShifts.push(new service.SubShift(subShift));
						});
						deffered.resolve();
					});
				return deffered.promise;
			};
			service.getTracks = function() {
				var deffered = $q.defer();
				service.getAllItems('Track')
					.success(function(data) {
						generalService.data.tracks = [];
						_.each(data.d.results, function(track) {
							generalService.data.tracks.push(new service.Track(track));
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
				return service.getJson(generalService.properties.sharePointUrl +
					'_api/web/currentUser', true);
			};
			service.addItem = function(listName, item) {
				$http.defaults.headers.post = {
					'Accept': 'application/json;odata=verbose',
					'Content-Type': 'application/json;odata=verbose',
					'X-RequestDigest': generalService.properties.validation,
				};
				return $http.post(generalService.properties.sharePointUrl +
					'_api/lists/getbytitle(\'' + listName + '\')/items', item);
			};
			service.updateItem = function(listName, itemId, item, etag) {
				etag = etag || '*';
				return $http({
					method: 'POST',
					url: generalService.properties.sharePointUrl + '_api/lists/getbytitle(\'' +
						listName + '\')/items(' + itemId + ')',
					data: item,
					headers: {
						'accept': 'application/json;odata=verbose',
						'content-type': 'application/json;odata=verbose',
						'X-RequestDigest': generalService.properties.validation,
						'IF-MATCH': etag,
						'X-HTTP-Method': 'MERGE'
					}
				});
			};
			service.deleteItem = function(listName, itemId) {
				return $http({
					method: 'POST',
					url: generalService.properties.sharePointUrl + '_api/lists/getbytitle(\'' +
						listName + '\')/items(' + itemId + ')',
					headers: {
						'X-HTTP-Method': 'DELETE',
						'IF-MATCH': '*',
						'X-RequestDigest': generalService.properties.validation
					}
				});
			};
			service.getItem = function(listName, itemId) {
				return service.getJson(generalService.properties.sharePointUrl +
					'_api/lists/getbytitle(\'' + listName + '\')/items(\'' + itemId +
					'\')', false);
			};
			service.getAllItems = function(listName) {
				return service.getJson(generalService.properties.sharePointUrl +
					'_api/lists/getbytitle(\'' + listName + '\')/items?$top=999999999', false);
			};
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
					return service.getJson(generalService.properties.sharePointUrl +
						'_api/lists/getbytitle(\'' + this.listName + '\')/items' + this.query,
						cache);
				};
			};
			service.getUserByEmail = function(email) {
				return $http.get(generalService.properties.sharePointUrl +
					'_api/web/siteusers/getbyemail(\'' + email + '\')', {
						headers: {
							'accept': 'application/json;odata=verbose'
						}
					});
			};
			service.refreshSecurityValidation = function() {
				$http.post(generalService.properties.sharePointUrl + '_api/contextinfo')
					.success(function(data) {
						var siteContextinfo = data.d.GetContextWebInformation;
						generalService.properties.validationTimeout = siteContextinfo.FormDigestTimeoutSeconds -
							10;
						generalService.properties.validation = siteContextinfo.FormDigestValue;
						$timeout(function() {
							service.refreshSecurityValidation();
							if (dataInitialized) {
								service.refreshData();
							}
						}, generalService.properties.validationTimeout * 1000);
					})
					.error(function(data) {
						service.errors.push(data);
					});
			};
			// ***********************************************************************
			// DEFINE THE DATA CLASS
			// ***********************************************************************
			service.Data = function() {
				var object = this;
				this.newData = {};
				this.dataList = [];
				this.listName = '';
				this.defaultAlertContent = this.toString();
				this.addAlertContent = this.defaultAlertContent + ' has been added!';
				this.removeAlertContent = this.defaultAlertContent + ' has been removed!';
				this.updateAlertContent = this.defaultAlertContent + ' has been updated!';
				this.updateData = function() {
					return {
						__metadata: this.__metadata
					};
				};
				this.initPublicAttributes = function() {
					this.Created = (this.newData.Created) ? Date.parse(this.newData.Created) : '';
					this.GUID = this.newData.GUID || '';
					this.Id = this.newData.Id || '';
					this.Modified = (this.newData.Modified) ? Date.parse(this.newData.Modified) : '';
					this.__metadata = this.newData.__metadata || {
						type: 'SP.Data.' + this.listName + 'GroupListItem'
					};
				};
				this.add = function(hideAlert) {
					hideAlert = hideAlert || false;
					var deffered = $q.defer();
					this.data = this.updateData();
					if (this.__metadata.etag === undefined) {
						service.addItem(this.listName, this.data)
							.success(function(data) {
								object.initPublicAttributes(data.d);
								object.dataList.push(object);
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
				};
				this.remove = function(hideAlert) {
					hideAlert = hideAlert || false;
					var deffered = $q.defer();
					service.deleteItem(this.listName, this.Id)
						.success(function() {
							object.dataList = _.without(object.dataList, object);
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
				};
				this.update = function(hideAlert) {
					hideAlert = hideAlert || false;
					var deffered = $q.defer();
					this.data = this.updateData();
					service.updateItem(this.listName, this.Id, this.data, '*')
						.success(function() {
							Data.refresh();
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
					return deffered.promise;
				};
				this.refresh = function() {
					var deffered = $q.defer();
					service.getItem(this.listName, this.Id)
						.success(function(data) {
							object.newdata = data.d;
							object.initPublicAttributes();
							deffered.resolve();
						});
					return deffered.promise;
				};
			};
			// ***********************************************************************
			// DEFINE THE AREA CLASS
			// ***********************************************************************
			service.Area = function(data) {
				this.newData = data || {};
				/////////////////////////////////////
				// PRIVATE VARIABLES AND FUNCTIONS //
				/////////////////////////////////////
				/** @privateAtribute {object} an alias for the Area object */
				var object = this;
				////////////////////////
				// PRIVILEGED METHODS //
				////////////////////////
				this.initPublicAttributes = function() {
					this.uber('initPublicAttributes');
					this.Area = this.newData.Area || '';
					this.Description = this.newData.Description || '';
					this.data = this.updateData();
				};
				this.updateData = function() {
					var returnData = this.uber('updateData');
					returnData.Area = this.Area;
					returnData.Description = this.Description;
					return returnData;
				};
				///////////////////////
				// PUBLIC ATTRIBUTES //
				///////////////////////
				this.initPublicAttributes();
				this.listName = 'Area';
				this.dataList = generalService.data.areas;
			};
			service.Area.inherits(service.Data);
			service.Area.method('toString', function() {
				return this.Description + ' Area';
			});
			// ***********************************************************************
			// DEFINE THE AVAILABILITY CLASS
			// ***********************************************************************
			service.Availability = function(data) {
				this.newData = data || {};
				/////////////////////////////////////
				// PRIVATE VARIABLES AND FUNCTIONS //
				/////////////////////////////////////
				/** @privateAtribute {object} an alias for the Availability object */
				var object = this;
				////////////////////////
				// PRIVILEGED METHODS //
				////////////////////////
				this.initPublicAttributes = function() {
					this.uber('initPublicAttributes');
					this.Active = this.newData.Active || this.newData.Current || false;
					this.Current = this.newData.Current || false;
					this.Day = this.newData.Day || '';
					this.EmployeeId = this.newData.EmployeeId || '';
					this.Employee = (this.newData.EmployeeId) ? _.find(generalService.data.employees, function(employee) {
						return employee.Id === object.EmployeeId;
					}) : '';
					this.EndTime = (this.newData.EndTime) ? Date.parse(this.newData.EndTime) : '';
					this.SemesterId = this.newData.SemesterId || '';
					this.Semester = (this.newData.SemesterId) ? _.find(generalService.data.semesters, function(semseter) {
						return semseter.Id === object.SemesterId;
					}) : {};
					this.StartTime = (this.newData.StartTime) ? Date.parse(this.newData.StartTime) : '';
					this.data = this.updateData();
				};
				this.updateData = function() {
					var returnData = this.uber('updateData');
					returnData.Active = this.Current;
					returnData.Current = this.Current;
					returnData.Day = this.Day;
					returnData.EmployeeId = this.EmployeeId;
					returnData.EndTime = this.EndTime;
					returnData.SemesterId = this.SemesterId;
					returnData.StartTime = object.StartTime;
					return returnData;
				};
				///////////////////////
				// PUBLIC ATTRIBUTES //
				///////////////////////
				this.initPublicAttributes();
				this.listName = 'Availability';
				this.dataList = generalService.data.availabilities;
				this.defaultAlertContent = (this.Id === generalService.properties.currentUser.Id) ? 'Your information' : this.toString();
			};
			service.Availability.inherits(service.Data);
			service.Availability.method('toString', function() {
				return this.Employee.toString() + '\'s availability';
			});
			service.Availability.method('deactivate', function() {
				this.Active = false;
				this.Current = false;
				this.update();
			});
			// ***********************************************************************
			// DEFINE THE EMPLOYEE CLASS
			// ***********************************************************************
			service.Employee = function(data) {
				this.newData = data || {};
				/////////////////////////////////////
				// PRIVATE VARIABLES AND FUNCTIONS //
				/////////////////////////////////////
				/** @privateAtribute {object} an alias for the Employee object */
				var object = this;
				////////////////////////
				// PRIVILEGED METHODS //
				////////////////////////
				this.initPublicAttributes = function() {
					this.uber('initPublicAttributes');
					this.Active = this.newData.Active || false;
					this.Admin = this.newData.Admin || false;
					this.AreaId = this.newData.AreaId || '';
					this.Area = (this.newData.AreaId) ? _.find(generalService.data.areas, function(area) {
						return area.Id === object.AreaId;
					}) : {};
					this.EmailAddress = this.newData.EmailAddress || '';
					this.FirstName = this.newData.FirstName || '';
					this.INumber = this.newData.INumber || '';
					this.LastName = this.newData.LastName || '';
					this.PhoneNumber = this.newData.PhoneNumber || '';
					this.Picture = this.newData.Picture || '';
					this.PositionId = this.newData.PositionId || '';
					this.Position = (this.newData.PositionId) ? _.find(generalService.data.positions, function(position) {
						return position.Id === object.PositionId;
					}) : {};
					this.PreferredName = this.newData.PreferredName || '';
					this.Reader = this.newData.Reader || false;
					this.TeamId = this.newData.TeamId || '';
					this.Team = (this.newData.TeamId) ? _.find(generalService.data.teams, function(team) {
						return team.Id === object.TeamId;
					}) : {};
					this.TrackId = this.newData.TrackId || '';
					this.Track = (this.newData.TrackId) ? _.find(generalService.data.tracks, function(track) {
						return track.Id === object.TrackId;
					}) : {};
					this.ExtendedPrivledges = (
						this.Position.Position === 'FTE' ||
						this.Position.Position === 'HR' ||
						this.Admin
					);
					this.Employments = [];
					this.Intent = {};
					this.data = this.updateData();
				};
				this.updateData = function() {
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
					// returnData.TeamId = this.TeamId;
					returnData.TrackId = this.TrackId;
					return returnData;
				};
				///////////////////////
				// PUBLIC ATTRIBUTES //
				///////////////////////
				this.initPublicAttributes();
				this.listName = 'Employee';
				this.dataList = generalService.data.employees;
				this.defaultAlertContent = (this.Id === generalService.properties.currentUser.Id) ? 'Your information' : this.toString();
			};
			service.Employee.inherits(service.Data);
			service.Employee.method('toString', function() {
				return this.Position.Description + ': ' + this.PreferredName + ' ' + this.LastName;
			});
			service.Employee.prototype.activate = function() {
				var employment = new Employment();
				employment.start();
				this.Active = true;
				this.update();
			};
			service.Employee.prototype.deactivate = function() {
				var employment = _.find(generalService.data.employments, function(employment) {
					return employment.EndDate === '' &&
						employment.EmployeeId === this.Id;
				});
				employment.end();
				this.Active = false;
				this.update();
			};
			service.Employee.prototype.add = function() {
				this.parent.update.call(this);
				this.activate();
			};
			service.Employee.prototype.setEmployements = function() {
				this.Employments = _.filter(generalService.data.employments, function(employment) {
					return employment.EmployeeId === employee.Id;
				});
			};
			service.Employee.prototype.setIntent = function() {
				employee.Intent = _.find(service.data.intents, function(intent) {
					return intent.EmployeeId === employee.Id;
				});
			};
			service.Employee.prototype.declareIntent = function() {};
			// ***********************************************************************
			// DEFINE THE EMPLOYMENT CLASS
			// ***********************************************************************
			service.Employment = function(data) {
				this.newData = data || {};
				/////////////////////////////////////
				// PRIVATE VARIABLES AND FUNCTIONS //
				/////////////////////////////////////
				/** @privateAtribute {object} an alias for the Employment object */
				var object = this;
				////////////////////////
				// PRIVILEGED METHODS //
				////////////////////////
				this.initPublicAttributes = function() {
					this.uber('initPublicAttributes');
					this.EmployeeId = this.newData.EmployeeId || '';
					this.Employee = (this.newData.EmployeeId) ? _.find(generalService.data.employees, function(employee) {
						return employee.Id === object.EmployeeId;
					}) : {};
					this.EndDate = (this.newData.EndDate) ? Date.parse(this.newData.EndDate) : '';
					this.StartDate = (this.newData.StartDate) ? Date.parse(this.newData.StartDate) : '';
					this.data = this.updateData();
				};
				this.updateData = function() {
					var returnData = this.uber('updateData');
					returnData.EmployeeId = this.EmployeeId;
					returnData.EndDate = this.EndDate;
					returnData.StartDate = this.StartDate;
					return returnData;
				};
				///////////////////////
				// PUBLIC ATTRIBUTES //
				///////////////////////
				this.initPublicAttributes();
				this.listName = 'Employment';
				this.dataList = generalService.data.employments;
				this.defaultAlertContent = (this.Id === generalService.properties.currentUser.Id) ? 'Your employment' : this.toString();
			};
			service.Employment.inherits(service.Data);
			service.Employment.method('toString', function() {
				return this.Employee.toString() + '\'s employment';
			});
			service.Employment.method('start', function() {
				this.StartDate = new Date();
				this.add();
			});
			service.Employment.method('end', function() {
				this.EndDate = new Date();
				this.update();
			});
			// ***********************************************************************
			// DEFINE THE MESSAGE CLASS
			// ***********************************************************************
			service.Message = function(data) {
				this.newData = data || {};
				/////////////////////////////////////
				// PRIVATE VARIABLES AND FUNCTIONS //
				/////////////////////////////////////
				/** @privateAtribute {object} an alias for the Message object */
				var object = this;
				////////////////////////
				// PRIVILEGED METHODS //
				////////////////////////
				this.initPublicAttributes = function() {
					this.uber('initPublicAttributes');
					this.Active = this.newData.Active || false;
					this.Body = (this.newData.Body) ? Autolinker.link(this.newData.Body, {
						truncate: 10
					}).replace(/\n\r?/g, '<br />') : ((this.newData.Message) ? Autolinker.link(this.newData.Message, {
						truncate: 10
					}).replace(/\n\r?/g, '<br />') : '');
					this.DueDate = (this.newData.DueDate) ? Date.parse(this.newData.DueDate) : '';
					this.ExpDate = (this.newData.ExpDate) ? Date.parse(this.newData.ExpDate) : '';
					this.FromId = this.newData.FromId || false;
					this.From = (this.newData.FromId) ? _.find(generalService.data.employees, function(employee) {
						return employee.Id === object.FromId;
					}) : {};
					this.Manditory = this.newData.Manditory || false;
					this.Policy = this.newData.Policy || false;
					this.SemesterId = this.newData.SemesterId || '';
					this.Semester = (this.newData.SemesterId) ? _.find(generalService.data.semesters, function(semester) {
						return semester.Id === object.SemesterId;
					}) : {};
					this.Subject = this.newData.Subject || '';
					this.tempBody = this.Body;
					this.Recipients = [];
					this.data = this.updateData();
				};
				this.updateData = function() {
					var returnData = this.uber('updateData');
					returnData.Active = this.Active;
					returnData.Body = this.Body;
					returnData.DueDate = this.DueDate;
					returnData.ExpDate = this.ExpDate;
					returnData.FromId = this.FromId;
					returnData.Manditory = this.Manditory;
					returnData.Policy = this.Policy;
					returnData.SemesterId = this.SemesterId;
					returnData.Subject = this.Subject;
					return returnData;
				};
				///////////////////////
				// PUBLIC ATTRIBUTES //
				///////////////////////
				this.initPublicAttributes();
				this.listName = 'Message';
				this.dataList = generalService.data.messages;
				this.defaultAlertContent = (this.Id === generalService.properties.currentUser.Id) ? 'Your employment' : this.toString();
			};
			service.Message.inherits(service.Data);
			service.Message.method('toString', function() {
				return this.Subject + ' message from ' + this.From.toString().split(': ')[1];
			});
			service.Message.method('send', function() {
				this.add();
				var recipientCounter = 0;
				sendMessage(this.Recipients[recipientCounter]);
				/**
				 * This function sends a message to each employee on the Recipients list.
				 *
				 * @param      {Object}    recipient    The Employee object the message is being sent to
				 * @returns    {null}
				 */
				function sendMessage(recipient) {
					var sentMessage = new service.SentMessage();
					sentMessage.EmployeeId = recipient.Id;
					sentMessage.MessageId = this.Id;
					sentMessage.add(true)
						.then(function() {
							if (recipientCounter !== this.Recipients.length) {
								sendMessage(this.Recipients[++recipientCounter]);
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
							}
						});
				}
			});
			service.Message.method('getRecipients', function() {
				var sentMessages = _.filter(service.data.sentMessages, function(sentMessage) {
					return sentMessage.MessageId === this.Id;
				});
				_.each(sentMessages, function(sentMessage) {
					this.Recipients.push(sentMessage.Employee);
				});
			});
			service.Message.method('deactivate', function() {
				this.Active = false;
				this.update();
			});
			// ***********************************************************************
			// DEFINE THE NOTESTINGDAY CLASS
			// ***********************************************************************
			service.NoTestingDay = function(data) {
				this.newData = data || {};
				/////////////////////////////////////
				// PRIVATE VARIABLES AND FUNCTIONS //
				/////////////////////////////////////
				/** @privateAtribute {object} an alias for the NoTestingDay object */
				var object = this;
				////////////////////////
				// PRIVILEGED METHODS //
				////////////////////////
				this.initPublicAttributes = function() {
					this.uber('initPublicAttributes');
					this.Title = this.newData.Title || '';
					this.Date = (this.newData.Date) ? Date.parse(this.newData.Date) : '';
					this.Description = this.newData.Description || '';
					this.SemesterId = this.newData.SemesterId || '';
					this.Semester = (this.newData.SemesterId) ? _.find(generalService.data.semesters, function(semester) {
						return semester.Id === object.SemesterId;
					}) : {};
					this.data = this.updateData();
				};
				this.updateData = function() {
					var returnData = this.uber('updateData');
					returnData.Title = this.Title;
					returnData.Date = this.Date;
					returnData.Description = this.Description;
					returnData.SemesterId = this.SemesterId;
					return returnData;
				};
				///////////////////////
				// PUBLIC ATTRIBUTES //
				///////////////////////
				this.initPublicAttributes();
				this.listName = 'NoTestingDay';
				this.dataList = generalService.data.noTestingDays;
			};
			service.NoTestingDay.inherits(service.Data);
			service.NoTestingDay.method('toString', function() {
				return this.Title;
			});
			// ***********************************************************************
			// DEFINE THE POSITION CLASS
			// ***********************************************************************
			service.Position = function(data) {
				this.newData = data || {};
				/////////////////////////////////////
				// PRIVATE VARIABLES AND FUNCTIONS //
				/////////////////////////////////////
				/** @privateAtribute {object} an alias for the Position object */
				var object = this;
				////////////////////////
				// PRIVILEGED METHODS //
				////////////////////////
				this.initPublicAttributes = function() {
					this.uber('initPublicAttributes');
					this.Position = this.newData.Position || '';
					this.Description = this.newData.Description || '';
					this.Active = true;
					this.Access = true;
					this.data = this.updateData();
				};
				this.updateData = function() {
					var returnData = this.uber('updateData');
					returnData.Position = this.Position;
					returnData.Description = this.Description;
					return returnData;
				};
				///////////////////////
				// PUBLIC ATTRIBUTES //
				///////////////////////
				this.initPublicAttributes();
				this.listName = 'Position';
				this.dataList = generalService.data.positions;
			};
			service.Position.inherits(service.Data);
			service.Position.method('toString', function() {
				return this.Description + ' position';
			});
			service.Position.method('setAccess', function() {
				this.Access = (
					this.Description === generalService.properties.currentUser.Position.Description ||
					this.Description === generalService.properties.defaultPosition ||
					this.Description === 'Proctor' ||
					generalService.properties.currentUser.Position.Description === 'FTE' ||
					generalService.properties.currentUser.Admin
				);
			});
			service.Position.method('setActive', function() {
				this.Active = (
					(this.Description === generalService.properties.defaultPosition &&
						generalService.properties.currentUser.Position.Description === 'FTE') ^
					this.Description === generalService.properties.currentUser.Position.Description
				);
			});
			// ***********************************************************************
			// DEFINE THE PROFESSOR CLASS
			// ***********************************************************************
			service.Professor = function(data) {
				this.newData = data || {};
				/////////////////////////////////////
				// PRIVATE VARIABLES AND FUNCTIONS //
				/////////////////////////////////////
				/** @privateAtribute {object} an alias for the Employee object */
				var object = this;
				////////////////////////
				// PRIVILEGED METHODS //
				////////////////////////
				this.initPublicAttributes = function() {
					this.uber('initPublicAttributes');
					this.EmailAddress = this.newData.EmailAddress || '';
					this.FirstName = this.newData.FirstName || '';
					this.LastName = this.newData.LastName || '';
					this.OfficeAddress = this.newData.OfficeAddress || '';
					this.OfficePhone = this.newData.OfficePhone || '';
					this.OtherPhone = this.newData.OtherPhone || '';
					this.Picture = this.newData.Picture || '';
					this.data = this.updateData();
				};
				this.updateData = function() {
					var returnData = this.uber('updateData');
					returnData.EmailAddress = this.EmailAddress;
					returnData.FirstName = this.FirstName;
					returnData.LastName = this.LastName;
					returnData.OfficeAddress = this.OfficeAddress;
					returnData.OfficePhone = this.OfficePhone;
					returnData.OtherPhone = this.OtherPhone;
					returnData.Picture = this.Picture;
					return returnData;
				};
				///////////////////////
				// PUBLIC ATTRIBUTES //
				///////////////////////
				this.initPublicAttributes();
				this.listName = 'Professor';
				this.dataList = generalService.data.professors;
				this.defaultAlertContent = (this.Id === generalService.properties.currentUser.Id) ? 'Your information' : this.toString();
			};
			service.Professor.inherits(service.Data);
			service.Professor.method('toString', function() {
				return this.listName + ': ' + this.FirstName + ' ' + this.LastName;
			});
			// ***********************************************************************
			// DEFINE THE SCHEDULE CLASS
			// ***********************************************************************
			service.Schedule = function(data) {
				this.newData = data || {};
				/////////////////////////////////////
				// PRIVATE VARIABLES AND FUNCTIONS //
				/////////////////////////////////////
				/** @privateAtribute {object} an alias for the Schedule object */
				var object = this;
				////////////////////////
				// PRIVILEGED METHODS //
				////////////////////////
				this.initPublicAttributes = function() {
					this.uber('initPublicAttributes');
					this.Active = this.newData.Active || false;
					this.EmployeeId = this.newData.EmployeeId || '';
					this.Employee = _.find(generalService.data.employees, function(employee) {
						return employee.Id === object.EmployeeId;
					}) || {};
					this.ShiftId = this.newData.ShiftId || '';
					this.Shift = _.find(generalService.data.shifts, function(shift) {
						return shift.Id === object.ShiftId;
					}) || {};
					this.SemesterId = this.newData.SemesterId || '';
					this.Semester = (this.newData.SemesterId) ? _.find(generalService.data.semesters, function(semester) {
						return semester.Id === object.SemesterId;
					}) : {};
					this.data = this.updateData();
				};
				this.updateData = function() {
					var returnData = this.uber('updateData');
					returnData.Active = this.Active;
					returnData.EmployeeId = this.EmployeeId;
					returnData.ShiftId = this.ShiftId;
					return returnData;
				};
				///////////////////////
				// PUBLIC ATTRIBUTES //
				///////////////////////
				this.initPublicAttributes();
				this.listName = 'Schedule';
				this.dataList = generalService.data.schedules;
				this.defaultAlertContent = (this.Id === generalService.properties.currentUser.Id) ? 'Your schedule' : this.toString();
			};
			service.Schedule.inherits(service.Data);
			service.Schedule.method('toString', function() {
				return this.Employee.toString() + '\'s schedule';
			});
			service.Schedule.method('deactivate', function() {
				this.Active = false;
				this.update();
			});
			// ***********************************************************************
			// DEFINE THE SENTMESSAGE CLASS
			// ***********************************************************************
			service.SentMessage = function(data) {
				this.newData = data || {};
				/////////////////////////////////////
				// PRIVATE VARIABLES AND FUNCTIONS //
				/////////////////////////////////////
				/** @privateAtribute {object} an alias for the SentMessage object */
				var object = this;
				////////////////////////
				// PRIVILEGED METHODS //
				////////////////////////
				this.initPublicAttributes = function() {
					this.uber('initPublicAttributes');
					this.AckDate = (this.newData.AckDate) ? Date.parse(this.newData.AckDate) : '';
					this.EmployeeId = this.newData.EmployeeId || '';
					this.Employee = (this.newData.EmployeeId) ? _.find(generalService.data.employees, function(employee) {
						return employee.Id === object.EmployeeId;
					}) : {};
					this.MessageId = this.newData.MessageId || '';
					this.Message = (this.newData.MessageId) ? _.find(generalService.data.messages, function(message) {
						return message.Id === object.MessageId;
					}) : {};
					this.Read = this.newData.Read || false;
					this.data = this.updateData();
				};
				this.updateData = function() {
					var returnData = this.uber('updateData');
					returnData.AckDate = this.AckDate;
					returnData.EmployeeId = this.EmployeeId;
					returnData.MessageId = this.MessageId;
					returnData.Read = this.Read;
					return returnData;
				};
				///////////////////////
				// PUBLIC ATTRIBUTES //
				///////////////////////
				this.initPublicAttributes();
				this.listName = 'SentMessage';
				this.dataList = generalService.data.sentMessages;
				console.log(this.toString());
				console.log(this);
			};
			service.SentMessage.inherits(service.Data);
			service.SentMessage.method('toString', function() {
				return 'Message from ' + this.Message.From.toString().split(': ')[1] + ' to ' + this.Employee.toString().split(': ')[1] +
					'\nSubject: ' + this.Message.Subject;
			});
			service.SentMessage.method('read', function() {
				this.Read = true;
				this.AckDate = new Date();
				this.update();
			});
			// ***********************************************************************
			// DEFINE THE SEMESTER CLASS
			// ***********************************************************************
			service.Semester = function(data) {
				this.newData = data || {};
				/////////////////////////////////////
				// PRIVATE VARIABLES AND FUNCTIONS //
				/////////////////////////////////////
				/** @privateAtribute {object} an alias for the Semester object */
				var object = this;
				////////////////////////
				// PRIVILEGED METHODS //
				////////////////////////
				this.initPublicAttributes = function() {
					this.uber('initPublicAttributes');
					this.Active = this.newData.Active || false;
					this.FirstDay = (this.newData.FirstDay) ? Date.parse(this.newData.FirstDay) : '';
					this.LastDay = (this.newData.LastDay) ? Date.parse(this.newData.LastDay) : '';
					this.NextSemesterId = this.newData.NextSemesterId || '';
					this.NextSemester = (this.newData.NextSemesterId) ? _.find(generalService.data.semesters, function(semseter) {
						return semseter.Id === object.NextSemesterId;
					}) : {};
					this.ShiftGroupId = this.newData.ShiftGroupId || '';
					this.ShiftGroup = (this.newData.ShiftGroupId) ? _.find(generalService.data.shiftGroups, function(shiftGroup) {
						return shiftGroup.Id === object.ShiftGroupId;
					}) : {};
					this.Year = this.newData.Year || '';
					this.Description = this.newData.Description || '';
					this.data = this.updateData();
				};
				this.updateData = function() {
					var returnData = this.uber('updateData');
					returnData.Active = this.Active;
					returnData.FirstDay = this.FirstDay;
					returnData.LastDay = this.LastDay;
					returnData.NextSemesterId = this.NextSemesterId;
					returnData.ShiftGroupId = this.ShiftGroupId;
					returnData.Year = this.Year;
					return returnData;
				};
				///////////////////////
				// PUBLIC ATTRIBUTES //
				///////////////////////
				this.initPublicAttributes();
				this.listName = 'Semester';
				this.dataList = generalService.data.semesters;
			};
			service.Semester.inherits(service.Data);
			service.Semester.method('toString', function() {
				return this.ShiftGroup.Description + ' ' + this.Year + ' Semester';
			});
			service.Semester.method('deactivate', function() {
				this.Active = false;
				this.update();
			});
			// ***********************************************************************
			// DEFINE THE SHIFT CLASS
			// ***********************************************************************
			service.Shift = function(data) {
				this.newData = data || {};
				/////////////////////////////////////
				// PRIVATE VARIABLES AND FUNCTIONS //
				/////////////////////////////////////
				/** @privateAtribute {object} an alias for the Shift object */
				var object = this;
				////////////////////////
				// PRIVILEGED METHODS //
				////////////////////////
				this.initPublicAttributes = function() {
					this.uber('initPublicAttributes');
					this.Day = this.newData.Day || '';
					this.Days = (this.newData.Day) ? this.newData.Day.replace(/\s/g, '').split('-') : [];
					this.Slots = this.newData.Slots || '';
					this.Active = this.newData.Active || this.newData.Current || false;
					this.Current = this.newData.Current || false;
					this.ShiftGroup = (this.newData.ShiftGroupId) ? _.find(generalService.data.shiftGroups, function(shiftGroup) {
						return shiftGroup.Id === object.ShiftGroupId;
					}) : {};
					this.ShiftGroupId = this.newData.ShiftGroupId || '';
					this.Position = (this.newData.PositionId) ? _.find(generalService.data.positions, function(position) {
						return position.Id === object.PositionId;
					}) : {};
					this.PositionId = this.newData.PositionId || '';
					this.StartTime = (this.newData.StartTime) ? Date.parse(this.newData.StartTime) : '';
					this.EndTime = (this.newData.EndTime) ? Date.parse(this.newData.EndTime) : '';

					this.data = this.updateData();
				};
				this.updateData = function() {
					var returnData = this.uber('updateData');
					returnData.Day = this.Day;
					returnData.Slots = this.Slots;
					returnData.Active = this.Active;
					returnData.Current = this.Current;
					returnData.ShiftGroupId = this.ShiftGroupId;
					returnData.PositionId = this.PositionId;
					returnData.StartTime = this.StartTime;
					returnData.EndTime = object.EndTime;
					return returnData;
				};
				///////////////////////
				// PUBLIC ATTRIBUTES //
				///////////////////////
				this.initPublicAttributes();
				this.listName = 'Shift';
				this.dataList = generalService.data.shifts;
			};
			service.Shift.inherits(service.Data);
			service.Shift.method('toString', function() {
				return this.Day.replace(/\s/g, '').replace(/[-]/g, ', ') + '\n' + this.StartTime.toString('h:mm') + ' - ' + this.EndTime.toString('h:mm');
			});
			service.Shift.method('deactivate', function() {
				this.Active = false;
				this.Current = false;
				this.update();
			});
			// ***********************************************************************
			// DEFINE THE SHIFTGROUP CLASS
			// ***********************************************************************
			service.ShiftGroup = function(data) {
				this.newData = data || {};
				/////////////////////////////////////
				// PRIVATE VARIABLES AND FUNCTIONS //
				/////////////////////////////////////
				/** @privateAtribute {object} an alias for the ShiftGroup object */
				var object = this;
				////////////////////////
				// PRIVILEGED METHODS //
				////////////////////////
				this.initPublicAttributes = function() {
					this.uber('initPublicAttributes');
					this.Description = this.newData.Description || '';
					this.data = this.updateData();
				};
				this.updateData = function() {
					var returnData = this.uber('updateData');
					returnData.Description = this.Description;
					return returnData;
				};
				///////////////////////
				// PUBLIC ATTRIBUTES //
				///////////////////////
				this.initPublicAttributes();
				this.listName = 'ShiftGroup';
				this.dataList = generalService.data.shiftGroups;
			};
			service.ShiftGroup.inherits(service.Data);
			service.ShiftGroup.method('toString', function() {
				return 'The ' + this.Description + ' semester type';
			});
			// ***********************************************************************
			// DEFINE THE SUBSHIFT CLASS
			// ***********************************************************************
			service.SubShift = function(data) {
				this.newData = data || {};
				/////////////////////////////////////
				// PRIVATE VARIABLES AND FUNCTIONS //
				/////////////////////////////////////
				/** @privateAtribute {object} an alias for the SubShift object */
				var object = this;
				////////////////////////
				// PRIVILEGED METHODS //
				////////////////////////
				this.initPublicAttributes = function() {
					this.uber('initPublicAttributes');
					this.Active = (this.newData.Active !== undefined) ? this.newData.Active : true;
					this.Date = (this.newData.Date) ? Date.parse(this.newData.Date) : '';
					this.NewRequestId = this.newData.NewRequestId || '';
					this.NewRequest = (this.newData.NewRequestId) ? _.find(this.dataList, function(newRequest) {
						return newRequest.Id === object.NewRequestId;
					}) : {};
					this.RequesterId = this.newData.RequesterId || '';
					this.Requester = (this.newData.RequesterId) ? _.find(generalService.data.employees, function(employee) {
						return employee.Id === object.RequesterId;
					}) : {};
					this.SemesterId = this.newData.SemesterId || '';
					this.Semester = (this.newData.SemesterId) ? _.find(generalService.data.semesters, function(semester) {
						return semester.Id === object.SemesterId;
					}) : {};
					this.ShiftId = this.newData.ShiftId || '';
					this.Shift = (this.newData.ShiftId) ? _.find(generalService.data.shifts, function(shift) {
						return shift.Id === object.ShiftId;
					}) : {};
					this.SubstituteId = this.newData.SubstituteId || '';
					this.Substitute = (this.newData.SubstituteId) ? _.find(generalService.data.employees, function(employee) {
						return employee.Id === object.SubstituteId;
					}) : {};
					this.data = this.updateData();
				};
				this.updateData = function() {
					var returnData = this.uber('updateData');
					returnData.Active = this.Active;
					returnData.Date = this.Date;
					returnData.NewRequestId = this.NewRequestId;
					returnData.RequesterId = this.RequesterId;
					returnData.SemesterId = this.SemesterId;
					returnData.ShiftId = this.ShiftId;
					returnData.SubstituteId = this.SubstituteId;
					return returnData;
				};
				///////////////////////
				// PUBLIC ATTRIBUTES //
				///////////////////////
				this.initPublicAttributes();
				this.listName = 'SubShift';
				this.dataList = generalService.data.subShifts;
			};
			service.SubShift.inherits(service.Data);
			service.SubShift.method('toString', function() {
				if (this.SubstituteId) {
					return this.Substitute.toString().split(': ')[1] + ' subbing for ' + this.Requester.toString().split(': ')[1] + '\n' + this.Date.toString('dddd') + ' ' + this.Shift.toString().split('\n')[1];
				} else {
					return this.Requester.toString().split(': ')[1] + ' Sub Request\n' + this.Date.toString('dddd') + ' ' + this.Shift.toString().split('\n')[1];
				}
			});
			service.SubShift.method('deactivate', function() {
				this.Active = false;
				this.update();
			});
			service.SubShift.method('newRequest', function() {
				var newRequest = new service.SubShift();
				newRequest.Date = this.Date;
				newRequest.RequesterId = newRequest.RequesterId || generalService.properties.currentUser.Id;
				newRequest.ShiftId = this.ShiftId;
				newRequest.SemesterId = this.SemesterId;
				newRequest.add()
					.then(function() {
						this.NewRequestId = newRequest.Id;
						this.update(true);
					});
			});
			service.SubShift.method('cancel', function() {
				this.deactivate();
			});
			// ***********************************************************************
			// DEFINE THE TRACK CLASS
			// ***********************************************************************
			service.Track = function(data) {
				this.newData = data || {};
				////////////////////////
				// PRIVILEGED METHODS //
				////////////////////////
				this.initPublicAttributes = function() {
					this.uber('initPublicAttributes');
					this.Description = this.newData.Description || '';
					this.data = this.updateData();
				};
				this.updateData = function() {
					var returnData = this.uber('updateData');
					returnData.Description = this.Description;
					return returnData;
				};
				///////////////////////
				// PUBLIC ATTRIBUTES //
				///////////////////////
				this.initPublicAttributes();
				this.listName = 'Track';
				this.dataList = generalService.data.tracks;
			};
			service.Track.inherits(service.Data);
			service.Track.method('toString', function() {
				return 'The ' + this.Description + ' track';
			});


			init();
			return service;

			function init() {
				$http.defaults.headers.post = {
					'Accept': 'application/json;odata=verbose',
					'Content-Type': 'application/json;odata=verbose',
					'X-RequestDigest': generalService.properties.validation,
					'X-HTTP-Method': 'POST',
					'If-Match': '*'
				};
				service.refreshSecurityValidation();
			}

		}
	]);
})();
