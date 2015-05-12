/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-07 13:45:15
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-11 17:49:12
 */

'use strict';

angular.module('professors').config(function($stateProvider) {
	$stateProvider.state('main.faculty', {
		url: '/faculty',
		abstract: true,
		controllerAs: 'ctrl',
		controller: 'ProfessorController',
		templateUrl: 'src/modules/professors/views/professor.client.view.html',
		resolve: {
			// jshint unused:false
			requiredData: function($q, professorService, cfpLoadingBar, scopeSetter) {
				var deffered = $q.defer();

				cfpLoadingBar.start();
				professorService.refresh().then(function() {
					deffered.resolve();
					cfpLoadingBar.complete();
				});
				return deffered.promise;
			}
		}

		// jshint unused:true
	}).state('main.faculty.info', {
		url: '/info',
		templateUrl: 'src/modules/professors/views/professor-info.client.view.html'
	});
});
