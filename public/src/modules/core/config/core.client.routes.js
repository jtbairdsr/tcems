/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-22 21:11:35
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-04 17:36:33
 */

'use strict';

var app = angular.module('core');

app.config(function($stateProvider, $urlRouterProvider) {
	// For any unmatched url, redirect to /TodayView
	$urlRouterProvider.otherwise('/main/schedule/today');

	// Now set up the states
	$stateProvider.state('inactiveEmployee', {
		url: '/inactiveEmployee',
		templateUrl: 'src/modules/core/views/inactive-employee.client.view.html'
	}).state('main', {
		url: '/main',
		abstract: false,
		templateUrl: 'src/modules/core/views/main.client.view.html',
		controller: 'CoreController',
		resolve: {
			scopeSetter: function($q, coreService) {
				var deffered = $q.defer();
				coreService.refresh(true).then(function() {
					deffered.resolve();
				});
				return deffered.promise;
			}
		}
	}).state('main.home', {
		url: '/home',
		templateUrl: 'partials/home.html'
	});
});
