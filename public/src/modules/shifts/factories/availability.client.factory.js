/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-29 12:23:27
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-06 09:31:10
 */

'use strict';

angular.module('shifts').factory('Availability', function(
	$q, Data, availabilities, semesters, employees, currentSemester
) {

	// Variables attempt make code more readable
	var $super = Data,
		listName = 'Availability',
		list = availabilities.list;

	// Declare the new Availability object
	function Availability() {
		var newData = arguments[0] || {};
		$super.call(this, newData, list, listName);
		this.parent = $super.prototype;
		this.initAttributes();
	}

	// Create the propertyList
	Availability.prototype.propertyList = _.union(Data.prototype.propertyList, [
		'Active', 'Current', 'Day', 'Employee/Id', 'EndTime', 'Semester/Id', 'StartTime'
	]);

	// Create the expand list
	Availability.prototype.expand = ['Employee', 'Semester'];

	/**************************************************************************
	 *                             INSTANCE METHODS                           *
	 **************************************************************************/

	// Set the prototype of the new Availability object to match it's parent.
	Availability.prototype = Object.create($super.prototype);

	// Assign Availability as its own constructor
	Availability.prototype.constructor = Availability;

	// Override the initAttributes method from parent object
	Availability.prototype.initAttributes = function() {
		var that = this;
		this.parent.initAttributes.apply(this);

		// [>**********Attributes that are stored in the DB*************<]
		this.Active = this.newData.Active || this.newData.Current || false;
		this.Current = this.newData.Current || false;
		this.Day = this.newData.Day || undefined;
		this.EmployeeId = this.newData.EmployeeId || undefined;
		this.EndTime = (this.newData.EndTime) ? Date.parse(this.newData.EndTime) : undefined;
		this.SemesterId = this.newData.SemesterId || undefined;
		this.StartTime = (this.newData.StartTime) ? Date.parse(this.newData.StartTime) : undefined;

		// [>************Attributes that are other objects**************<]
		this.Employee = (this.newData.EmployeeId) ? _.find(employees.list, function(employee) {
			return employee.Id === that.EmployeeId;
		}) : {};
		this.Semester = (this.newData.SemesterId) ? _.find(semesters.list, function(semseter) {
			return semseter.Id === that.SemesterId;
		}) : {};

		// [>******************Values that don't persist****************<]
		this.data = this.updateData();
	};

	// Override the updateData method from parent object
	Availability.prototype.updateData = function() {
		var returnData = this.parent.updateData.apply(this);
		returnData.Active = this.Current;
		returnData.Current = this.Current;
		returnData.Day = this.Day;
		returnData.EmployeeId = this.EmployeeId;
		returnData.EndTime = this.EndTime;
		returnData.SemesterId = this.SemesterId;
		returnData.StartTime = this.StartTime;
		return returnData;
	};

	// Override the toString method from parent object
	Availability.prototype.toString = function() {
		if (this.Employee) {
			return this.Employee.toString() + '\'s availability';
		} else {
			return 'New Availability';
		}
	};

	// Create the add method
	Availability.prototype.add = function(hideAlert) {
		var deffered = $q.defer();
		hideAlert = hideAlert || false;
		this.Active = true;
		this.Current = true;
		this.parent.add.call(this, hideAlert)
			.then(function() {
				deffered.resolve();
			});
		return deffered.promise;
	};

	// Create the deactivate method
	Availability.prototype.deactivate = function(hideAlert) {
		var deffered = $q.defer();
		hideAlert = hideAlert || false;
		this.Active = false;
		this.Current = false;
		this.update(hideAlert)
			.then(function() {
				deffered.resolve();
			});
		return deffered.promise;
	};

	/**************************************************************************
	 *                              CLASS METHODS                             *
	 **************************************************************************/

	Availability.query = function() {
		var deffered = $q.defer();
		$super.query.call(this, listName)
			.then(function(data) {
				list.splice(0, list.length);
				_.each(data, function(datum) {
					list.push(new Availability(datum));
				});
				deffered.resolve();
			});
		return deffered.promise;

		// TODO: create the setIntent method test suite
	};

	Availability.queryCurrentActive = function() {
		var deffered = $q.defer(),
			filter = {
				and: [
					['Active', 'eq', 1],
					['Semester/Id', 'ge', currentSemester.data.Id]
				]
			};
		$super.queryFilter.call(this, listName, filter, Availability.prototype.expand, Availability.prototype.propertyList)
			.then(function(data) {
				list.splice(0, list.length);
				_.each(data, function(datum) {
					list.push(new Availability(datum));
				});
				deffered.resolve();
			});
		return deffered.promise;

		// TODO: create the setIntent method test suite
	};

	// Return the newly defined Availability object
	return Availability;
});
