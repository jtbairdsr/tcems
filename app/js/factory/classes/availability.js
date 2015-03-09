/* global angular, _ */

(function() {
	'use strict';

	angular.module('Services')
	.factory('Availability', ['$q', '$alert', 'generalService', 'dataService', 'Data',
		function($q, $alert, generalService, dataService, Data){
			// define local aliases to subsets in the data on generalService//{{{
			var DATA = generalService.data;//}}}

			// declare the new Availability object//{{{
			function Availability() {
				// variables attempt make code more readable
				var $super = Data,
					listname = 'Availability';
				this.parent = $super.prototype;
				$super.call(this, arguments, listname);
			}//}}}

			// set the prototype of the new Availability object to match it's parent.//{{{
			Availability.prototype = Object.create(Availability.parent);//}}}

			// assign Availability as its own constructor//{{{
			Availability.prototype.constructor = Availability;//}}}

			// override the initPublicAttributes method from parent object//{{{
			Availability.prototype.initPublicAttributes = function() {
				var availability = this;
				this.parent.initPublicAttributes.apply(this);
				/***********Attributes that are stored in the DB**************/
				this.Active = this.newData.Active || this.newData.Current || false;
				this.Current = this.newData.Current || false;
				this.Day = this.newData || undefined;
				this.EmployeeId = this.newData.EmployeeId || undefined;
				this.EndTime = (this.newData.EndTime) ? Date.parse(this.newData.EndTime) : undefined;
				this.SemesterId = this.newData.SemesterId || undefined;
				/*************Attributes that are other objects***************/
				this.Employee = (this.newData.EmployeeId) ? _.find(DATA.employees, function(employee) {
					return employee.Id === object.EmployeeId;
				}) : {};
				this.Semester = (this.newData.SemesterId) ? _.find(DATA.semesters, function(semseter) {
					return semseter.Id === object.SemesterId;
				}) : {};
				this.StartTime = (this.newData.StartTime) ? Date.parse(this.newData.StartTime) : undefined;
				this.data = this.updateData();
			};//}}}

			// override the updateData method from parent object//{{{
			Availability.prototype.updateData = function() {
				var returnData = this.parent.updateData.apply(this);
				returnData.Active = this.Current;
				returnData.Current = this.Current;
				returnData.Day = this.Day;
				returnData.EmployeeId = this.EmployeeId;
				returnData.EndTime = this.EndTime;
				returnData.SemesterId = this.SemesterId;
				returnData.StartTime = this.StartTime;
				return returnData;
			};//}}}

			// override the toString method from parent object//{{{
			Availability.prototype.toString = function() {
				return this.Employee.toString() + '\'s availability';
			};//}}}

			// create the add method //{{{
			Availability.prototype.add = function() {
				var deffered = $q.defer();
				this.Active = true;
				this.Current = true;
				this.parent.add.apply(this)
					.then(function() {
						deffered.resolve();
					});
				return deffered.promise;
			};//}}}

			// create the deactivate method //{{{
			Availability.prototype.deactivate = function(hideAlert) {
				var deffered = $q.defer();
				hideAlert = hideAlert || false;
				this.Active = false;
				this.Current = false;
				this.update(hideAlert)
					.then(function() {
						deffered.resolve();
					});
				return deffered.promise;
			};//}}}
		}
	]);
})();

// vim:foldmethod=marker:foldlevel=0
