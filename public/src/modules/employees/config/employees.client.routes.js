/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-01 15:16:17
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-01 15:40:26
 */

'use strict';

angular.module('employees').config(function($stateProvider) {
	$stateProvider.state('main.directory', {
		url: '/directory',
		templateUrl: 'src/modules/employees/views/employees.client.view.html',
		controller: 'EmployeeController',
		controllerAs: 'ctrl',
		abstract: true
	}).state('main.directory.listView', {
		url: '/listView',
		templateUrl: 'src/modules/employees/views/employees-list.client.view.html'
	}).state('main.directory.gridView', {
		url: '/gridView',
		templateUrl: 'src/modules/employees/views/employees-grid.client.view.html'
	});
});
