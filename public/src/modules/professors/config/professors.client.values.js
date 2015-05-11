/*
* @Author: Jonathan Baird
* @Date:   2015-04-24 09:43:26
* @Last Modified by:   Jonathan Baird
* @Last Modified time: 2015-05-07 14:05:01
*/

'use strict';

var app = angular.module('professors');

app.value('professorInfo', {
	data: {}
});
app.value('facultyTestingInfos', {
	list: []
});
app.value('professors', {
	list: []
});
