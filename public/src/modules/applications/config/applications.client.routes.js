/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-20 18:46:49
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-20 18:53:06
 */

'use strict';

angular.module('applications').config(function($stateProvider) {
	$stateProvider.state('main.application', {
		url: '/application',
		controller: 'ApplicationsController',
		templateUrl: 'src/modules/applications/views/application.client.view.html'
	});
});

