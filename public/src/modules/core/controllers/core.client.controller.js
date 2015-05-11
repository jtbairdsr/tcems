/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-01 14:22:47
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-07 12:54:00
 */

'use strict';

angular.module('core').controller('CoreController', function(
	$rootScope, scopeSetter, currentUser, areas, areaPositions, availabilities,
	employees, employments, intents, positions, teams, tracks, messages,
	sentMessages, unreadMessages, facultyTestingInfos, professors, nextSemester,
	currentSemester, noTestingDays, semesters, schedules, shiftGroups, shifts,
	subShifts, weeks, userMessages, userSentMessages, policies
) {
	// Lists
	$rootScope.positions = positions.list;
	$rootScope.areas = areas.list;
	$rootScope.areaPositions = areaPositions.list;
	$rootScope.availabilities = availabilities.list;
	$rootScope.employees = employees.list;
	$rootScope.employments = employments.list;
	$rootScope.intents = intents.list;
	$rootScope.teams = teams.list;
	$rootScope.tracks = tracks.list;
	$rootScope.messages = messages.list;
	$rootScope.sentMessages = sentMessages.list;
	$rootScope.facultyTestingInfos = facultyTestingInfos.list;
	$rootScope.professors = professors.list;
	$rootScope.noTestingDays = noTestingDays.list;
	$rootScope.schedules = schedules.list;
	$rootScope.shiftGroups = shiftGroups.list;
	$rootScope.shifts = shifts.list;
	$rootScope.subShifts = subShifts.list;
	$rootScope.userMessages = userMessages.list;
	$rootScope.userSentMessages = userSentMessages.list;
	$rootScope.policies = policies.list;
	$rootScope.weeks = weeks.list;

	// Data
	$rootScope.semesters = semesters;
	$rootScope.currentUser = currentUser.data;
	$rootScope.nextSemester = nextSemester.data;
	$rootScope.currentSemester = currentSemester.data;
	$rootScope.unreadMessages = unreadMessages;
	$rootScope.currentApp = {
		title: ''
	};

});