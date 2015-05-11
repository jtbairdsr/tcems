/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-01 09:04:26
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-01 15:06:35
 */

'use strict';

angular.module('professors').factory('FacultyTestingInfo', function(
	$q, $alert, Data, facultyTestingInfos, professors
) {

	// Variables attempt make code more readable
	var $super = Data,
		listName = 'FacultyTestingInfo',
		list = facultyTestingInfos.list;

	// Declare the new FacultyTestingInfo object
	function FacultyTestingInfo() {
		var newData = arguments[0] || {};
		$super.call(this, newData, list, listName);
		this.parent = $super.prototype;

		// Initialize the attributes of the new FacultyTestingInfo object
		this.initAttributes();
	}

	// Set the prototype of the new FacultyTestingInfo object to match it's parent.
	FacultyTestingInfo.prototype = Object.create($super.prototype);

	// Assign FacultyTestingInfo as its own constructor
	FacultyTestingInfo.prototype.constructor = FacultyTestingInfo;

	/**************************************************************************
	 *                             INSTANCE METHODS                           *
	 **************************************************************************/

	// Override the initAttributes method from parent object
	FacultyTestingInfo.prototype.initAttributes = function() {
		var that = this;
		this.parent.initAttributes.apply(this);

		/*********************Values stored on DB**********************/
		this.ProfessorId = this.newData.ProfessorId || undefined;
		this.Stipulation = this.newData.Stipulation || 'No stipulation.';
		this.Other = this.newData.Other || undefined;

		/****************Values derived from other tables**************/
		this.Professor = (this.newData.ProfessorId) ? _.find(professors.list, function(professor) {
			return professor.Id === that.ProfessorId;
		}) : undefined;

		/*******************Values that don't persist******************/
		this.data = this.updateData();
	};

	// Override the updateData method from parent object
	FacultyTestingInfo.prototype.updateData = function() {
		var returnData = this.parent.updateData.apply(this);
		returnData.ProfessorId = this.ProfessorId;
		returnData.Stipulation = this.Stipulation;
		returnData.Other = this.Other;
		return returnData;
	};

	// Override the toString method from parent object
	FacultyTestingInfo.prototype.toString = function() {
		if (this.Professor) {
			return this.Professor.toString() + '\'s testing information';
		} else {
			return 'New FacultyTestingInfo';
		}
	};

	/**************************************************************************
	 *                              CLASS METHODS                             *
	 **************************************************************************/

	FacultyTestingInfo.query = function() {
		var deffered = $q.defer();
		$super.query.call(this, listName)
			.then(function(data) {
				list.splice(0, list.length);
				_.each(data, function(datum) {
					list.push(new FacultyTestingInfo(datum));
				});
				deffered.resolve();
			});
		return deffered.promise;

		// TODO: create the setIntent method test suite
	};

	// Return the newly defined FacultyTestingInfo object
	return FacultyTestingInfo;

});
