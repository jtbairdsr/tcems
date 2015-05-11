/*
 * @Author: jonathan
 * @Date:   2015-03-26 11:42:45
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-04-29 15:37:49
 */
(function() {
	'use strict';
	angular.module('core')
		.service('dateService', [function() {
			this.isTimeBefore = function(date1, date2) {
				var hr1 = date1.getHours(),
					hr2 = date2.getHours(),
					min1 = date1.getMinutes(),
					min2 = date2.getMinutes(),
					returnValue = false;
				if ((hr1 < hr2) || (hr1 === hr2 && min1 < min2)) {
					returnValue = true;
				}
				return returnValue;
			};
			/**This method is private and gets the semester week number
			 *
			 * @param      {date}    day    first day of the week to compare
			 *    to the first day of the semester
			 *
			 * @returns    {int}            the week number
			 **/
			this.timeBetween = function(startDate, endDate, unit) {
				var returnData = {
					ms: Math.floor(startDate - endDate) * -1,
					sec: ((Math.floor(startDate - endDate) * -1) / 1000) | 0,
					min: ((((Math.floor(startDate - endDate) * -1) / 1000) | 0) / 60) | 0,
					hr: ((((((Math.floor(startDate - endDate) * -1) / 1000) | 0) / 60) | 0) / 60) | 0,
					day: ((((((((Math.floor(startDate - endDate) * -1) / 1000) | 0) / 60) | 0) / 60) | 0) / 24) | 0,
					wk: ((((((((((Math.floor(startDate - endDate) * -1) / 1000) | 0) / 60) | 0) / 60) | 0) / 24) | 0) / 7) | 0
				};
				return (returnData[unit] + 1);
			};
			return this;
		}]);
})();
