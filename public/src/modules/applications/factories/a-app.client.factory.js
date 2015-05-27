/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-19 07:58:35
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-22 18:21:58
 */

'use strict';

angular.module('applications').factory('AApp', function(
	$q, Data, aApps, questions, areas
) {
	// Variables attempt to make the code more readable
	var $super = Data,
		listName = 'AApp',
		list = aApps.list;

	// Declare the new AApp object
	function AApp(newData) {
		$super.call(this, newData, list, listName);
		this.parent = $super.prototype;

		// Initialize the properties of the new AApp object
		this.initAttributes();
	}

	// Set the prototype of the new AApp object to match its parent.
	AApp.prototype = Object.create($super.prototype);

	// Assign AApp as its own constructor
	AApp.prototype.constructor = AApp;

	/**************************************************************************
	 *                             INSTANCE METHODS                           *
	 **************************************************************************/

	// Override the initAttributes method from the parent object
	AApp.prototype.initAttributes = function() {
		var that = this;
		this.parent.initAttributes.apply(this);

		/*********************Values stored on DB**********************/
		this.aId = this.newData.AreaId || this.newData.aId || undefined;
		this.qId = this.newData.QuestionId || this.newData.qId || undefined;

		/****************Values derived from other tables**************/
		this.area = (this.aId) ? _.find(areas.list, function(area) {
			return area.Id === that.aId;
		}) : undefined;
		this.ques = (this.qId) ? _.find(questions.list, function(ques) {
			return ques.Id === that.qId;
		}) : undefined;

		/*******************Values that don't persist******************/
		this.data = this.updateData();
	};

	// Override the updateData method from the parent object
	AApp.prototype.updateData = function() {
		var returnData = this.parent.updateData.apply(this);
		returnData.AreaId = this.aId;
		returnData.QuestionId = this.qId;
		return returnData;
	};

	// Override the toString method from the parent object
	AApp.prototype.toString = function() {
		if (this.Id && this.area) {
			return this.area.toString() + '\'s application link to:\n' + this.ques.toString();
		} else {
			return 'New area application question';
		}
	};

	/**************************************************************************
	 *                              CLASS METHODS                             *
	 **************************************************************************/

	AApp.query = function() {
		var deffered = $q.defer();
		$super.query.call(this, listName)
			.then(function(data) {
				list.splice(0, list.length);
				_.each(data, function(datum) {
					list.push(new AApp(datum));
				});
				deffered.resolve();
			});
		return deffered.promise;
	};

	// Return the newly defined AApp object
	return AApp;
});
