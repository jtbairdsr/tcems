/* global angular, _ , Autolinker */

(function() {
	'use strict';

	angular.module('core')
		.factory('Message', ['$q', '$alert', 'Data', 'messages', 'currentSemester', 'SentMessage', 'sentMessages', 'areas', 'employees', 'semesters',
			function($q, $alert, Data, messages, currentSemester, SentMessage, sentMessages, areas, employees, semesters) {

				// variables attempt make code more readable
				var $super = Data,
					listName = 'Message',
					list = messages.list;

				// declare the new Message object{{{
				function Message() {
						var newData = arguments[0] || {};
						$super.call(this, newData, list, listName);
						this.parent = $super.prototype;

						// initialize the attributes of the new Message object
						this.initAttributes();
					} //}}}

				// set the prototype of the new Message object to match it's parent.{{{
				Message.prototype = Object.create($super.prototype);
				//}}}

				// assign Message as its own constructor{{{
				Message.prototype.constructor = Message;
				//}}}

				// override the initAttributes method from parent object{{{
				Message.prototype.initAttributes = function() {
					var message = this;
					this.parent.initAttributes.apply(this);

					/*********************Values stored on DB**********************/
					this.Active = this.newData.Active || false;
					this.AreaId = this.newData.AreaId || undefined;
					this.Body = (this.newData.Body) ? this.newData.Body.replace(/<[a-z]*(.*\W)?>/g, '').replace(/<\/[a-z]*(.*\W)?>/g, '') : undefined;
					this.DueDate = (this.newData.DueDate) ? Date.parse(this.newData.DueDate) : undefined;
					this.ExpDate = (this.newData.ExpDate) ? Date.parse(this.newData.ExpDate) : undefined;
					this.FromId = this.newData.FromId || false;
					this.Mandatory = this.newData.Mandatory || false;
					this.Policy = this.newData.Policy || false;
					this.SemesterId = this.newData.SemesterId || undefined;
					this.Subject = this.newData.Subject || undefined;
					this.Recipients = this.newData.Recipients || [];

					/****************Values derived from other tables**************/
					this.Area = (this.newData.AreaId) ? _.find(areas.list, function(area) {
						return area.Id === message.AreaId;
					}) : undefined;
					this.From = (this.newData.FromId) ? _.find(employees.list, function(employee) {
						return employee.Id === message.FromId;
					}) : undefined;
					this.Semester = (this.newData.SemesterId) ? _.find(semesters.list, function(semester) {
						return semester.Id === message.SemesterId;
					}) : undefined;

					/*******************Values that don't persist******************/
					this.FormattedBody = (this.newData.Body) ? Autolinker.link(this.Body, {
						truncate: 10
					}).replace(/\n\r?/g, '<br />') : undefined;
					this.UniversalPolicy = (this.Area) ? (this.Area.Description === 'Director') : false;
					this.tempBody = this.Body;
					this.Edit = false;
					this.data = this.updateData();
				}; //}}}

				// override the updateData method from parent object{{{
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
				}; //}}}

				// override the toString method from parent object{{{
				Message.prototype.toString = function() {
					if (this.From) {
						return 'Subject: ' + this.Subject + '\n From: ' + this.From.toString('name');
					} else {
						return 'New Message';
					}
				}; //}}}

				// override the add method from parent object{{{
				Message.prototype.add = function() {
					var deffered = $q.defer(),
						hideAlert = arguments[0] || false;
					this.Active = true;
					this.parent.add.call(this, hideAlert)
						.then(function() {
							deffered.resolve();
						});
					return deffered.promise;
				}; //}}}

				// create the send method//{{{
				Message.prototype.send = function() {
					var message = this,
						deffered = $q.defer(),
						recipients = this.Recipients,
						recipientCounter = 0,
						hideAlert = arguments[0] || false;

					function sendMessage(recipient) {
					/**
					 * This function sends a message to the passed employee from the Recipients list.
					 *
					 * @param      {Object}    recipient    The Employee object the message is being sent to
					 * @returns    {null}
					 */
						var sentMessage = new SentMessage({
							EmployeeId: recipient.Id,
							MessageId: message.Id
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
											template: 'partials/alerts/success-alert.html'
										});
									}
									deffered.resolve();
								}
							});
					}

					// assign the semester Id for the new mewssage
					message.SemesterId = currentSemester.Id;

					// send the message
					message.add(true)
						.then(function() {
							sendMessage(recipients[recipientCounter]);
						});
					return deffered.promise;

				}; //}}}

				// create the getRecipients method//{{{
				Message.prototype.getRecipients = function() {
					var message = this,
						relevantSentMessages = _.filter(sentMessages.list, function(sentMessage) {
							return sentMessage.MessageId === message.Id;
						});
					_.each(relevantSentMessages, function(sentMessage) {
						message.Recipients.push(sentMessage.Employee);
					});
				}; //}}}

				// create the deactivate method//{{{
				Message.prototype.deactivate = function() {
					var deffered = $q.defer(),
						hideAlert = arguments[0] || false;
					this.Active = false;
					this.update(hideAlert)
						.then(function() {
							deffered.resolve();
						});
					return deffered.promise;
				}; //}}}

				// return the newly defined Message object{{{
				return Message; //}}}
			}
		]);
})();


// vim:foldmethod=marker:foldlevel=0
