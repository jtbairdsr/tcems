/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-22 21:11:35
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-01 14:24:08
 */

'use strict';

var app = angular.module('core');

app.config(function($stateProvider, $urlRouterProvider) {
	// For any unmatched url, redirect to /TodayView
	$urlRouterProvider.otherwise('/main/schedule/today');

	// Now set up the states
	$stateProvider
		.state('inactiveEmployee', {
			url: '/inactiveEmployee',
			templateUrl: 'src/modules/core/views/inactive-employee.client.view.html'
		})
		.state('main', {
			url: '/main',
			abstract: false,
			templateUrl: 'src/modules/core/views/main.client.view.html',
			controller: 'CoreController',
			resolve: {
				scopeSetter: function($q, User, Position, cfpLoadingBar) {
					var deffered = $q.defer();
					User.GET()
						.then(function(data) {
							Position.query().then(function() {
								deffered.resolve(data);
								cfpLoadingBar.complete();
							});
						});
					return deffered.promise;
				}
			}
		})
		.state('main.home', {
			url: '/home',
			templateUrl: 'partials/home.html'
		});
});
