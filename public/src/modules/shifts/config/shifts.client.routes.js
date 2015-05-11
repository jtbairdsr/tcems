/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-22 21:11:35
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-04 14:51:28
 */

'use strict';

var app = angular.module('core');

app.config(function($stateProvider) {
	$stateProvider.state('main.schedule', {
		url: '/schedule',
		templateUrl: 'src/modules/shifts/views/schedule-tabs.client.view.html',
		controller: 'ScheduleController',
		controllerAs: 'ctrl',
		resolve: {
			// jshint unused:false
			requiredData: function($q, scheduleService, cfpLoadingBar, scopeSetter) {
				var deffered = $q.defer();

				scheduleService.refresh(true).then(function(data) {
					deffered.resolve(data);
					cfpLoadingBar.complete();
				});

				return deffered.promise;
			}
		}

		// jshint unused:true
	}).state('main.schedule.schedule', {
		url: '/schedule',
		templateUrl: 'src/modules/shifts/views/schedule.client.view.html'
	}).state('main.schedule.availability', {
		url: '/availability',
		templateUrl: 'src/modules/shifts/views/availability.client.view.html'
	}).state('main.schedule.mySchedule', {
		url: '/mySchedule',
		templateUrl: 'src/modules/shifts/views/my-schedule.client.view.html'
	}).state('main.schedule.subShifts', {
		url: '/subShifts',
		templateUrl: 'src/modules/shifts/views/sub-shifts.client.view.html'
	}).state('main.schedule.myAvailability', {
		url: '/myAvailability',
		templateUrl: 'src/modules/shifts/views/my-availability.client.view.html'
	}).state('main.schedule.availableShifts', {
		url: '/availableShifts',
		templateUrl: 'src/modules/shifts/views/available-shifts.client.view.html'
	}).state('main.schedule.today', {
		url: '/today',
		templateUrl: 'src/modules/shifts/views/today.client.view.html'
	});
});
