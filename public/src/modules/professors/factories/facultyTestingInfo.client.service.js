/* global angular, _ */

(function() {
	'use strict';

	angular.module('professors')
		.factory('FacultyTestingInfo', ['$q', '$alert', 'Data', 'facultyTestingInfos', 'professors',
			function($q, $alert, Data, facultyTestingInfos, professors) {

				// variables attempt make code more readable
				var $super = Data,
					listName = 'FacultyTestingInfo',
					list = facultyTestingInfos.list;

				// declare the new FacultyTestingInfo object{{{
				function FacultyTestingInfo() {
					var newData = arguments[0] || {};
					$super.call(this, newData, list, listName);
					this.parent = $super.prototype;

					// initialize the attributes of the new FacultyTestingInfo object
					this.initAttributes();
				}

				//}}}

				// set the prototype of the new FacultyTestingInfo object to match it's parent.{{{
				FacultyTestingInfo.prototype = Object.create($super.prototype);

				//}}}

				// assign FacultyTestingInfo as its own constructor{{{
				FacultyTestingInfo.prototype.constructor = FacultyTestingInfo;

				//}}}

				// override the initAttributes method from parent object{{{
				FacultyTestingInfo.prototype.initAttributes = function() {
					var facultyTestingInfo = this;
					this.parent.initAttributes.apply(this);

					/*********************Values stored on DB**********************/
					this.ProfessorId = this.newData.ProfessorId || undefined;
					this.Stipulation = this.newData.Stipulation || 'No stipulation.';
					this.Other = this.newData.Other || undefined;

					/****************Values derived from other tables**************/
					this.Professor = (this.newData.ProfessorId) ? _.find(professors.list, function(professor) {
						return professor.Id === facultyTestingInfo.ProfessorId;
					}) : undefined;

					/*******************Values that don't persist******************/
					this.data = this.updateData();
				}; //}}}

				// override the updateData method from parent object{{{
				FacultyTestingInfo.prototype.updateData = function() {
					var returnData = this.parent.updateData.apply(this);
					returnData.ProfessorId = this.ProfessorId;
					returnData.Stipulation = this.Stipulation;
					returnData.Other = this.Other;
					return returnData;
				}; //}}}

				// override the toString method from parent object{{{
				FacultyTestingInfo.prototype.toString = function() {
					if (this.Professor) {
						return this.Professor.toString() + '\'s testing information';
					} else {
						return 'New FacultyTestingInfo';
					}
				}; //}}}

				// return the newly defined FacultyTestingInfo object{{{
				return FacultyTestingInfo; //}}}

			}
		]);
})();

// vim:foldmethod=marker:foldlevel=0
