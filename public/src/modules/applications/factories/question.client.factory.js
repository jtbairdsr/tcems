/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-15 15:33:08
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-18 09:49:34
 */

'use strict';

angular.module('applications').factory('Question', function(
	$q, Data, Response, Choice, questions, questionChoices, choices
) {

	// Variables attempt to make the code more readable
	var $super = Data,
		listName = 'Question',
		list = questions.list;

	// Declare the new Question object
	function Question(newData) {
		$super.call(this, newData, list, listName);
		this.parent = $super.prototype;

		// Initialize the properties of the new Question object
		this.initAttributes();
	}

	// Set the prototype of the new Question object to match it's parent.
	Question.prototype = Object.create($super.prototype);

	// Assign Question as its own contructor
	Question.prototype.constructor = Question;

	/**************************************************************************
	 *                             INSTANCE METHODS                           *
	 **************************************************************************/

	// Override the initAttributes method from the parent object
	Question.prototype.initAttributes = function() {
		this.parent.initAttributes.apply(this);

		/*********************Values stored on DB**********************/
		this.type = this.newData.Type || undefined;
		this.content = this.newData.Content || undefined;

		/*******************Values that don't persist******************/
		this.typeTest = /Choice|MultipleChoice/;
		this.choices = (this.typeTest.test(this.type)) ? this.getChoices() : undefined;
		this.data = this.updateData();
	};

	// Override the updateData method from the parent object
	Question.prototype.updateData = function() {
		var returnData = this.parent.updateData.apply(this);
		returnData.Content = this.content;
		return returnData;
	};

	// Override the toString method from the parent object
	Question.prototype.toString = function() {
		if (this.id) {
			return this.content;
		} else {
			return 'New Question';
		}
	};

	// Create the respond method
	Question.prototype.respond = function(hideAlert) {
		hideAlert = hideAlert || false;
		var deffered = $q.defer();
		new Response(this.response).add(hideAlert).then(function() {
			deffered.resolve();
		});
		return deffered.promise;
	};

	// Create the addChoices method
	Question.prototype.addChoices = function(newChoices, mc) {
		mc = mc || false;
		var deffered = $q.defer(),
			choicesC = 0;

		function addChoices(choice) {
			new Choice({
				Content: choice
			}).add().then(function() {
				if (++choicesC >= newChoices.length) {
					deffered.resolve();
				} else {
					addChoices(newChoices[choicesC]);
				}
			});
		}

		_.each(choices.list, function(choice) {
			newChoices = _.without(newChoices, choice);
		});
		if (newChoices.length > 0) {
			addChoices(newChoices[choicesC]);
		}
		return deffered.promise;
	};

	// Create the getChoices method
	Question.prototype.getChoices = function() {
		var returnArray = [],
			that = this;
		if (this.typeTest.test(this.type)) {
			_.each(questionChoices.list, function(qc) {
				if (qc.questionId === that.id) {
					returnArray.push(qc.question);
				}
			});
		}
		return returnArray;
	};

	/**************************************************************************
	 *                              CLASS METHODS                             *
	 **************************************************************************/

	Question.query = function() {
		var deffered = $q.defer();
		$super.query.call(this, listName)
			.then(function(data) {
				list.splice(0, list.length);
				_.each(data, function(datum) {
					list.push(new Question(datum));
				});
				deffered.resolve();
			});
		return deffered.promise;
	};

	// Return the newly defined Question object
	return Question;
});

