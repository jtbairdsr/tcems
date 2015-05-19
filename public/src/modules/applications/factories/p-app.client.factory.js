/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-19 07:58:35
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-19 08:40:31
 */

'use strict';

angular.module('applications').factory('PApp', function(
	$q, Data, pApps, questions, positions
) {
	// Variables attempt to make the code more readable
	var $super = Data,
		listName = 'PApp',
		list = pApps.list;

	// Declare the new PApp object
	function PApp(newData) {
		$super.call(this, newData, list, listName);
		this.parent = $super.prototype;

		// Initialize the properties of the new PApp object
		this.initAttributes();
	}

	// Set the prototype of the new PApp object to match its parent.
	PApp.prototype = Object.create($super.prototype);

	// Assign PApp as its own constructor
	PApp.prototype.constructor = PApp;

	/**************************************************************************
	 *                             INSTANCE METHODS                           *
	 **************************************************************************/

	// Override the initAttributes method from the parent object
	PApp.prototype.initAttributes = function() {
		var that = this;
		this.parent.initAttributes.apply(this);

		/*********************Values stored on DB**********************/
		this.pId = this.newData.PositionId || undefined;
		this.qId = this.newData.QuestionId || undefined;

		/****************Values derived from other tables**************/
		this.pos = (this.pId) ? _.find(positions.list, function(pos) {
			return pos.Id === that.pId;
		}) : undefined;
		this.ques = (this.qId) ? _.find(questions.list, function(ques) {
			return ques.Id === that.qId;
		}) : undefined;

		/*******************Values that don't persist******************/
		this.data = this.updateData();
	};

	// Override the updateData method from the parent object
	PApp.prototype.updateData = function() {
		var returnData = this.parent.updateData.apply(this);
		returnData.PositionId = this.pId;
		returnData.QuestionId = this.qId;
		return returnData;
	};

	// Override the toString method from the parent object
	PApp.prototype.toString = function() {
		if (this.Id) {
			return this.pos.toString() + '\'s application link to:\n' + this.ques.toString();
		} else {
			return 'New position application question';
		}
	};

	/**************************************************************************
	 *                              CLASS METHODS                             *
	 **************************************************************************/

	PApp.query = function() {
		var deffered = $q.defer();
		$super.query.call(this, listName)
			.then(function(data) {
				list.splice(0, list.length);
				_.each(data, function(datum) {
					list.push(new PApp(datum));
				});
				deffered.resolve();
			});
		return deffered.promise;
	};

	// Return the newly defined PApp object
	return PApp;
});

