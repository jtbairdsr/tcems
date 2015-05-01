/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-29 08:38:03
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-04-29 12:22:25
 */

'use strict';

angular.module('core').factory('Week', ['currentSemester', 'Day',
	function(currentSemester, Day) {

		// declare the new Week object
		function Week(title, firstDay) {
			this.days = []; // this is the array of days that make up the week
			this.firstDay = new Date(firstDay) || new Date(Date.sunday()); // this is the date of the first day of the week
			this.title = title || 'Week 1'; // this refers to the number of weeks that are in the array and their proper order
			this.weekNumber = getWeekNumber(this.firstDay); // this is the number of the week in the semester
		}

		/**This method is private and gets the semester week number
		 *
		 * @param      {date}    day    first day of the week to compare
		 *    to the first day of the semester
		 *
		 * @returns    {int}            the week number
		 **/
		function getWeekNumber(day) {
			var milliseconds = Math.floor(currentSemester.FirstDay - day) * -1, // Total number of milliseconds since the first day of the semester
				seconds = (milliseconds / 1000) | 0, // factored into seconds
				minutes = (seconds / 60) | 0, // factored into minutes
				hours = (minutes / 60) | 0, // factored into hours
				days = (hours / 24) | 0, // factored into days
				weeks = (days / 7) | 0; // factored into weeks
			return (weeks + 1); // return the number of weeks plus one to compensate for week 1 vs. week 0
		}

		// override the toString method from parent object
		Week.prototype.toString = function() {
			return this.title;
		};

		// create the createDays method
		Week.prototype.createDays = function() {
			var dayDate = new Date(this.firstDay); // assign the firstDay to something that can be incremented.
			for (var i = 0; i < 7; i++) {
				this.days.push(new Day(dayDate)); //add a new Day object to the days array
				dayDate = dayDate.addDays(1); // increment the day so we can get all of the days of the week
			}
		};

		// create the days of the week
		Week.createDays();

		// return the newly defined Week object
		return Week;
	}
]);
