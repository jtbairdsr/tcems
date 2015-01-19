/*
 * @Author: Jonathan Baird
 * @Date:   2014-10-28 15:04:12
 * @Last Modified 2014-12-02
 * @Last Modified time: 2015-01-18 10:45:18
 */
/* global angular, _ */

(function() {
	var app = angular.module('Services');

	app.service('generalService', function() {
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
		console.log(service.properties);
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
		service.getClass = function(object) {
			return Object.prototype.toString.call(object)
				.slice(8, -1);
		};

		return service;
	});
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
