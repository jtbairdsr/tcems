/* global angular, _ */

(function() {
	'use strict';

	angular.module('core')
	.factory('Schedule', ['$q', 'Data', 'schedules', 'employees', 'shifts', 'semesters',
		function($q, Data, schedules, employees, shifts, semesters) {

			// declare the new Schedule object{{{
			function Schedule() {
				// variables attempt make code more readable
				var $super = Data,
					listName = 'Schedule',
					list = schedules;
				this.parent = $super.prototype;
				$super.call(this, arguments, list, listName);
			}
			//}}}

			// set the prototype of the new Schedule object to match it's parent.{{{
			Schedule.prototype = Object.create(Schedule.parent);
			//}}}

			// assign Schedule as its own constructor{{{
			Schedule.prototype.constructor = Schedule;
			//}}}

			// override the initAttributes method from parent object{{{
			Schedule.prototype.initAttributes = function() {
				var schedule = this;
				this.parent.initAttributes.apply(this);

				/*********************Values stored on DB**********************/
				this.Active = this.newData.Active || false;
				this.EmployeeId = this.newData.EmployeeId || undefined;
				this.ShiftId = this.newData.ShiftId || undefined;
				this.SemesterId = this.newData.SemesterId || undefined;

				/****************Values derived from other tables**************/
				this.Employee = _.find(employees, function(employee) {
					return employee.Id === schedule.EmployeeId;
				}) || {};
				this.Shift = _.find(shifts, function(shift) {
					return shift.Id === schedule.ShiftId;
				}) || {};
				this.Semester = (this.newData.SemesterId) ? _.find(semesters, function(semester) {
					return semester.Id === schedule.SemesterId;
				}) : {};

				/*******************Values that don't persist******************/
				this.data = this.updateData();
			}; //}}}

			// override the updateData method from parent object{{{
			Schedule.prototype.updateData = function() {
				var returnData = this.parent.updateData.apply(this);
				returnData.Active = this.Active;
				returnData.EmployeeId = this.EmployeeId;
				returnData.ShiftId = this.ShiftId;
				returnData.SemesterId = this.SemesterId;
				return returnData;
			}; //}}}

			// override the toString method from parent object{{{
			Schedule.prototype.toString = function() {
				return this.Employee.toString() + '\'s schedule';
			}; //}}}

			// override the add method from parent object{{{
			Schedule.prototype.add = function() {
				var deffered = $q.defer();
				this.Active = true;
				this.parent.add.apply(this)
					.then(function() {
						deffered.resolve();
					});
				return deffered.promise;
			};//}}}

			// create the deactivate method{{{
			Schedule.prototype.deactivate = function(hideAlert) {
				var deffered = $q.defer();
				hideAlert = hideAlert || false;
				this.Active = false;
				this.update(hideAlert)
					.then(function() {
						deffered.resolve();
					});
				return deffered.promise;
			};//}}}

			// initialize the attributes of the new Schedule object{{{
			Schedule.initAttributes(); //}}}

			// return the newly defined Schedule object{{{
			return Schedule; //}}}
		}
	]);
})();


// vim:foldmethod=marker:foldlevel=0