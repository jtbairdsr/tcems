/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-29 12:23:20
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-04 15:37:43
 */

'use strict';

angular.module('core').factory('Employment', function($q, Data, employments, areas, employees, positions) {

	// Variables attempt make code more readable
	var $super = Data,
		listName = 'Employment',
		list = employments.list;

	// Declare the new Availability object
	function Employment() {
		var newData = arguments[0] || {};
		$super.call(this, newData, list, listName);
		this.parent = $super.prototype;

		// Initialize the attributes of the new Employment object
		this.initAttributes();
	}

	// Set the prototype of the new Availability object to match it's parent.
	Employment.prototype = Object.create($super.prototype);

	// Assign Availability as its own constructor
	Employment.prototype.constructor = Employment;

	/**************************************************************************
	 *                             INSTANCE METHODS                           *
	 **************************************************************************/

	// Override the initAttributes method from parent object
	Employment.prototype.initAttributes = function() {
		var object = this;
		this.parent.initAttributes.apply(this);

		/*********************Values stored on DB**********************/
		this.AreaId = this.newData.AreaId || undefined;
		this.EmployeeId = this.newData.EmployeeId || undefined;
		this.EndDate = (this.newData.EndDate) ? Date.parse(this.newData.EndDate) : undefined;
		this.PositionId = this.newData.PositionId || undefined;
		this.StartDate = (this.newData.StartDate) ? Date.parse(this.newData.StartDate) : undefined;

		/****************Values derived from other tables**************/
		this.Area = (this.newData.AreaId) ? _.find(areas.list, function(area) {
			return area.Id === object.AreaId;
		}) : undefined;
		this.Employee = (this.newData.EmployeeId) ? _.find(employees.list, function(employee) {
			return employee.Id === object.EmployeeId;
		}) : undefined;
		this.Position = (this.newData.PositionId) ? _.find(positions.list, function(position) {
			return position.Id === object.PositionId;
		}) : undefined;

		/*******************Values that don't persist******************/
		this.Edit = false;
		this.data = this.updateData();
	};

	// Override the updateData method from parent object
	Employment.prototype.updateData = function() {
		var returnData = this.parent.updateData.apply(this);
		returnData.AreaId = this.AreaId;
		returnData.EmployeeId = this.EmployeeId;
		returnData.EndDate = this.EndDate;
		returnData.StartDate = this.StartDate;
		returnData.PositionId = this.PositionId;
		return returnData;
	};

	// Override the toString method from parent object
	Employment.prototype.toString = function() {
		if (this.Employee) {
			return this.Employee.toString() + '\'s employment';
		} else {
			return 'New Employment';
		}
	};

	// Create the start method
	Employment.prototype.start = function(hideAlert) {
		hideAlert = hideAlert || false;
		var deffered = $q.defer();
		this.StartDate = new Date();
		this.add(hideAlert)
			.then(function() {
				deffered.resolve();
			});
		return deffered.promise;
	};

	// Create the end method
	Employment.prototype.end = function() {
		var deffered = $q.defer(),
			hideAlert = arguments[0] || false;
		this.EndDate = new Date();
		this.update(hideAlert)
			.then(function() {
				deffered.resolve();
			});
		return deffered.promise;
	};

	/**************************************************************************
	 *                              CLASS METHODS                             *
	 **************************************************************************/

	Employment.query = function() {
		var deffered = $q.defer();
		$super.query.call(this, listName)
			.then(function(data) {
				list.splice(0, list.length);
				_.each(data, function(employee) {
					list.push(new Employment(employee));
				});
				deffered.resolve();
			});
		return deffered.promise;

		// TODO: create the setIntent method test suite
	};

	// Return the newly defined Employment object
	return Employment;
});
