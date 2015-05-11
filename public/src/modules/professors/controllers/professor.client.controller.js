/*
 * @Author: Jonathan Baird
 * @Date:   2015-02-02 10:54:46
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-07 14:26:28
 */

'use strict';

angular.module('professors').controller('ProfessorController', function(
	$scope, $alert, $q, Professor, FacultyTestingInfo, currentUser, professorInfo,
	professors, facultyTestingInfos
) {
	$scope.currentApp.title = currentUser.data.FirstName + ' ' + currentUser.data.LastName;

	if (currentUser.data.INumber) {
		professorInfo.data = _.find(professors.list, function(professor) {
			return professor.EmailAddress === currentUser.data.EmailAddress;
		});
		console.log(professorInfo);
		if (professorInfo.data === undefined) {
			professorInfo.data = new Professor({
				FirstName: currentUser.data.FirstName,
				LastName: currentUser.data.LastName,
				EmailAddress: currentUser.data.EmailAddress,
				Picture: currentUser.data.Picture
			}).add();
		}
	} else {
		professorInfo.data = currentUser.data;
	}

	$scope.professorInfo = professorInfo.data;

	professorInfo.data.FacultyTestingInfo = _.find(facultyTestingInfos.list, function(facultyTestingInfo) {
		return facultyTestingInfo.ProfessorId === professorInfo.data.Id;
	}) || new FacultyTestingInfo({
		ProfessorId: professorInfo.data.Id
	});
	this.addFacultyTestingInfo = function() {
		professorInfo.data.FacultyTestingInfo.add();
	};
	this.updateFacultyTestingInfo = function() {
		professorInfo.data.FacultyTestingInfo.update();
	};
	this.updateProfessor = function() {
		professorInfo.data.update();
	};
});
