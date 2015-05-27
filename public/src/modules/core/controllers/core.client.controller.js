/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-01 14:22:47
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-22 17:17:01
 */

'use strict';

angular.module('core').controller('CoreController', function(

	// Services
	$rootScope, $location, cfpLoadingBar,

	// Values
	scopeSetter, currentUser, nextSemester, currentSemester,

	// Arrays
	areas, areaPositions, availabilities, employees, employments, intents,
	positions, tracks, messages, sentMessages, unreadMessages, weeks, subShifts,
	facultyTestingInfos, professors, noTestingDays, semesters, schedules, teams,
	shiftGroups, userMessages, userSentMessages, shifts, policies, questions,
	pApps, aApps

) {
	if (/inactiveEmployee|application/.test($location.path())) {
		// Convert the last portion of the path to the app title.
		$rootScope.currentApp = {
			title: $location.path().split('/')[2].replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^([a-z])/g, function(m) {
				return m.toUpperCase();
			})
		};
		cfpLoadingBar.complete();
	} else {
		// Lists
		$rootScope.availabilities = availabilities.list;
		$rootScope.employees = employees.list;
		$rootScope.employments = employments.list;
		$rootScope.intents = intents.list;
		$rootScope.teams = teams.list;
		$rootScope.schedules = schedules.list;
		$rootScope.shifts = shifts.list;
		$rootScope.subShifts = subShifts.list;
		$rootScope.weeks = weeks.list;

		// Data
		$rootScope.currentApp = {
			title: ''
		};
	}

	// Lists
	$rootScope.positions = positions.list;
	$rootScope.areas = areas.list;
	$rootScope.areaPositions = areaPositions.list;
	$rootScope.tracks = tracks.list;
	$rootScope.messages = messages.list;
	$rootScope.sentMessages = sentMessages.list;
	$rootScope.facultyTestingInfos = facultyTestingInfos.list;
	$rootScope.professors = professors.list;
	$rootScope.noTestingDays = noTestingDays.list;
	$rootScope.shiftGroups = shiftGroups.list;
	$rootScope.userMessages = userMessages.list;
	$rootScope.userSentMessages = userSentMessages.list;
	$rootScope.policies = policies.list;
	$rootScope.questions = questions.list;
	$rootScope.pApps = pApps.list;
	$rootScope.aApps = aApps.list;

	// Data
	$rootScope.semesters = semesters;
	$rootScope.currentUser = currentUser.data;
	$rootScope.nextSemester = nextSemester.data;
	$rootScope.currentSemester = currentSemester.data;
	$rootScope.unreadMessages = unreadMessages;

});
