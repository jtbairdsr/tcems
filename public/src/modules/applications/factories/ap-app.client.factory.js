/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-19 07:58:35
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-19 08:22:20
 */

'use strict';

angular.module('applications').factory('APApp', function(
	$q, Data, aPApps, questions, areaPositions
) {
	// Variables attempt to make the code more readable
	var $super = Data,
		listName = 'APApp',
		list = aPApps.list;

	// Declare the new APApp object
	function APApp(newData) {
		$super.call(this, newData, list, listName);
		this.parent = $super.prototype;

		// Initialize the properties of the new APApp object
		this.initAttributes();
	}

	// Set the prototype of the new APApp object to match its parent.
	APApp.prototype = Object.create($super.prototype);

	// Assign APApp as its own constructor
	APApp.prototype.constructor = APApp;

	/**************************************************************************
	 *                             INSTANCE METHODS                           *
	 **************************************************************************/

	// Override the initAttributes method from the parent object
	APApp.prototype.initAttributes = function() {
		var that = this;
		this.parent.initAttributes.apply(this);

		/*********************Values stored on DB**********************/
		this.aPId = this.newData.AreaPositionId || undefined;
		this.qId = this.newData.QuestionId || undefined;

		/****************Values derived from other tables**************/
		this.ap = (this.aPId) ? _.find(areaPositions.list, function(ap) {
			return ap.Id === that.aPId;
		}) : undefined;
		this.ques = (this.qId) ? _.find(questions.list, function(ques) {
			return ques.Id === that.qId;
		}) : undefined;

		/*******************Values that don't persist******************/
		this.data = this.updateData();
	};

	// Override the updateData method from the parent object
	APApp.prototype.updateData = function() {
		var returnData = this.parent.updateData.apply(this);
		returnData.AreaPositionId = this.aPId;
		returnData.QuestionId = this.qId;
		return returnData;
	};

	// Override the toString method from the parent object
	APApp.prototype.toString = function() {
		if (this.Id) {
			return this.ap.toString() + '\'s application link to:\n' + this.ques.toString();
		} else {
			return 'New area-position application question';
		}
	};

	/**************************************************************************
	 *                              CLASS METHODS                             *
	 **************************************************************************/

	APApp.query = function() {
		var deffered = $q.defer();
		$super.query.call(this, listName)
			.then(function(data) {
				list.splice(0, list.length);
				_.each(data, function(datum) {
					list.push(new APApp(datum));
				});
				deffered.resolve();
			});
		return deffered.promise;
	};

	// Return the newly defined APApp object
	return APApp;
});

