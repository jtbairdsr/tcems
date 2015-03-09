/* global angular, _ */

(function() {
	'use strict';

	angular.module('App')
	.factory('Employment', ['$q', '$alert', 'generalService', 'dataService', 'Data',
		function($q, $alert, generalService, dataService, Data) {
			// define local aliases to subsets in the data on generalService//{{{
			var DATA = generalService.data;//}}}

			// declare the new Availability object//{{{
			function Employment(){
				var $super = Data,
					listname = 'Employment';
				this.parent = $super.prototype;
				$super.call(this, arguments, listname);
			}//}}}

			// set the prototype of the new Availability object to match it's parent.//{{{
			Employment.prototype = Object.create(Employment.parent);//}}}

			// assign Availability as its own constructor//{{{
			Employment.prototype.constructor = Employment;//}}}

			// override the initPublicAttributes method from parent object//{{{
			Employment.prototype.initPublicAttributes = function() {
				var area = this;
				this.parent.initPublicAttributes.apply(this);
				/*********************Values stored on DB*********************/
				this.AreaId = this.newData.AreaId || undefined;
				this.EmployeeId = this.newData.EmployeeId || undefined;
				this.EndDate = (this.newData.EndDate) ? Date.parse(this.newData.EndDate) : undefined;
				this.PositionId = this.newData.PositionId || undefined;
				this.StartDate = (this.newData.StartDate) ? Date.parse(this.newData.StartDate) : undefined;
				/**********Values derived from other tables/employees*********/
				this.Area = (this.newData.AreaId) ? _.find(DATA.areas, function(area) {
					return area.Id === object.AreaId;
				}) : {};
				this.Employee = (this.newData.EmployeeId) ? _.find(DATA.employees, function(employee) {
					return employee.Id === object.EmployeeId;
				}) : {};
				this.Position = (this.newData.PositionId) ? _.find(DATA.positions, function(position) {
					return position.Id === object.PositionId;
				}) : {};
				this.data = this.updateData();
			};//}}}

			// override the updateData method from parent object//{{{
			Employment.prototype.updateData = function() {
				var returnData = this.parent.updateData.apply(this);
				returnData.AreaId = this.AreaId;
				returnData.EmployeeId = this.EmployeeId;
				returnData.EndDate = this.EndDate;
				returnData.StartDate = this.StartDate;
				returnData.PositionId = this.PositionId;
				return returnData;
			};//}}}

			// override the toString method from parent object//{{{
			Employment.prototype.toString = function() {
				return this.Employee.toString() + '\'s employment';
			};//}}}

			// create the start method //{{{
			Employment.prototype.start = function(hideAlert) {
				var deffered = $q.defer();
				hideAlert = hideAlert || false;
				this.StartDate = new Date();
				this.add(hideAlert)
					.then(function() {
						deffered.resolve();
					});
				return deffered.promise;
			};//}}}

			// create the end method //{{{
			CLASSES.Employment.method('end', function(hideAlert) {
				var deffered = $q.defer();
				hideAlert = hideAlert || false;
				this.EndDate = new Date();
				this.update(hideAlert)
					.then(function() {
						deffered.resolve();
					});
				return deffered.promise;
			});//}}}

			return Employment;
		}
	]);

})();

// vim:foldmethod=marker:foldlevel=0
