/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-22 21:11:35
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-01 13:12:23
 */

'use strict';

var app = angular.module('core');

app.config(function($stateProvider, $urlRouterProvider) {
	// For any unmatched url, redirect to /TodayView
	$urlRouterProvider.otherwise('/main/schedule/today');

	// Now set up the states
	$stateProvider
		.state('main.schedule', {
			url: '/schedule',
			templateUrl: 'src/modules/shifts/schedule.html'
		})
		.state('main.schedule.schedule', {
			url: '/schedule',
			controller: 'BasicScheduleCtrl',
			controllerAs: 'ctrl',
			templateUrl: 'src/modules/shifts/schedule/schedule.html'
		})
		.state('main.schedule.availability', {
			url: '/availability',

			// Temporary comment
			// controller: 'BasicScheduleCtrl',
			// controllerAs: 'ctrl',
			templateUrl: 'src/modules/shifts/availability/availability.html'
		})
		.state('main.schedule.mySchedule', {
			url: '/mySchedule',

			// Temporary comment
			// controller: 'BasicScheduleCtrl',
			// controllerAs: 'ctrl',
			templateUrl: 'src/modules/shifts/mySchedule/my-schedule.html'
		})
		.state('main.schedule.subShifts', {
			url: '/subShifts',

			// Temporary comment
			// controller: 'BasicScheduleCtrl',
			// controllerAs: 'ctrl',
			templateUrl: 'src/modules/shifts/subShifts/sub-shifts.html'
		})
		.state('main.schedule.myAvailability', {
			url: '/myAvailability',

			// Temporary comment
			// controller: 'BasicScheduleCtrl',
			// controllerAs: 'ctrl',
			templateUrl: 'src/modules/shifts/myAvailability/my-availability.html'
		})
		.state('main.schedule.availableShifts', {
			url: '/availableShifts',

			// Temporary comment
			// controller: 'BasicScheduleCtrl',
			// controllerAs: 'ctrl',
			templateUrl: 'src/modules/shifts/availableShifts/available-shifts.html'
		})
		.state('main.schedule.today', {
			url: '/today',
			controller: 'BasicScheduleCtrl',
			controllerAs: 'ctrl',
			templateUrl: '	src/modules/shifts/today/today.html'
		});
});
