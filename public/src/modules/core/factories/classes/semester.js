/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-29 08:31:34
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-04-29 12:22:53
 */

'use strict';

angular.module('core').factory('Semester', ['$q', 'Data', 'semesters', 'shiftGroups',
	function($q, Data, semesters, shiftGroups) {

		// declare the new Semester object
		function Semester() {
			// variables attempt make code more readable
			var $super = Data,
				listName = 'Semester',
				list = semesters;
			this.parent = $super.prototype;
			$super.call(this, arguments, list, listName);
		}

		// set the prototype of the new Semester object to match it's parent.
		Semester.prototype = Object.create(Semester.parent);

		// assign Semester as its own constructor
		Semester.prototype.constructor = Semester;

		// override the initAttributes method from parent object
		Semester.prototype.initAttributes = function() {
			var semester = this;
			this.parent.initAttributes.apply(this);

			/*********************Values stored on DB**********************/
			this.Active = this.newData.Active || false;
			this.Description = this.newData.Description || undefined;
			this.FirstDay = (this.newData.FirstDay) ? Date.parse(this.newData.FirstDay) : undefined;
			this.LastDay = (this.newData.LastDay) ? Date.parse(this.newData.LastDay) : undefined;
			this.NextSemesterId = this.newData.NextSemesterId || undefined;
			this.ShiftGroupId = this.newData.ShiftGroupId || undefined;
			this.Year = this.newData.Year || undefined;

			/****************Values derived from other tables**************/
			this.NextSemester = (this.newData.NextSemesterId) ? _.find(semesters, function(semseter) {
				return semseter.Id === semester.NextSemesterId;
			}) : {};
			this.ShiftGroup = (this.newData.ShiftGroupId) ? _.find(shiftGroups, function(shiftGroup) {
				return shiftGroup.Id === semester.ShiftGroupId;
			}) : {};

			/*******************Values that don't persist******************/
			this.data = this.updateData();
		};

		// override the updateData method from parent object
		Semester.prototype.updateData = function() {
			var returnData = this.parent.updateData.apply(this);
			returnData.Active = this.Active;
			returnData.FirstDay = this.FirstDay;
			returnData.LastDay = this.LastDay;
			returnData.NextSemesterId = this.NextSemesterId;
			returnData.ShiftGroupId = this.ShiftGroupId;
			returnData.Year = this.Year;
			return returnData;
		};

		// override the toString method from parent object
		Semester.prototype.toString = function() {
			return this.ShiftGroup.Description + ' ' + this.Year + ' Semester';
		};

		// override the deactivate method from parent object
		Semester.prototype.deactivate = function() {
			this.Active = false;
			this.update();
		};

		// initialize the attributes of the new Semester object
		Semester.initAttributes();

		// return the newly defined Semester object
		return Semester;
	}
]);
