/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-18 16:29:30
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-19 07:40:11
 */

'use strict';

angular.module('applications').factory('Response', function(
	$q, Data, questions, employees, responses
) {
	// Variables attempt to make the code more readable
	var $super = Data,
		listName = 'Response',
		list = responses.list;

	// Declare the new Response object
	function Response(newData) {
		$super.call(this, newData, list, listName);
		this.parent = $super.prototype;

		// Initialize the properties of the new Response object
		this.initAttributes();
	}

	// Set the prototype of the new Response object to match its parent
	Response.prototype = Object.create($super.prototype);

	// Assign Response as its own constructor
	Response.prototype.constructor = Response;

	/**************************************************************************
	 *                             INSTANCE METHODS                           *
	 **************************************************************************/

	// Override the initAttributes method from the parent object
	Response.prototype.initAttributes = function() {
		var that = this;
		this.parent.initAttributes.apply(this);

		/*********************Values stored on DB**********************/
		this.type = this.newData.Type || undefined;
		this.eId = this.newData.EmployeeId || undefined;
		this.qId = this.newData.QuestionId || undefined;
		switch (this.type) {
			case 'Date':
				this.content = (this.newData.Content) ? Date.parse(this.newData.Content) : undefined;
				break;
			case 'Boolean':
				this.content = (/yes|true/i.test(this.newData.Content)) ? true : this.newData.Content || false;
				break;
			case 'MultipleChoice':
				this.content = (this.newData.Content) ? this.newData.Content.split(',') : undefined;
				break;
			default:
				this.content = this.newData.Content || undefined;
		}

		/****************Values derived from other tables**************/
		this.emp = (this.eId) ? _.find(employees.list, function(emp) {
			return emp.Id === that.eId;
		}) : undefined;
		this.ques = (this.qId) ? _.find(questions.list, function(ques) {
			return ques.Id === that.qId;
		}) : undefined;

		/*******************Values that don't persist******************/
		this.data = this.updateData();
	};

	// Override the updateData method from the parent object
	Response.prototype.updateData = function() {
		var returnData = this.parent.updateData.apply(this);
		returnData.Content = (this.content) ? this.content.toString('MMMM d, yyyy') : undefined;
		returnData.Type = this.type;
		returnData.EmployeeId = this.eId;
		returnData.QuestionId = this.qId;
		return returnData;
	};

	// Override the toString method from the parent object
	Response.prototype.toString = function() {
		if (this.Id) {
			return this.emp.toString() + '\'s response to:\n' + this.ques.toString();
		} else {
			return 'New response';
		}
	};

	/**************************************************************************
	 *                              CLASS METHODS                             *
	 **************************************************************************/

	Response.query = function() {
		var deffered = $q.defer();
		$super.query.call(this, listName)
			.then(function(data) {
				list.splice(0, list.length);
				_.each(data, function(datum) {
					list.push(new Response(datum));
				});
				deffered.resolve();
			});
		return deffered.promise;
	};

	// Return the newly defined Question object
	return Response;
});

