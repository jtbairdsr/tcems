/*
 * @Author: Jonathan Baird
 * @Date:   2014-10-28 15:04:12
 * @Last Modified 2014-12-02
 * @Last Modified time: 2015-02-02 10:59:48
 */
(function() {

	/**
	 * App Module
	 *
	 * This module runs the schedule portion of the app.  All controllers that deal with Scheduling, Availability, and Shifts will be contained in this module
	 */
	var app = angular.module('App', [
		// ootb Angular Modules
		'ngRoute',
		'ngAnimate',
		'ngSanitize',

		// 3rd party libraries
		'cfp.loadingBar',
		'dcbImgFallback',
		'mgcrea.ngStrap',
		'ui.router',
		'ui.select',
		'ui.utils',


		// 'mgcrea.ngStrap.collapse',
		// 'mgcrea.ngStrap.helpers.dateParser',
		// 'mgcrea.ngStrap.helpers.dimensions',
		// 'mgcrea.ngStrap.tooltip',
		// 'mgcrea.ngStrap.button',

		// Our custom libraries
		//'Faculty',
		//'Services',
		//'Schedule',
		//'Directory',
		//'Utilities'
	]);
	app.run(function($rootScope, generalService) {
		$rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
			// $dialogs.error("Something went wrong!", error);
			console.error("$stateChangeError: ", toState, error);
		});
	});
	app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
		// For any unmatched url, redirect to /TodayView
		$urlRouterProvider.otherwise('/main/schedule/today');
		// Now set up the states
		$stateProvider
		/////////////////////////////
		// Inactive Employee State //
		/////////////////////////////
			.state('inactiveEmployee', {
				url: '/inactiveEmployee',
				templateUrl: 'partials/inactiveEmployee.html',
			})
			/////////////////////////
			// Main Abstract State //
			/////////////////////////
			.state('main', {
				url: '/main',
				// abstract: true,
				templateUrl: 'partials/main.html',
				controller: function($scope, scopeSetter, generalService) {
					$scope.data = generalService.data;
					$scope.arrays = generalService.arrays;
					$scope.properties = generalService.properties;
				},
				resolve: {
					scopeSetter: function($q, dataService) {
						var deffered = $q.defer();
						dataService.initializeData()
							.then(function() {
								deffered.resolve();
							});
						return deffered.promise;
					}
				}
			})
			////////////////
			// Home State //
			////////////////
			.state('main.home', {
				url: '/home',
				templateUrl: 'partials/home.html',
			})
			////////////////////
			// Schedule State //
			////////////////////
			.state('main.schedule', {
				url: '/schedule',
				templateUrl: 'partials/schedule/schedule.html',
				abstract: true,
			})
			.state('main.schedule.schedule', {
				url: '/schedule',
				templateUrl: 'partials/schedule/schedule/schedule.html',
				controller: 'BasicScheduleCtrl',
				controllerAs: 'ctrl'
			})
			.state('main.schedule.availability', {
				url: '/availability',
				templateUrl: 'partials/schedule/availability/availability.html',
				controller: 'BasicScheduleCtrl',
				controllerAs: 'ctrl'
			})
			.state('main.schedule.mySchedule', {
				url: '/mySchedule',
				templateUrl: 'partials/schedule/mySchedule/my-schedule.html',
				controller: 'BasicScheduleCtrl',
				controllerAs: 'ctrl'
			})
			.state('main.schedule.subShifts', {
				url: '/subShifts',
				templateUrl: 'partials/schedule/subShifts/sub-shifts.html',
				controller: 'BasicScheduleCtrl',
				controllerAs: 'ctrl'
			})
			.state('main.schedule.myAvailability', {
				url: '/myAvailability',
				templateUrl: 'partials/schedule/myAvailability/my-availability.html',
				controller: 'BasicScheduleCtrl',
				controllerAs: 'ctrl'
			})
			.state('main.schedule.availableShifts', {
				url: '/availableShifts',
				templateUrl: 'partials/schedule/availableShifts/available-shifts.html',
				controller: 'BasicScheduleCtrl',
				controllerAs: 'ctrl'
			})
			.state('main.schedule.today', {
				url: '/today',
				templateUrl: 'partials/schedule/today/today.html',
				controller: 'BasicScheduleCtrl',
				controllerAs: 'ctrl'
			})
			/////////////////////
			// Directory State //
			/////////////////////
			.state('main.directory', {
				url: '/directory',
				templateUrl: 'partials/directory/directory.html',
				controller: 'DirectoryCtrl',
				controllerAs: 'ctrl',
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
			//////////////////////////
			// Faculty Portal State //
			//////////////////////////
			.state('main.faculty', {
				url: '/faculty',
				abstract: true,
				templateUrl: 'partials/faculty/faculty.html',
				controllerAs: 'ctrl',
				controller: 'FacultyCtrl'
			})
			.state('main.faculty.info', {
				url: '/info',
				templateUrl: 'partials/faculty/info.html',
			})
			///////////////////
			// Utilities State //
			///////////////////
			.state('main.utilities', {
				url: '/utilities',
				templateUrl: 'partials/utilities/utilities.html',
				controller: 'UtilitiesCtrl'
			});
		// TODO: add additional states

		// set html5Mode to true to allow faster partial loading and clean urls.
		// $locationProvider.html5Mode(true);
	});
	app.config(function($timepickerProvider) {
		angular.extend($timepickerProvider.defaults, {
			timeFormat: 'h:mm a',
			length: 7,
			placement: 'bottom-center',
		});
	});
	app.config(function($datepickerProvider) {
		angular.extend($datepickerProvider.defaults, {
			dateFormat: 'd - MMM - yyyy',
			startWeek: 0
		});
	});

	/**
	 * Schedule Module
	 *
	 * This module runs the schedule portion of the app.  All controllers that deal with Scheduling, Availability, and Shifts will be contained in this module
	 */
	/* angular.module('Schedule', [
		// Official Angular modules
		'ngAnimate',
		'ngSanitize',

		// 3rd party modules
		'mgcrea.ngStrap',
		// 'mgcrea.ngStrap.helpers.dateParser',
		// 'ui.bootstrap',

		// Our custom libraries
		'Services'
	]); */
	/**
	 * Directory Module
	 *
	 * This is the module that runs the directory portion of the app.
	 */
	/* angular.module('Directory', [
		// Official Angular modules
		'ngAnimate',
		'ngSanitize',

		// 3rd party modules
		'mgcrea.ngStrap',
		// 'mgcrea.ngStrap.helpers.dateParser',

		// Our custom libraries
		'Services'
	]); */
	/**
	 * Utilities Module
	 *
	 * This is the module that will handle all of the controllers for admin utilities;
	 */
	/* angular.module('Utilities', [
		// ootb Angular Modules
		'ngRoute',
		'ngAnimate',
		'ngSanitize',

		// 3rd party libraries
		'ui.router',
		'mgcrea.ngStrap',
		// 'mgcrea.ngStrap.helpers.dateParser',

		// Our custom libraries
		'Services',
		'Schedule'
	]); */
	/* angular.module('Services', []); */

})();
