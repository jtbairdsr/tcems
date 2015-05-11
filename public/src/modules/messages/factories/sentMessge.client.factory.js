/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-29 12:22:51
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-07 12:27:02
 */

'use strict';

angular.module('core').factory('SentMessage', function(
	$q, Data, sentMessages, employees, messages, semesters, currentSemester
) {

	// Variables attempt make code more readable
	var $super = Data,
		listName = 'SentMessage',
		list = sentMessages.list;

	// Declare the new SentMessage object
	function SentMessage(newData) {
		newData = newData || {};
		$super.call(this, newData, list, listName);
		this.parent = $super.prototype;

		// Initialize the attributes of the new SentMessage object
		this.initAttributes();
	}

	// Set the prototype of the new SentMessage object to match it's parent.
	SentMessage.prototype = Object.create($super.prototype);

	// Assign SentMessage as its own constructor
	SentMessage.prototype.constructor = SentMessage;

	// Create the propertyList
	SentMessage.prototype.propertyList = _.union(Data.prototype.propertyList, [
		'AckDate', 'Employee/Id', 'Message/Id', 'Semester/Id', 'Read'
	]);

	/**************************************************************************
	 *                             INSTANCE METHODS                           *
	 **************************************************************************/

	// Override the initAttributes method from parent object
	SentMessage.prototype.initAttributes = function() {
		var that = this;
		this.parent.initAttributes.apply(this);

		/*********************Values stored on DB**********************/
		this.AckDate = (this.newData.AckDate) ? Date.parse(this.newData.AckDate) : undefined;
		this.EmployeeId = (this.newData.EmployeeId) ? this.newData.EmployeeId : (
			(this.newData.Employee) ? this.newData.Employee.Id : undefined
		);
		this.MessageId = (this.newData.MessageId) ? this.newData.MessageId : (
			(this.newData.Message) ? this.newData.Message.Id : undefined
		);
		this.Read = this.newData.Read || false;
		this.SemesterId = (this.newData.SemesterId) ? this.newData.SemesterId : (
			(this.newData.Semester) ? this.newData.Semester.Id : undefined
		);

		/****************Values derived from other tables**************/
		this.Employee = (this.EmployeeId) ? _.find(employees.list, function(emp) {
			return emp.Id === that.EmployeeId;
		}) : {};
		this.Message = (this.MessageId) ? _.find(messages.list, function(message) {
			return message.Id === that.MessageId;
		}) : {};
		this.Semester = (this.SemesterId) ? _.find(semesters.list, function(sem) {
			return sem.Id === that.MessageId;
		}) : {};

		/*******************Values that don't persist******************/
		this.Policy = this.Message.Policy || false;
		this.Disabled = (this.newData.MessageId) ? (this.Message.DueDate.compareTo(Date.today()) < 1) : false;
		this.data = this.updateData();

	};

	// Override the updateData method from parent object
	SentMessage.prototype.updateData = function() {
		var returnData = this.parent.updateData.apply(this);
		returnData.AckDate = this.AckDate;
		returnData.EmployeeId = this.EmployeeId;
		returnData.MessageId = this.MessageId;
		returnData.Read = this.Read;
		returnData.SemesterId = this.SemesterId;
		return returnData;
	};

	// Override the toString method from parent object
	SentMessage.prototype.toString = function() {
		if (this.MessageId && this.Message.From) {
			return 'Message from ' + this.Message.From.toString()
				.split(': ')[1] + ' to ' + this.Employee.toString()
				.split(': ')[1] + '\nSubject: ' + this.Message.Subject;
		} else {
			return 'New sent message.';
		}
	};

	// Override the read method from parent object
	SentMessage.prototype.read = function() {
		var deffered = $q.defer();
		this.Read = true;
		this.AckDate = new Date();
		this.update()
			.then(function() {
				deffered.resolve();
			});
		return deffered.promise;
	};

	/**************************************************************************
	 *                              CLASS METHODS                             *
	 **************************************************************************/

	SentMessage.query = function() {
		var deffered = $q.defer(),
			filter = ['Semester/Id', 'eq', currentSemester.data.Id],
			expand = ['Message', 'Employee', 'Semester'];
		$super.queryFilter.call(this, listName, filter, expand, SentMessage.prototype.propertyList)

		// $super.query.call(this, listName)
		.then(function(data) {
			list.splice(0, list.length);
			_.each(data, function(datum) {
				var sMessage = new SentMessage(datum);
				if (sMessage.Employee) {
					list.push(sMessage);
				}
			});
			deffered.resolve();
		});
		return deffered.promise;

		// TODO: create the query class method test suite
	};

	SentMessage.queryAll = function(returnArray) {
		returnArray = returnArray || list;
		var deffered = $q.defer();
		$super.query.call(this, listName).then(function(data) {
			returnArray.splice(0, returnArray.length);
			_.each(data, function(datum) {
				var sMessage = new SentMessage(datum);
				if (sMessage.Employee) {
					returnArray.push(sMessage);
				}
			});
			deffered.resolve(returnArray);
		});
		return deffered.promise;

		// TODO: create the query class method test suite
	};

	// Return the newly defined SentMessage object
	return SentMessage;
});
