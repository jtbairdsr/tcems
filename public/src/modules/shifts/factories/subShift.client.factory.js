/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-29 12:22:38
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-13 16:42:03
 */

'use strict';

angular.module('core').factory('SubShift', function(
	$q, $alert, Data, subShifts, employees, semesters, shifts, currentUser
) {

	// Variables attempt make code more readable
	var $super = Data,
		listName = 'SubShift',
		list = subShifts.list;

	// Declare the new SubShift object
	function SubShift(newData) {
		newData = newData || {};
		$super.call(this, newData, list, listName);
		this.parent = $super.prototype;

		// Initialize the attributes of the new SubShift object
		this.initAttributes();
	}

	// Set the prototype of the new SubShift object to match it's parent.
	SubShift.prototype = Object.create($super.prototype);

	// Assign SubShift as its own constructor
	SubShift.prototype.constructor = SubShift;

	/**************************************************************************
	 *                             INSTANCE METHODS                           *
	 **************************************************************************/

	// Override the initAttributes method from parent object
	SubShift.prototype.initAttributes = function() {
		var that = this;
		this.parent.initAttributes.apply(this);

		/*********************Values stored on db**********************/
		this.Active = (this.newData.Active !== undefined) ? this.newData.Active : true;
		this.Date = (this.newData.Date) ? Date.parse(this.newData.Date) : undefined;
		this.NewRequestId = this.newData.NewRequestId || undefined;
		this.RequesterId = this.newData.RequesterId || undefined;
		this.SemesterId = this.newData.SemesterId || undefined;
		this.ShiftId = this.newData.ShiftId || undefined;
		this.SubstituteId = this.newData.SubstituteId || undefined;

		/****************Values derived from other tables**************/
		this.NewRequest = (this.newData.NewRequestId) ? _.find(subShifts.list, function(newRequest) {
			return newRequest.Id === that.NewRequestId;
		}) : undefined;
		this.Requester = (this.newData.RequesterId) ? _.find(employees.list, function(employee) {
			return employee.Id === that.RequesterId;
		}) : {};
		this.Semester = (this.newData.SemesterId) ? _.find(semesters.list, function(semester) {
			return semester.Id === that.SemesterId;
		}) : {};
		this.Shift = (this.newData.ShiftId) ? _.find(shifts.list, function(shift) {
			return shift.Id === that.ShiftId;
		}) : {};
		this.Substitute = (this.newData.SubstituteId) ? _.find(employees.list, function(employee) {
			return employee.Id === that.SubstituteId;
		}) : {};

		/*******************Values that don't persist******************/
		this.data = this.updateData();
	};

	// Override the updateData method from parent object
	SubShift.prototype.updateData = function() {
		var returnData = this.parent.updateData.apply(this);
		returnData.Active = this.Active;
		returnData.Date = this.Date;
		returnData.NewRequestId = this.NewRequestId;
		returnData.RequesterId = this.RequesterId;
		returnData.SemesterId = this.SemesterId;
		returnData.ShiftId = this.ShiftId;
		returnData.SubstituteId = this.SubstituteId;
		return returnData;
	};

	// Override the toString method from parent object
	SubShift.prototype.toString = function() {
		if (this.RequesterId) {
			if (this.SubstituteId) {
				return this.Substitute.toString() + ' subbing for '
				+ this.Requester.toString() + '\n' + this.Date.toString('dddd MMM dS')
				+ ' from ' + this.Shift.toString().split('\n')[1];
			} else {
				return this.Requester.toString() + '\'s sub request for:\n'
				+ this.Date.toString('dddd MMM dS') + ' ' + this.Shift.toString().split('\n')[1];
			}
		} else {
			return 'New SubShift';
		}
	};

	// Override the add method from parent object
	SubShift.prototype.add = function() {
		var deffered = $q.defer();
		this.Active = true;
		this.parent.add.apply(this).then(function() {
			deffered.resolve();
		});
		return deffered.promise;
	};

	// Create the deactivate method
	SubShift.prototype.deactivate = function(hideAlert) {
		var deffered = $q.defer();
		hideAlert = hideAlert || false;
		this.Active = false;
		this.update(hideAlert).then(function() {
			deffered.resolve();
		});
		return deffered.promise;
	};

	// Create the newRequest method
	SubShift.prototype.newRequest = function() {
		var deffered = $q.defer(),
			that = this,
			newRequest = new SubShift({
				Date: that.Date,
				RequesterId: currentUser.data.Id,
				ShiftId: that.ShiftId,
				SemesterId: that.SemesterId
			});
		newRequest.add().then(function() {
			that.NewRequestId = newRequest.Id;
			that.update(true).then(function() {
				deffered.resolve();
			});
		});
		return deffered.promise;
	};

	// Create the cancel method
	SubShift.prototype.cancel = function() {
		var deffered = $q.defer();
		if (currentUser.data.Id === this.Requester.Id &&
			this.SubstituteId === undefined) {
			this.deactivate().then(function() {
				deffered.resolve();
			});
		} else {
			$alert({
				show: true,
				placement: 'top-right',
				content: 'You can\'t cancel this SubShift \nEither it is already taken or you didn\'t request it',
				animation: 'am-fade-and-slide-top',
				duration: '3',
				type: 'success',
				template: 'src/modules/core/views/alert/error-alert.client.view.html'
			});
			deffered.resolve();
		}
		return deffered.promise;
	};

	/**************************************************************************
	 *                              CLASS METHODS                             *
	 **************************************************************************/

	SubShift.query = function() {
		var deffered = $q.defer();
		$super.query.call(this, listName).then(function(data) {
			data.reverse();
			list.splice(0, list.length);
			_.each(data, function(datum) {
				list.push(new SubShift(datum));
			});
			deffered.resolve();
		});
		return deffered.promise;

		// TODO: create the setIntent method test suite
	};

	// Return the newly defined SubShift object
	return SubShift;
});
