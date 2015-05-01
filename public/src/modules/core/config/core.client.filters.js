/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-22 20:44:43
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-04-29 08:17:02
 */

 /*globals _ */

'use strict';

var app = angular.module('core');

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
			end = '...';

		if (text.length <= length) {
			return text;
		} else {
			return String(text).substring(0, length) + end;
		}

	};
});
app.filter('shiftFilter', function() {
	return function(shifts, date) {
		return _.filter(shifts, function(shift) {
			return (
				shift.Day.indexOf(date.toString('ddd')) >= 0
			);
		});
	};
});
app.filter('employeeFilter', ['generalService',
	function(generalService) {
		var DATA = generalService.data,
			PROPERTIES = generalService.properties;
		var positionFTE = _.find(DATA.positions, function(position) {
			return position.Description === 'FTE';
		});
		return function(employees, params) {
			params.inactive = params.inactive || false;
			params.area = (PROPERTIES.currentUser.Area.Description === 'Director') ? false : params.area || false;
			params.position = params.position || false;
			params.retired = params.retired || false;
			if (params.retired) {
				employees = _.filter(employees, function(employee) {
					return employee.Retired;
				});
			} else {
				employees = _.filter(employees, function(employee) {
					return !employee.Retired;
				});
				if (params.inactive) {
					employees = _.filter(employees, function(employee) {
						return employee.Active;
					});
				}
			}
			if (params.area) {
				employees = _.filter(employees, function(employee) {
					return employee.Area.Id === PROPERTIES.currentUser.Area.Id;
				});
			}
			if (params.position) {
				employees = _.filter(employees, function(employee) {
					return employee.Position.Id !== positionFTE.Id;
				});
			}
			return employees;
		};
	}
]);
app.filter('professorFilter', function() {
	return function(professors, parameter) {
		parameter = parameter || '^.';
		parameter = new RegExp(parameter, 'i');
		professors = _.filter(professors, function(professor) {
			return (
				parameter.test(professor.Professor.FirstName) ||
				parameter.test(professor.Professor.LastName)
			);
		});
		return professors;
	};
});
