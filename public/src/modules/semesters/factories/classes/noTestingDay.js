/* global angular, _ */

(function() {
	'use strict';

	angular.module('core')
		.factory('NoTestingDay', ['Data', 'noTestingDays', 'semesters',
			function(Data, noTestingDays, semesters) {

				// variables attempt make code more readable
				var $super = Data,
					listName = 'NoTestingDay',
					list = noTestingDays.list;

				// declare the new NoTestingDay object{{{
				function NoTestingDay() {
						var newData = arguments[0] || {};
						$super.call(this, newData, list, listName);
						this.parent = $super.prototype;

						// initialize the attributes of the new NoTestingDay object{{{
						this.initAttributes(); //}}}
					}
					//}}}

				// set the prototype of the new NoTestingDay object to match it's parent.{{{
				NoTestingDay.prototype = Object.create($super.prototype);
				//}}}

				// assign NoTestingDay as its own constructor{{{
				NoTestingDay.prototype.constructor = NoTestingDay;
				//}}}

				// override the initAttributes method from parent object{{{
				NoTestingDay.prototype.initAttributes = function() {
					var noTestingDay = this;
					this.parent.initAttributes.apply(this);

					/*********************Values stored on DB**********************/
					this.Title = this.newData.Title || undefined;
					this.Date = (this.newData.Date) ? Date.parse(this.newData.Date) : undefined;
					this.Description = this.newData.Description || undefined;
					this.SemesterId = this.newData.SemesterId || undefined;

					/****************Values derived from other tables**************/
					this.Semester = (this.newData.SemesterId) ? _.find(semesters.list, function(semester) {
						return semester.Id === noTestingDay.SemesterId;
					}) : {};

					/*******************Values that don't persist******************/
					this.data = this.updateData();
				}; //}}}

				// override the updateData method from parent object{{{
				NoTestingDay.prototype.updateData = function() {
					var returnData = this.parent.updateData.apply(this);
					returnData.Date = this.Date;
					returnData.Description = this.Description;
					returnData.SemesterId = this.SemesterId;
					returnData.Title = this.Title;
					return returnData;
				}; //}}}

				// override the toString method from parent object{{{
				NoTestingDay.prototype.toString = function() {
					if (this.Title) {
					return this.Title;
				} else {
					return 'New no testing day';
				}
				}; //}}}

				// return the newly defined NoTestingDay object{{{
				return NoTestingDay; //}}}
			}
		]);
})();


// vim:foldmethod=marker:foldlevel=0
