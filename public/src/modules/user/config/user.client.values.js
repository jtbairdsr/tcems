/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-24 09:57:54
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-01 11:11:58
 */

'use strict';

var app = angular.module('user');

app.value('currentUser', {data: {}}); // Global value for the current user
app.value('loadEmployeeData', false); // Belongs to the service or the controller that loads data
