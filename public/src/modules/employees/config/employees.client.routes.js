/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-01 15:16:17
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-04 15:38:01
 */

'use strict';

angular.module('employees').config(function($stateProvider) {
	$stateProvider.state('main.directory', {
		url: '/directory',
		templateUrl: 'src/modules/employees/views/employees.client.view.html',
		controller: 'EmployeeController',
		controllerAs: 'ctrl',
		abstract: true,
		resolve: {
			// jshint unused:false
			requiredData: function($q, employeeService, cfpLoadingBar, scopeSetter) {
				var deffered = $q.defer();
				employeeService.refresh().then(function(data) {
					deffered.resolve(data);
					cfpLoadingBar.complete();
				});
				return deffered.promise;
			}
		}

		// jshint unused:true
	}).state('main.directory.gridView', {
		url: '/gridView',
		templateUrl: 'src/modules/employees/views/employees-grid.client.view.html'
	});
});
