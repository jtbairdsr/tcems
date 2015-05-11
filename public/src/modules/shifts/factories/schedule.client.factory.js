/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-29 12:22:56
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-06 09:31:31
 */

'use strict';

angular.module('shifts').factory('Schedule', function(
	$q, Data, schedules, employees, shifts, semesters, currentSemester
) {

	// Variables attempt make code more readable
	var $super = Data,
		listName = 'Schedule',
		list = schedules.list;

	// Declare the new Schedule object
	function Schedule(newData) {
		newData = newData || {};
		$super.call(this, newData, list, listName);
		this.parent = $super.prototype;

		// Initialize the attributes of the new Schedule object
		this.initAttributes();
	}

	// Set the prototype of the new Schedule object to match it's parent.
	Schedule.prototype = Object.create($super.prototype);

	// Assign Schedule as its own constructor
	Schedule.prototype.constructor = Schedule;

	// Create the propertyList
	Schedule.prototype.propertyList = _.union(Data.prototype.propertyList, [
		'Active', 'Employee/Id', 'Shift/Id', 'Semester/Id'
	]);

	// Create the expand list
	Schedule.prototype.expand = ['Employee', 'Semester', 'Shift'];

	/**************************************************************************
	 *                             INSTANCE METHODS                           *
	 **************************************************************************/

	// Override the initAttributes method from parent object
	Schedule.prototype.initAttributes = function() {
		var that = this;
		this.parent.initAttributes.apply(this);

		/*********************Values stored on DB**********************/
		this.Active = this.newData.Active || false;
		this.EmployeeId = (this.newData.EmployeeId) ? this.newData.EmployeeId : (
			(this.newData.Employee) ? this.newData.Employee.Id : undefined
		);
		this.ShiftId = (this.newData.ShiftId) ? this.newData.ShiftId : (
			(this.newData.Shift) ? this.newData.Shift.Id : undefined
		);
		this.SemesterId = (this.newData.SemesterId) ? this.newData.SemesterId : (
			(this.newData.Semester) ? this.newData.Semester.Id : undefined
		);

		/****************Values derived from other tables**************/
		this.Employee = (this.EmployeeId) ? _.find(employees.list, function(employee) {
			return employee.Id === that.EmployeeId;
		}) : {};
		this.Shift = (this.ShiftId) ? _.find(shifts.list, function(shift) {
			return shift.Id === that.ShiftId;
		}) : {};
		this.Semester = (this.SemesterId) ? _.find(semesters.list, function(semester) {
			return semester.Id === that.SemesterId;
		}) : {};

		/*******************Values that don't persist******************/
		this.data = this.updateData();
	};

	// Override the updateData method from parent object
	Schedule.prototype.updateData = function() {
		var returnData = this.parent.updateData.apply(this);
		returnData.Active = this.Active;
		returnData.EmployeeId = this.EmployeeId;
		returnData.ShiftId = this.ShiftId;
		returnData.SemesterId = this.SemesterId;
		return returnData;
	};

	// Override the toString method from parent object
	Schedule.prototype.toString = function() {
		if (this.Employee) {
			return this.Employee.toString() + '\'s schedule';
		} else {
			return 'New schedule';
		}
	};

	// Override the add method from parent object
	Schedule.prototype.add = function() {
		var deffered = $q.defer();
		this.Active = true;
		this.parent.add.apply(this)
			.then(function() {
				deffered.resolve();
			});
		return deffered.promise;
	};

	// Create the deactivate method
	Schedule.prototype.deactivate = function(hideAlert) {
		var deffered = $q.defer();
		hideAlert = hideAlert || false;
		this.Active = false;
		this.update(hideAlert)
			.then(function() {
				deffered.resolve();
			});
		return deffered.promise;
	};

	/**************************************************************************
	 *                              CLASS METHODS                             *
	 **************************************************************************/

	Schedule.query = function() {
		var deffered = $q.defer();
		$super.query.call(this, listName)
			.then(function(data) {
				list.splice(0, list.length);
				_.each(data, function(datum) {
					list.push(new Schedule(datum));
				});
				deffered.resolve();
			});
		return deffered.promise;

		// TODO: create the setIntent method test suite
	};

	Schedule.queryCurrentActive = function() {
		var deffered = $q.defer(),
			filter = {
				and: [
					['Active', 'eq', 1],
					['Semester/Id', 'ge', currentSemester.data.Id]
				]
			};
		$super.queryFilter.call(this, listName, filter, Schedule.prototype.expand, Schedule.prototype.propertyList)
			.then(function(data) {
				list.splice(0, list.length);
				_.each(data, function(datum) {
					list.push(new Schedule(datum));
				});
				deffered.resolve();
			});
		return deffered.promise;

		// TODO: create the setIntent method test suite
	};

	// Return the newly defined Schedule object
	return Schedule;
});
