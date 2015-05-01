/* global angular, _ */

(function() {
	'use strict';

	angular.module('core')
	.factory('SubShift', [
		function($q, $alert, Data, subShifts, employees, semesters,
			shifts, currentUser) {

			// declare the new SubShift object{{{
			function SubShift() {
				// variables attempt make code more readable
				var $super = Data,
					listname = 'SubShift',
					list = subShifts;
				this.parent = $super.prototype;
				$super.call(this, arguments, list, listname);
			} //}}}

			// set the prototype of the new SubShift object to match it's parent.{{{
			SubShift.prototype = Object.create(SubShift.parent); //}}}

			// assign SubShift as its own constructor{{{
			SubShift.prototype.constructor = SubShift; //}}}

			// override the initAttributes method from parent object{{{
			SubShift.prototype.initAttributes = function() {
				var subShift = this;
				this.parent.initAttributes.apply(this);

				/*********************values stored on db**********************/
				this.Active = (this.newData.Active !== undefined) ? this.newData.Active : true;
				this.Date = (this.newData.Date) ? Date.parse(this.newData.Date) : undefined;
				this.NewRequestId = this.newData.NewRequestId || undefined;
				this.RequesterId = this.newData.RequesterId || undefined;
				this.SemesterId = this.newData.SemesterId || undefined;
				this.ShiftId = this.newData.ShiftId || undefined;
				this.SubstituteId = this.newData.SubstituteId || undefined;

				/****************values derived from other tables**************/
				this.NewRequest = (this.newData.NewRequestId) ? _.find(subShifts, function(newRequest) {
					return newRequest.Id === subShift.NewRequestId;
				}) : {};
				this.Requester = (this.newData.RequesterId) ? _.find(employees, function(employee) {
					return employee.Id === subShift.RequesterId;
				}) : {};
				this.Semester = (this.newData.SemesterId) ? _.find(semesters, function(semester) {
					return semester.Id === subShift.SemesterId;
				}) : {};
				this.Shift = (this.newData.ShiftId) ? _.find(shifts, function(shift) {
					return shift.Id === subShift.ShiftId;
				}) : {};
				this.Substitute = (this.newData.SubstituteId) ? _.find(employees, function(employee) {
					return employee.Id === subShift.SubstituteId;
				}) : {};

				/*******************values that don't persist******************/
				this.data = this.updateData();
			}; //}}}

			// override the updateData method from parent object{{{
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
			}; //}}}

			// override the toString method from parent object{{{
			SubShift.prototype.toString = function() {
				if (this.SubstituteId) {
					return this.Substitute.toString().split(': ')[1] + ' subbing for ' + this.Requester.toString().split(': ')[1] + '\n' + this.Date.toString('dddd MMM dS') + ' from ' + this.Shift.toString().split('\n')[1];
				} else if (this.RequesterId) {
					return this.Requester.toString().split(': ')[1] + ' Sub Request\n' + this.Date.toString('dddd') + ' ' + this.Shift.toString().split('\n')[1];
				} else {
					return 'New SubShift';
				}
			}; //}}}

			// override the add method from parent object{{{
			SubShift.prototype.add = function() {//{{{
				var deffered = $q.defer();
				this.Active = true;
				this.parent.add.apply(this)
					.then(function() {
						deffered.resolve();
					});
				return deffered.promise;
			};//}}}

			// create the deactivate method{{{
			SubShift.prototype.deactivate = function(hideAlert) {
				var deffered = $q.defer();
				hideAlert = hideAlert || false;
				this.Active = false;
				this.update(hideAlert)
					.then(function() {
						deffered.resolve();
					});
				return deffered.promise;
			};//}}}

			// create the newRequest method{{{
			SubShift.prototype.newRequest = function() {
				var deffered = $q.defer(),
					subShift = this,
					newRequest = new SubShift({
						Date: subShift.Date,
						RequesterId: currentUser.Id,
						ShiftId: subShift.ShiftId,
						SemesterId: subShift.SemesterId
					});

				newRequest.add()
					.then(function() {
						subShift.NewRequestId = newRequest.Id;
						subShift.update(true)
							.then(function() {
								deffered.resolve();
							});
					});
				return deffered.promise;
			};//}}}

			// create the cancel method{{{
			SubShift.prototype.cancel = function() {
				var deffered = $q.defer();
				if (currentUser.Id === this.Requester.Id &&
					this.SubstituteId === undefined) {
					this.deactivate()
						.then(function() {
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
							template: 'partials/alerts/danger-alert.html'
						});
						deffered.resolve();
					}
				return deffered.promise;
			};//}}}

			// initialize the attributes of the new SubShift object{{{
			SubShift.initAttributes(); //}}}

			// return the newly defined SubShift object{{{
			return SubShift; //}}}
		}
	]);
})();


// vim:foldmethod=marker:foldlevel=0