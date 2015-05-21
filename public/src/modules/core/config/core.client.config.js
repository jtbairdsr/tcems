/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-01 08:11:28
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-21 12:45:00
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
		template: 'dist/astpls/timepicker/timepicker.tpl.html'
	});
}).config(function($datepickerProvider) {
	angular.extend($datepickerProvider.defaults, {
		dateFormat: 'd - MMM - yyyy',
		startWeek: 0,
		template: 'dist/astpls/datepicker/datepicker.tpl.html',
		placement: 'bottom-center'
	});
}).config(function($selectProvider) {
	angular.extend($selectProvider.defaults, {
		template: 'dist/astpls/select/select.tpl.html',
		placement: 'bottom-center'
	});
}).config(function($typeaheadProvider) {
	angular.extend($typeaheadProvider.defaults, {
		template: 'dist/astpls/typeahead/typeahead.tpl.html',
		placement: 'bottom-center'
	});
});
