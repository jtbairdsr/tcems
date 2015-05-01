/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-24 09:40:28
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-04-24 09:50:36
 */

'use strict';

var app = angular.module('shifts');

app.value('schedules', {
	list: []
});
app.value('shiftGroups', {
	list: []
});
app.value('shifts', {
	list: []
});
app.value('subShifts', {
	list: []
});