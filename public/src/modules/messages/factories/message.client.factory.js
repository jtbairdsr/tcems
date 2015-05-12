/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-04 18:21:20
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-07 13:16:24
 */
'use strict';

angular.module('core').factory('Message', function(
	$q, $alert, Data, messages, currentSemester, SentMessage, sentMessages,
	areas, employees, semesters
) {

	// Variables attempt make code more readable
	var $super = Data,
		listName = 'Message',
		list = messages.list;

	// Declare the new Message object
	function Message() {
		var newData = arguments[0] || {};
		$super.call(this, newData, list, listName);
		this.parent = $super.prototype;

		// Initialize the attributes of the new Message object
		this.initAttributes();
	}

	// Set the prototype of the new Message object to match it's parent.
	Message.prototype = Object.create($super.prototype);

	// Assign Message as its own constructor
	Message.prototype.constructor = Message;

	// Create the propertyList
	Message.prototype.propertyList = _.union(Data.prototype.propertyList, [
		'Active', 'Area/Id', 'Body', 'DueDate', 'ExpDate', 'From/Id',
		'Mandatory', 'Policy', 'Semester/Id', 'Subject'
	]);

	/**************************************************************************
	 *                             INSTANCE METHODS                           *
	 **************************************************************************/

	// Override the initAttributes method from parent object
	Message.prototype.initAttributes = function() {
		var that = this;
		this.parent.initAttributes.apply(this);

		/*********************Values stored on DB**********************/
		this.Active = this.newData.Active || false;
		this.AreaId = (this.newData.AreaId) ? this.newData.AreaId : (
			(this.newData.Area) ? this.newData.Area.Id : undefined
		);
		this.Body = (this.newData.Body) ? this.newData.Body
			.replace(/<[a-z]*(.*\W)?>/g, '').replace(/<\/[a-z]*(.*\W)?>/g, '') : undefined;
		this.DueDate = (this.newData.DueDate) ? Date.parse(this.newData.DueDate) : undefined;
		this.ExpDate = (this.newData.ExpDate) ? Date.parse(this.newData.ExpDate) : undefined;
		this.FromId = (this.newData.FromId) ? this.newData.FromId : (
			(this.newData.From) ? this.newData.From.Id : undefined
		);
		this.Mandatory = this.newData.Mandatory || false;
		this.Policy = this.newData.Policy || false;
		this.SemesterId = (this.newData.SemesterId) ? this.newData.SemesterId : (
			(this.newData.Semester) ? this.newData.Semester.Id : undefined
		);
		this.Subject = this.newData.Subject || undefined;

		/****************Values derived from other tables**************/
		this.Area = (this.AreaId) ? _.find(areas.list, function(area) {
			return area.Id === that.AreaId;
		}) : undefined;
		this.From = (this.FromId) ? _.find(employees.list, function(employee) {
			return employee.Id === that.FromId;
		}) : undefined;
		this.Semester = (this.SemesterId) ? _.find(semesters.list, function(semester) {
			return semester.Id === that.SemesterId;
		}) : undefined;

		/*******************Values that don't persist******************/
		this.FormattedBody = (this.newData.Body) ? Autolinker.link(this.Body, {
			truncate: 10
		}).replace(/\n\r?/g, '<br />') : undefined;
		this.UniversalPolicy = (this.Area) ? (this.Area.Description === 'Director') : false;
		this.tempBody = this.Body;
		this.Edit = false;
		this.data = this.updateData();
	};

	// Override the updateData method from parent object
	Message.prototype.updateData = function() {
		var returnData = this.parent.updateData.apply(this);
		returnData.Active = this.Active;
		returnData.AreaId = this.AreaId;
		returnData.Body = this.Body;
		returnData.DueDate = this.DueDate;
		returnData.ExpDate = this.ExpDate;
		returnData.FromId = this.FromId;
		returnData.Mandatory = this.Mandatory;
		returnData.Policy = this.Policy;
		returnData.SemesterId = this.SemesterId;
		returnData.Subject = this.Subject;
		return returnData;
	};

	// Override the toString method from parent object
	Message.prototype.toString = function() {
		if (this.From) {
			return 'Subject: ' + this.Subject + '\n From: ' + this.From.toString('name');
		} else {
			return 'New Message';
		}
	};

	// Override the add method from parent object
	Message.prototype.add = function(hideAlert) {
		var deffered = $q.defer();
		hideAlert = hideAlert || false;
		this.Active = true;
		this.parent.add.call(this, hideAlert).then(function() {
			deffered.resolve();
		});
		return deffered.promise;
	};

	// Create the send method
	Message.prototype.send = function(recipients, hideAlert) {
		hideAlert = hideAlert || false;
		var that = this,
			deffered = $q.defer(),
			recipientCounter = 0;

		function sendMessage(recipient) {
			/**
			 * This function sends a message to the passed employee from the Recipients list.
			 *
			 * @param      {Object}    recipient    The Employee object the message is being sent to
			 * @returns    {null}
			 */
			var sentMessage = new SentMessage({
				EmployeeId: recipient.Id,
				MessageId: that.Id,
				SemesterId: currentSemester.data.Id
			});
			sentMessage.add(true)
				.then(function() {
					if (++recipientCounter < recipients.length) {
						sendMessage(recipients[recipientCounter]);
					} else {
						if (!hideAlert) {
							$alert({
								show: true,
								placement: 'top-right',
								content: 'Your message has been sent!',
								animation: 'am-fade-and-slide-top',
								duration: '3',
								type: 'success',
								template: 'src/modules/core/views/alerts/success-alert.client.view.html'
							});
						}
						deffered.resolve();
					}
				});
		}

		// Assign the semester Id for the new mewssage
		that.SemesterId = currentSemester.data.Id;

		// Send the message
		that.add(true)
			.then(function() {
				sendMessage(recipients[recipientCounter]);
			});
		return deffered.promise;
	};

	// Create the getRecipients method
	Message.prototype.getSentMessages = function() {
		var that = this;
		return _.filter(sentMessages.list, function(sentMessage) {
			return sentMessage.MessageId === that.Id;
		});
	};

	// Create the deactivate method
	Message.prototype.deactivate = function() {
		var deffered = $q.defer(),
			that = this,
			hideAlert = arguments[0] || false,
			recips = this.getSentMessages(),
			recipsCounter = 0;

		function removeSentMess(sMess) {
			sMess.remove(true).then(function() {
				if (++recipsCounter >= recips.length) {
					that.Active = false;
					that.update(hideAlert)
						.then(function() {
							deffered.resolve();
						});
				} else {
					removeSentMess(recips[recipsCounter]);
				}
			});
		}

		removeSentMess(recips[recipsCounter]);
		return deffered.promise;
	};

	/**************************************************************************
	 *                              CLASS METHODS                             *
	 **************************************************************************/

	Message.query = function() {
		var deffered = $q.defer(),
			filter = {
				or: {
					and: [
						['Active', 'eq', 1],
						['Semester/Id', 'eq', currentSemester.data.Id]
					],
					other: ['Policy', 'eq', 1]
				}
			},
			expand = ['Semester', 'Area', 'From'],
			select = Message.prototype.propertyList;
		$super.queryFilter.call(this, listName, filter, expand, select)
			.then(function(data) {
				list.splice(0, list.length);
				_.each(data, function(datum) {
					list.push(new Message(datum));
				});
				deffered.resolve();
			});
		return deffered.promise;

		// TODO: create the query class method test suite
	};

	Message.queryAll = function() {
		var deffered = $q.defer();
		$super.query.call(this, listName)
			.then(function(data) {
				list.splice(0, list.length);
				_.each(data, function(datum) {
					list.push(new Message(datum));
				});
				deffered.resolve();
			});
		return deffered.promise;

		// TODO: create the query class method test suite
	};

	// Return the newly defined Message object
	return Message;
});
