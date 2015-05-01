/*
 * @Author: Jonathan Baird
 * @Date:   2015-02-02 10:54:46
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-01 09:05:30
 */

 /* global _ */

(function() {
	'use strict';
	var faculty = angular.module('professors');

	faculty.controller('FacultyCtrl', ['$scope', '$alert', '$q', 'dataService', 'generalService',
		function($scope, $alert, $q, dataService, generalService) {
			$scope.properties.currentApp = $scope.properties.currentUser.FirstName + ' ' + $scope.properties.currentUser.LastName;
			var PROPERTIES = generalService.properties,
				DATA = generalService.data,
				CLASSES = dataService.classes;
			if (PROPERTIES.currentUser.INumber) {
				PROPERTIES.ProfessorInfo = _.find(DATA.professors, function(professor) {
					return professor.EmailAddress === PROPERTIES.currentUser.EmailAddress;
				});
				if (PROPERTIES.ProfessorInfo === undefined) {
					PROPERTIES.ProfessorInfo = new CLASSES.Professor({
						FirstName: PROPERTIES.currentUser.FirstName,
						LastName: PROPERTIES.currentUser.LastName,
						EmailAddress: PROPERTIES.currentUser.EmailAddress,
						Picture: PROPERTIES.currentUser.Picture
					}).add();
				}
			} else {
				PROPERTIES.ProfessorInfo = PROPERTIES.currentUser;
			}
			PROPERTIES.ProfessorInfo.FacultyTestingInfo = _.find(DATA.facultyTestingInfos, function(facultyTestingInfo) {
				return facultyTestingInfo.ProfessorId === PROPERTIES.ProfessorInfo.Id;
			}) || new CLASSES.FacultyTestingInfo({
				ProfessorId: PROPERTIES.ProfessorInfo.Id
			});
			this.addFacultyTestingInfo = function() {
				PROPERTIES.ProfessorInfo.FacultyTestingInfo.add();
			};
			this.updateFacultyTestingInfo = function() {
				PROPERTIES.ProfessorInfo.FacultyTestingInfo.update();
			};
			this.updateProfessor = function() {
				PROPERTIES.ProfessorInfo.update();
			};
		}
	]);
})();
