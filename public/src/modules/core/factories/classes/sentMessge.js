/* global angular, _ */

(function() {
	'use strict';

	angular.module('core')
	.factory('SentMessage', ['$q', 'Data', 'sentMessages', 'employees', 'messages',
		function($q, Data, sentMessages, employees, messages) {

			// declare the new SentMessage object{{{
			function SentMessage() {
				// variables attempt make code more readable
				var $super = Data,
					listName = 'SentMessage',
					list = sentMessages;
				this.parent = $super.prototype;
				$super.call(this, arguments, list, listName);
			}
			//}}}

			// set the prototype of the new SentMessage object to match it's parent.{{{
			SentMessage.prototype = Object.create(SentMessage.parent);
			//}}}

			// assign SentMessage as its own constructor{{{
			SentMessage.prototype.constructor = SentMessage;
			//}}}

			// override the initAttributes method from parent object{{{
			SentMessage.prototype.initAttributes = function() {
				var sentMessage = this;
				this.parent.initAttributes.apply(this);

				/*********************Values stored on DB**********************/
				this.AckDate = (this.newData.AckDate) ? Date.parse(this.newData.AckDate) : undefined;
				this.EmployeeId = this.newData.EmployeeId || undefined;
				this.MessageId = this.newData.MessageId || undefined;
				this.Policy = this.Message.Policy || false;
				this.Read = this.newData.Read || false;

				/****************Values derived from other tables**************/
				this.Employee = (this.newData.EmployeeId) ? _.find(employees, function(employee) {
					return employee.Id === sentMessage.EmployeeId;
				}) : {};
				this.Message = (this.newData.MessageId) ? _.find(messages, function(message) {
					return message.Id === sentMessage.MessageId;
				}) : {};

				/*******************Values that don't persist******************/
				this.Disabled = (this.newData.MessageId) ? (this.Message.DueDate.compareTo(Date.today()) < 1) : false;
				this.data = this.updateData();
			}; //}}}

			// override the updateData method from parent object{{{
			SentMessage.prototype.updateData = function() {
				var returnData = this.parent.updateData.apply(this);
				returnData.AckDate = this.AckDate;
				returnData.EmployeeId = this.EmployeeId;
				returnData.MessageId = this.MessageId;
				returnData.Read = this.Read;
				return returnData;
			}; //}}}

			// override the toString method from parent object{{{
			SentMessage.prototype.toString = function() {
				return 'Message from ' + this.Message.From.toString().split(': ')[1] +
					' to ' + this.Employee.toString().split(': ')[1] + '\nSubject: ' +
					this.Message.Subject;
			}; //}}}

			// override the read method from parent object{{{
			SentMessage.prototype.read = function() {
				var deffered = $q.defer();
				this.Read = true;
				this.AckDate = new Date();
				this.update()
					.then(function() {
						deffered.resolve();
					});
				return deffered.promise;
			};//}}}

			// initialize the attributes of the new SentMessage object{{{
			SentMessage.initAttributes(); //}}}

			// return the newly defined SentMessage object{{{
			return SentMessage; //}}}
		}
	]);
})();

// vim:foldmethod=marker:foldlevel=0