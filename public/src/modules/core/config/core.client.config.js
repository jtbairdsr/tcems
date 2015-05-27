/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-01 08:11:28
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-22 08:21:40
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
		placement: 'bottom-center'
	});
}).config(function($datepickerProvider) {
	angular.extend($datepickerProvider.defaults, {
		dateFormat: 'd - MMM - yyyy',
		startWeek: 0,
		placement: 'auto bottom-center'
	});
}).config(function($selectProvider) {
	angular.extend($selectProvider.defaults, {
		placement: 'auto bottom-center'
	});
}).config(function($typeaheadProvider) {
	angular.extend($typeaheadProvider.defaults, {
		placement: 'auto bottom-center'
	});
}).config(function($modalProvider) {
	angular.extend($modalProvider.defaults, {
		animation: 'am-fade-and-scale'
	});
});
