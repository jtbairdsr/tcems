/* global angular, _ */

(function() {
	'use strict';

	angular.module('core')
	.factory('Shift', ['$q', 'Data', 'shifts', 'schedules', 'positions', 'shiftGroups',
		function($q, Data, shifts, schedules, positions, shiftGroups) {

			// declare the new Shift object{{{
			function Shift() {
				// variables attempt make code more readable
				var $super = Data,
					listname = 'Shift',
					list = shifts;
				this.parent = $super.prototype;
				$super.call(this, arguments, list, listname);
			}
			//}}}

			// set the prototype of the new Shift object to match it's parent.{{{
			Shift.prototype = Object.create(Shift.parent);
			//}}}

			// assign Shift as its own constructor{{{
			Shift.prototype.constructor = Shift;
			//}}}

			// override the initattributes method from parent object{{{
			Shift.prototype.initAttributes = function() {
				var shift = this;
				this.parent.initAttributes.apply(this);

				/*********************values stored on db**********************/
				this.Active = (this.newData.Current !== this.newData.Active) ? this.newData.Current : this.newData.Active || false;
				this.Current = this.newData.Current || false;
				this.Day = this.newData.Day || undefined;
				this.EndTime = (this.newData.EndTime) ? Date.parse(this.newData.Endtime) : undefined;
				this.PositionId = this.newData.PositionId || undefined;
				this.Slots = this.newData.Slots || undefined;
				this.ShiftGroupId = this.newData.ShiftGroupId || undefined;
				this.StartTime = (this.newData.StartTime) ? Date.parse(this.newData.StartTime) : undefined;

				/****************values derived from other tables**************/
				this.ShiftGroup = (this.newData.ShiftGroupId) ? _.find(shiftGroups, function(shiftGroup) {
					return shiftGroup.Id === shift.ShiftGroupId;
				}) : {};
				this.Position = (this.newData.PositionId) ? _.find(positions, function(position) {
					return position.Id === shift.PositionId;
				}) : {};

				/*******************values that don't persist******************/
				this.AvailableSlots = 0;
				this.Days = (this.newData.Day) ? this.newData.Day.replace(/\s/g, '').split('-') : [];
				this.setAvailableSlots();
				this.data = this.updateData();
			}; //}}}

			// override the updateData method from parent object{{{
			Shift.prototype.updateData = function() {
				var returnData = this.parent.updateData.apply(this);
				returnData.Active = this.Active;
				returnData.Current = this.Current;
				returnData.Day = this.Day;
				returnData.EndTime = this.EndTime;
				returnData.PositionId = this.PositionId;
				returnData.Slots = this.Slots;
				returnData.ShiftGroupId = this.ShiftGroupId;
				returnData.Starttime = this.StartTime;
				return returnData;
			}; //}}}

			// override the toString method from parent object{{{
			Shift.prototype.toString = function() {
				if (this.id === undefined) {
					return 'new shift';
				} else {
					return this.Position.Description + ': ' + this.Day.replace(/\s/g, '').replace(/[-]/g, ', ') +
					'\n' + this.StartTime.toString('h:mm') + ' - ' + this.EndTime.toString('h:mm');
				}
			}; //}}}

			// override the add method from parent object{{{
			Shift.prototype.add = function() {//{{{
				var deffered = $q.defer();
				this.Active = true;
				this.Current = true;
				this.parent.add.apply(this)
					.then(function() {
						deffered.resolve();
					});
				return deffered.promise;
			};//}}}

			// create the deactivate method{{{
			Shift.prototype.deactivate = function() {
				var shift = this,
					deffered = $q.defer(),
					dataCalls = [];
				_.each(schedules, function(schedule) {
					if (schedule.ShiftId === shift.Id &&
						schedule.Active) {
						dataCalls.push(schedule.deactivate());
					}
				});
				$q.all(dataCalls)
					.then(function() {
						this.Active = false;
						this.Current = false;
						this.update();
						deffered.resolve();
					});
				return deffered.promise;
			};//}}}

			// create the setAvailableSlots method{{{
			Shift.prototype.setAvailableSlots = function() {//{{{
				var shift = this;
				this.AvailableSlots = this.Slots - _.filter(schedules, function(schedule) {
					return (
						schedule.ShiftId === shift.Id &&
						schedule.Active
					);
				}).length;
			};//}}}

			// initialize the attributes of the new Shift object{{{
			Shift.initAttributes(); //}}}

			// return the newly defined Shift object{{{
			return Shift; //}}}
		}
	]);
})();


// vim:foldmethod=marker:foldlevel=0