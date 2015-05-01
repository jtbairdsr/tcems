/*
 * @Author: Jonathan Baird
 * @Date:   2014-10-28 15:04:12
 * @Last Modified 2014-12-02
 * @Last Modified time: 2015-05-01 10:01:21
 */

'use strict';

/**
 * Underscore Module
 *
 * This module is used to make the underscorejs library injectable.
 *
 */
var underscore = angular.module('underscore', []);
underscore.factory('$_', function() {
	return window._; // Assumes underscore has been loaded on the page
});

/**
 * App Module
 *
 * This module runs the schedule portion of the app.  All controllers that
 * deal with Scheduling, Availability, and Shifts will be contained in this
 * module
 *
 */
var app = angular.module('core');
app.config(function($stateProvider, $urlRouterProvider) {
	// For any unmatched url, redirect to /TodayView
	$urlRouterProvider.otherwise('/main/schedule/today');

	// Now set up the states
	$stateProvider

	// /////////////// //
	// Directory State //
	// /////////////// //
	.state('main.directory', {
			url: '/directory',
			templateUrl: 'partials/directory/directory.html',

			// Temporary comment
			// controller: 'DirectoryCtrl',
			// controllerAs: 'ctrl',
			abstract: true
		})
		.state('main.directory.listView', {
			url: '/listView',
			templateUrl: 'partials/directory/list-view.html'
		})
		.state('main.directory.gridView', {
			url: '/gridView',
			templateUrl: 'partials/directory/grid-view.html'
		})

	// //////////////////// //
	// Faculty Portal State //
	// //////////////////// //
	.state('main.faculty', {
			url: '/faculty',
			abstract: true,

			// Temporary comment
			// controllerAs: 'ctrl',
			// controller: 'FacultyCtrl',
			templateUrl: 'partials/faculty/faculty.html'
		})
		.state('main.faculty.info', {
			url: '/info',
			templateUrl: 'partials/faculty/info.html'
		})

	// /////////////// //
	// Utilities State //
	// /////////////// //
	.state('main.utilities', {
		url: '/utilities',

		// Temporary comment
		// controller: 'UtilitiesCtrl',
		templateUrl: 'partials/utilities/utilities.html'
	});
});
