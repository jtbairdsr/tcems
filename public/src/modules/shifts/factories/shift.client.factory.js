/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-29 12:22:47
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-21 11:53:37
 */
'use strict';

angular.module('shifts').factory('Shift', function($q, Data, shifts, schedules, positions, shiftGroups) {

	// Variables attempt make code more readable
	var $super = Data,
		listName = 'Shift',
		list = shifts.list;

	// Declare the new Shift object
	function Shift(newData) {
		newData = newData || {};
		$super.call(this, newData, list, listName);
		this.parent = $super.prototype;

		// Initialize the attributes of the new Shift object
		this.initAttributes();
	}

	// Set the prototype of the new Shift object to match it's parent.
	Shift.prototype = Object.create($super.prototype);

	// Assign Shift as its own constructor
	Shift.prototype.constructor = Shift;

	/**************************************************************************
	 *                             INSTANCE METHODS                           *
	 **************************************************************************/

	// Override the initattributes method from parent object
	Shift.prototype.initAttributes = function() {
		var that = this;
		this.parent.initAttributes.apply(this);

		/******************** Values stored on db *********************/
		this.Active = (this.newData.Current !== this.newData.Active) ? this.newData.Current : this.newData.Active || false;
		this.Current = this.newData.Current || false;
		this.Day = this.newData.Day || undefined;
		this.EndTime = (this.newData.EndTime) ? Date.parse(this.newData.EndTime) : undefined;
		this.PositionId = this.newData.PositionId || undefined;
		this.Slots = this.newData.Slots || undefined;
		this.ShiftGroupId = this.newData.ShiftGroupId || undefined;
		this.StartTime = (this.newData.StartTime) ? Date.parse(this.newData.StartTime) : undefined;

		/****************Values derived from other tables *************/
		this.ShiftGroup = (this.newData.ShiftGroupId) ? _.find(shiftGroups.list, function(shiftGroup) {
			return shiftGroup.Id === that.ShiftGroupId;
		}) : undefined;
		this.Position = (this.newData.PositionId) ? _.find(positions.list, function(position) {
			return position.Id === that.PositionId;
		}) : undefined;

		/****************** Values that don't persist *****************/
		this.AvailableSlots = 0;
		this.Days = (this.newData.Day) ? this.newData.Day.replace(/\s/g, '').split('-') : [];
		this.setAvailableSlots();
		this.data = this.updateData();
	};

	// Override the updateData method from parent object
	Shift.prototype.updateData = function() {
		var returnData = this.parent.updateData.apply(this);
		returnData.Active = this.Active;
		returnData.Current = this.Current;
		returnData.Day = this.Day;
		returnData.EndTime = this.EndTime;
		returnData.PositionId = this.PositionId;
		returnData.Slots = this.Slots;
		returnData.ShiftGroupId = this.ShiftGroupId;
		returnData.StartTime = this.StartTime;
		return returnData;
	};

	// Override the toString method from parent object
	Shift.prototype.toString = function() {
		if (this.Position && this.Day) {
			return this.Position.Description + ': ' + this.Day.replace(/\s/g, '')
				.replace(/[-]/g, ', ') + '\n' + this.StartTime.toString('h:mm') + ' - ' + this.EndTime.toString('h:mm');
		} else {
			return 'New shift';
		}
	};

	// Override the add method from parent object
	Shift.prototype.add = function(hideAlert) {
		hideAlert = hideAlert || false;
		var deffered = $q.defer();
		this.Active = true;
		this.Current = true;
		this.parent.add.call(this, hideAlert)
			.then(function() {
				deffered.resolve();
			});
		return deffered.promise;
	};

	// Create the deactivate method
	Shift.prototype.deactivate = function(hideAlert) {
		hideAlert = hideAlert || false;
		var that = this,
			deffered = $q.defer(),
			dataCalls = [];
		_.each(schedules.list, function(schedule) {
			if (schedule.ShiftId === that.Id &&
				schedule.Active) {
				dataCalls.push(schedule.deactivate(hideAlert));
			}
		});
		$q.all(dataCalls)
			.then(function() {
				that.Active = false;
				that.Current = false;
				that.update(hideAlert).then(function() {
					deffered.resolve();
				});
			});
		return deffered.promise;
	};

	// Create the setAvailableSlots method
	Shift.prototype.setAvailableSlots = function() {
		var that = this;
		this.AvailableSlots = this.Slots - _.filter(schedules.list, function(schedule) {
			return (
				schedule.ShiftId === that.Id &&
				schedule.Active
			);
		}).length;
	};

	/**************************************************************************
	 *                              CLASS METHODS                             *
	 **************************************************************************/

	Shift.query = function() {
		var deffered = $q.defer();
		$super.query.call(this, listName)
			.then(function(data) {
				list.splice(0, list.length);
				_.each(data, function(datum) {
					list.push(new Shift(datum));
				});
				deffered.resolve();
			});
		return deffered.promise;
	};

	// Return the newly defined Shift object
	return Shift;
});
