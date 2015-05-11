/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-24 09:40:28
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-02 20:59:36
 */

'use strict';

var app = angular.module('semesters');

app.value('currentSemester', {}); // Global value for the current semester
app.value('nextSemester', {}); // Global value for the next semester
app.value('noTestingDays', {
	list: []
});
app.value('semesters', {
	list: [],
	currentSemester: {},
	nextSemester: {}
});
