/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-29 08:31:34
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-15 15:55:25
 */

'use strict';

angular.module('semesters').factory('Semester', function($q, Data, semesters, shiftGroups) {

	// Variables attempt make code more readable
	var $super = Data,
		listName = 'Semester',
		list = semesters.list;

	// Declare the new Semester object
	function Semester(newData) {
		newData = newData || {};
		$super.call(this, newData, list, listName);
		this.parent = $super.prototype;

		// Initialize the attributes of the new Semester object
		this.initAttributes();
	}

	// Set the prototype of the new Semester object to match it's parent.
	Semester.prototype = Object.create($super.prototype);

	// Assign Semester as its own constructor
	Semester.prototype.constructor = Semester;

	/**************************************************************************
	 *                             INSTANCE METHODS                           *
	 **************************************************************************/

	// Override the initAttributes method from parent object
	Semester.prototype.initAttributes = function() {
		var that = this;
		this.parent.initAttributes.apply(this);

		/*********************Values stored on DB**********************/
		this.Active = this.newData.Active || false;
		this.FirstDay = (this.newData.FirstDay) ? Date.parse(this.newData.FirstDay) : undefined;
		this.LastDay = (this.newData.LastDay) ? Date.parse(this.newData.LastDay) : undefined;
		this.NextSemesterId = this.newData.NextSemesterId || undefined;
		this.ShiftGroupId = this.newData.ShiftGroupId || undefined;
		this.Year = this.newData.Year || undefined;

		/****************Values derived from other tables**************/
		this.NextSemester = (this.newData.NextSemesterId) ? _.find(semesters.list, function(semseter) {
			return semseter.Id === that.NextSemesterId;
		}) : {};
		this.ShiftGroup = (this.newData.ShiftGroupId) ? _.find(shiftGroups.list, function(shiftGroup) {
			return shiftGroup.Id === that.ShiftGroupId;
		}) : {};

		/*******************Values that don't persist******************/
		this.data = this.updateData();
	};

	// Override the updateData method from parent object
	Semester.prototype.updateData = function() {
		var returnData = this.parent.updateData.apply(this);
		returnData.Active = this.Active;
		returnData.FirstDay = this.FirstDay;
		returnData.LastDay = this.LastDay;
		returnData.NextSemesterId = this.NextSemesterId;
		returnData.ShiftGroupId = this.ShiftGroupId;
		returnData.Year = this.Year;
		return returnData;
	};

	// Override the toString method from parent object
	Semester.prototype.toString = function() {
		if (this.ShiftGroup) {
			return this.ShiftGroup.Description + ' ' + this.Year + ' Semester';
		} else {
			return 'New Semester';
		}
	};

	// Override the deactivate method from parent object
	Semester.prototype.deactivate = function() {
		var deffered = $q.defer();
		this.Active = false;
		this.update().then(function() {
			deffered.resolve();
		});
		return deffered.promise;
	};

	/**************************************************************************
	 *                              CLASS METHODS                             *
	 **************************************************************************/

	Semester.query = function() {
		var deffered = $q.defer();
		$super.query.call(this, listName)
			.then(function(data) {
				data.reverse();
				list.splice(0, list.length);
				_.each(data, function(datum) {
					list.push(new Semester(datum));
				});
				deffered.resolve();
			});
		return deffered.promise;
	};

	// Return the newly defined Semester object
	return Semester;
});
