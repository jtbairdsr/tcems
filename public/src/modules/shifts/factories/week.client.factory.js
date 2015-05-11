/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-29 08:38:03
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-02 10:10:19
 */

'use strict';

angular.module('shifts').factory('Week', function(currentSemester, Day, weeks) {

	// Declare the new Week object
	function Week(title, firstDay) {
		this.firstDay = new Date(firstDay) || new Date(Date.sunday()); // Date of the first day of the week
		this.days = Day.createDays(this.firstDay); // Array of days that make up the week
		this.title = title || 'Week 1'; // Number of weeks in the array and their proper order
		this.weekNumber = getWeekNumber(this.firstDay); // Number of the week in the semester
	}

	/**This method is private and gets the semester week number
	 *
	 * @param      {date}    day    first day of the week to compare
	 *    to the first day of the semester
	 *
	 * @returns    {int}            the week number
	 **/
	function getWeekNumber(day) {
		var milliseconds = Math.floor(currentSemester.FirstDay - day) * -1, // Milliseconds since the semester day one.
			seconds = (milliseconds / 1000) | 0, // Factored into seconds
			minutes = (seconds / 60) | 0, // Factored into minutes
			hours = (minutes / 60) | 0, // Factored into hours
			days = (hours / 24) | 0, // Factored into days
			weeks = (days / 7) | 0; // Factored into weeks
		return (weeks + 1); // Return the number of weeks plus one to compensate for week 1 vs. week 0
	}

	/**************************************************************************
	 *                             INSTANCE METHODS                           *
	 **************************************************************************/

	// Override the toString method from parent object
	Week.prototype.toString = function() {
		return this.title;
	};

	/**************************************************************************
	 *                              CLASS METHODS                             *
	 **************************************************************************/

	// Create the createWeeks method
	Week.createWeeks = function(numWeeks) {
		numWeeks = numWeeks || 3;
		weeks.list.splice(0, weeks.list.length);
		var sunDate = Date.sunday(),
			weekTitle = '';
		for (var i = 0; i < numWeeks; i++) {
			weekTitle = 'Week ' + (i + 1);
			weeks.list.push(new Week(weekTitle, sunDate));
			sunDate.addWeeks(1);
		}
	};

	// Return the newly defined Week object
	return Week;
});
