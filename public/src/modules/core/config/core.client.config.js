/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-01 08:11:28
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-21 18:05:21
 */

'use strict';

angular.module('core').run(function($rootScope) {
	$rootScope.$on('$stateChangeError',
		function(event, toState, toParams, fromState, fromParams, error) {
			console.error('$stateChangeError: ', toState, error);
		});
}).config(function($timepickerProvider) {
	angular.extend($timepickerProvider.defaults, {
		timeFormat: 'h:mm a',
		length: 7,
		placement: 'bottom-center',
	});
}).config(function($datepickerProvider) {
	angular.extend($datepickerProvider.defaults, {
		dateFormat: 'd - MMM - yyyy',
		startWeek: 0,
		placement: 'auto bottom-center'
	});
});
