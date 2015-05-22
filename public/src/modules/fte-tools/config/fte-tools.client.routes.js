/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-21 18:57:43
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-21 19:32:13
 */

'use strict';

angular.module('fte-tools').config(function($stateProvider) {
	$stateProvider.state('main.hr.fte-tools', {
		url: '/fte-tools',

		// controller: 'HRController',
		templateUrl: 'src/modules/fte-tools/views/fte-tools.client.view.html'
	}).state('main.hr.fte-tools.application-builder', {
		url: '/application-builder',
		controller: 'ApplicationBuilderController',
		templateUrl: 'src/modules/fte-tools/views/application-builder.client.view.html'
	});
});
