/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-21 19:29:15
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-27 19:06:07
 */

'use strict';

angular.module('fte-tools').controller('ApplicationBuilderController', function(
	$scope, Question, AApp, PApp
) {
	var aps = $scope.data.aps,
		newQuestion = new Question();

	Question.query().then(function() {
		PApp.query();
		AApp.query();
	});

	$scope.data.newQuestion = newQuestion;
	$scope.resumeSet = false;
	$scope.clSet = false;
	$scope.activateAP = function(id) {
		$scope.data.area.active = false;
		$scope.data.arSet = $scope.data.area.ar;
		$scope.data.rrSet = $scope.data.area.rr;
		$scope.data.aclSet = $scope.data.area.acl;
		$scope.data.rclSet = $scope.data.area.rcl;
		_.each(aps, function(ap) {
			if (ap.id === id) {
				$scope.application = ap;
			}
			ap.active = (ap.id === id);
		});
	};
	$scope.switchToArea = function() {
		$scope.data.area.active = true;
		$scope.application = $scope.data.area;
		$scope.data.arSet = false;
		$scope.data.rrSet = false;
		$scope.data.aclSet = false;
		$scope.data.rclSet = false;
		_.each(aps, function(ap) {
			ap.active = false;
		});
	};
	$scope.addQuestion = function() {
		newQuestion.add().then(function() {
			newQuestion = new Question();
			$scope.data.newQuestion = newQuestion;
		});
	};
	$scope.log = function(stuff) {
		console.log(stuff);
	};
	$scope.addToApp = function(id, app) {
		if (app.listName === 'Area') {
			new AApp({
				qId: id,
				aId: app.Id || app.id
			}).add();
		} else {
			new PApp({
				qId: id,
				pId: app.Id || app.id
			}).add();
		}
	};
	$scope.isInApp = function(id, app) {
		if (app.listName === 'Area') {
			return (_.find($scope.aApps, function(a) {
				return a.aId === app.id && a.qId === id;
			}) !== undefined);
		} else {
			return (_.find($scope.pApps, function(a) {
				return a.pId === app.id && a.qId === id;
			}) !== undefined);
		}
	};
});
