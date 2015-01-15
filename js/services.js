/*
 * @Author: Jonathan Baird
 * @Date:   2014-10-28 15:04:12
 * @Last Modified 2014-12-02
 * @Last Modified time: 2015-01-15 09:40:53
 */
/* global angular, _ */

(function() {
	var app = angular.module('Services', []);

	app.service('dataService', ['$http', '$timeout', '$alert',
		function($http, $timeout, $alert) {
			var service = this,
				// create the init function... similar to a class constructor
				init = function() {
					$http.defaults.headers.post = {
						'Accept': 'application/json;odata=verbose',
						'Content-Type': 'application/json;odata=verbose',
						'X-RequestDigest': service.properties.validation,
						'X-HTTP-Method': 'POST',
						'If-Match': '*'
					};
					service.refreshSecurityValidation();
					// service.getCurrentUser();
				};
			/////////////////
			// init $scope //
			/////////////////
			service.properties = {
				sharePointUrl: 'https://inet.byui.edu/sites/TestingServices/',
				localUrl: 'http://testcenterems.byui.edu',
				validationTimeout: 0,
				validation: '',
				currentUser: {},
				semester: {},
				nextSemester: {
					Id: 3,
					Description: 'Winter'
				},
				extendedPrivledges: false
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
			}
			service.arrays = {
				testEmployees: [],
				positions: [],
				shiftGroups: [],
				shifts: [],
				employees: [],
				directoryEmployees: [],
				weeks: [],
				days: [],
				subShifts: [],
				areas: [],
				tracks: [],
				professors: [],
				availabilityDays: [],
				allAvailabilityDays: []
			};
			service.errors = [];


			//////////////////
			// init methods //
			//////////////////
			service.getAllEmployees = function() {
				new service.getItems('Employee')
					.top(999999999)
					.select(['Id', 'Picture', 'FirstName', 'PreferredName', 'LastName', 'PhoneNumber', 'EmailAddress', 'INumber', 'Position/Position', 'Position/Id', 'Reader', 'Area/Area', 'Area/Id', 'Team/Id', 'Track/Description', 'Track/Id', 'Active'])
					.expand(['Position', 'Area', 'Team', 'Track'])
					.execute(false)
					.success(function(data) {
						_.each(data.d.results, function(employee) {

						});
						service.data.employees = data.d.results;
					});
			};
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
			}
			service.getJson = function(url, cache) {
				cache = cache || false;
				return $http.get(url, {
					headers: {
						'accept': 'application/json;odata=verbose',
						'cache': cache
					}
				});
			};
			service.getNoTestingDays = function(semester) {
				return new service.getItems('NoTestingDay')
					.select(['Title', 'Date', 'Description', 'Semester/Id', 'Id'])
					.expand(['Semester'])
					.where(['Semester/Id', 'eq', semester.Id])
					.execute();
			};
			service.getSemester = function(semesterId) {
				if (semesterId) {
					return new service.getItems('Semester')
						.select(['ShiftGroup/Id', 'ShiftGroup/Description', 'Year', 'FirstDay', 'LastDay', 'Active', 'NextSemester/Id', 'Id'])
						.expand(['ShiftGroup', 'NextSemester'])
						.where(['Id', 'eq', semesterId])
						.execute();
				} else {
					return new service.getItems('Semester')
						.select(['ShiftGroup/Id', 'ShiftGroup/Description', 'Year', 'FirstDay', 'LastDay', 'Active', 'NextSemester/Id', 'Id'])
						.expand(['ShiftGroup', 'NextSemester'])
						.where(['Active', 'eq', 1])
						.execute();
				}
			};

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
						}, service.properties.validationTimeout * 1000);
					})
					.error(function(data) {
						service.errors.push(data);
					});
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

			// Create the addToGroup method
			service.addToGroup = function(groupId, employee) {
				$http.defaults.headers.post = {
					'Accept': 'application/json;odata=verbose',
					'Content-Type': 'application/json;odata=verbose',
					// 'Content-Length': 50,
					'X-RequestDigest': service.properties.validation,
				};
				return $http.post(service.properties.sharePointUrl +
					'_api/web/sitegroups(' + groupId + ')/users', {
						'__metadata': {
							type: 'SP.User'
						},
						LoginName: 'i:0#.w|' + employee
					});
			}; // end of addToGroup method

			// Create the getUserByEmail method
			service.getUserByEmail = function(email) {
				return $http.get(service.properties.sharePointUrl +
					'_api/web/siteusers/getbyemail(\'' + email + '\')', {
						headers: {
							'accept': 'application/json;odata=verbose'
						}
					});
			}; //end of getUserByEmail method

			// Create getClass method
			service.getClass = function(object) {
				return Object.prototype.toString.call(object)
					.slice(8, -1);
			}; //end of getClass method


			// init the service
			init();
			return service;

			/////////////
			// Objects //
			/////////////

			function Employee(data) {
				var employee = this;
				employee.data = data;

				/////////////
				// Methods //
				/////////////
				employee.update = function() {
					service.updateItem('Employee', employee.data.Id, employee.data, employee.data.__metadata.etag)
						.success(function(data) {
							employee.data = data;
							expandData();
							var content = '';
							if (employee.data.Id === service.properties.currentUser.employeeInfo.Id) {
								content = 'Your information has been updated';
							} else {
								content = employee.data.PreferredName + ' ' + employee.data.LastName + '\'s information has been updated!';
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
						})
				};
				employee.refresh = function() {
					service.getItem('Employee', employee.data.Id)
						.success(function(data) {
							employee.data = data;
							expandData();
						})
				};
				employee.create = function() {};
				employee.activate = function() {};
				employee.deactivate = function() {};
				employee.declareIntent = function() {};
				employee.delete = function() {};

				function expandData() {
					setArea();
					setPosition();
					// setTeam();
					setTrack();
				}

				function setArea() {
					employee.data.Area = _.find(service.data.areas, function(area) {
						return area.Id === employee.data.Area.Id;
					});
				}

				function setPosition() {
					employee.data.Position = _.find(service.data.positions, function(position) {
						return position.Id === employee.data.Position.Id;
					});
				}

				function setTeam() {
					employee.data.Team = _.find(service.data.teams, function(team) {
						return team.Id === employee.data.Team.Id;
					});
				}

				function setTrack() {
					employee.data.Track = _.find(service.data.tracks, function(track) {
						return track.Id === employee.data.Track.Id;
					});
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
