/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-04 17:42:47
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-04 17:56:11
 */

'use strict';

angular.module('utilities').config(function($stateProvider) {
	$stateProvider.state('main.utilities', {
		url: '/utilities',
		templateUrl: 'src/modules/utilities/views/utilities.client.view.html',
		controller: 'UtilitiesController',
		controllerAs: 'ctrl',
		resolve: {
			requiredData: function($q, cfpLoadingBar, scopeSetter, employeeService, scheduleService) {
				var deffered = $q.defer();
				$q.all([employeeService.refresh(), scheduleService.refresh()]).then(function() {
					cfpLoadingBar.complete();
					deffered.resolve();
				});
				return deffered.promise;
			}
		}
	});
});
