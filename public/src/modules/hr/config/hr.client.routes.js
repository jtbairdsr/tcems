/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-21 17:48:40
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-21 19:02:48
 */

'use strict';

angular.module('hr').config(function($stateProvider) {
	$stateProvider.state('main.hr', {
		url: '/hr',

		// controller: 'HRController',
		templateUrl: 'src/modules/hr/views/hr.client.view.html'
	}).state('main.hr.applications', {
		url: '/applications',

		// controller: 'HRController',
		templateUrl: 'src/modules/hr/views/applications.client.view.html'
	}).state('main.hr.preformance-review', {
		url: '/preformance-review',

		// controller: 'HRController',
		template: '<div></div>'
	});
});
