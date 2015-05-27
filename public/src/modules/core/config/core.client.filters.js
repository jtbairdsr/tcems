/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-22 20:44:43
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-22 08:09:26
 */

'use strict';

angular.module('core').filter('numberFixedLen', function() {
	return function(a, b) {
		return (1e4 + a + '')
			.slice(-b);
	};
}).filter('partition', function() {
	var cache = {},
		filter = function(arr, size) {
			if (!arr) {
				return;
			}
			var newArr = [];
			for (var i = 0; i < arr.length; i += size) {
				newArr.push(arr.slice(i, i + size));
			}
			var arrString = JSON.stringify(arr),
				fromCache = cache[arrString + size];
			if (JSON.stringify(fromCache) === JSON.stringify(newArr)) {
				return fromCache;
			}
			cache[arrString + size] = newArr;
			return newArr;
		};
	return filter;
}).filter('tel', function() {
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
}).filter('unique', function() {
	return function(items, filterOn) {
		if (filterOn === false) {
			return items;
		}
		if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(
				items)) {
			var newItems = [],
				extractValueToCompare = function(item) {
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
}).filter('truncate', function() {
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
}).filter('shiftFilter', function() {
	return function(shifts, date) {
		return _.filter(shifts, function(shift) {
			return (
				shift.Day.indexOf(date.toString('ddd')) >= 0
			);
		});
	};
}).filter('professorFilter', function() {
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
}).filter('notDirector', function() {
	return function(input) {
		var test = /Director/;
		return _.filter(input, function(i) {
			var isDirector = false;
			if (i.Position) {
				isDirector = (!test.test(i.Area.Description) && !test.test(i.Area.desc));
			} else if (i.pos) {
				isDirector = (!test.test(i.a.Description) && !test.test(i.a.desc));
			} else {
				isDirector = (!test.test(i.Description) && !test.test(i.desc));
			}
			return isDirector;
		});
	};
}).filter('notFTE', function() {
	return function(input) {
		var test = /FTE/;
		return _.filter(input, function(i) {
			var isFTE = false;
			if (i.Position) {
				isFTE = (!test.test(i.Position.Description) && !test.test(i.Position.desc));
			} else if (i.pos) {
				isFTE = (!test.test(i.pos.Description) && !test.test(i.pos.desc));
			} else {
				isFTE = (!test.test(i.Description) && !test.test(i.desc));
			}
			return isFTE;
		});
	};
});
