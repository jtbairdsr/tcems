/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-29 08:33:23
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-01 14:53:57
 */

'use strict';

angular.module('core').factory('ShiftGroup', function($q, Data, shiftGroups) {

	// Variables attempt make code more readable
	var $super = Data,
		listName = 'ShiftGroup',
		list = shiftGroups.list;

	// Declare the new ShiftGroup object
	function ShiftGroup(newData) {
		newData = newData || {};
		$super.call(this, newData, list, listName);
		this.parent = $super.prototype;

		// Initialize the attributes of the new ShiftGroup object
		this.initAttributes();
	}

	// Set the prototype of the new ShiftGroup object to match it's parent.
	ShiftGroup.prototype = Object.create($super.prototype);

	// Assign ShiftGroup as its own constructor
	ShiftGroup.prototype.constructor = ShiftGroup;

	/**************************************************************************
	 *                             INSTANCE METHODS                           *
	 **************************************************************************/

	// Override the initAttributes method from parent object
	ShiftGroup.prototype.initAttributes = function() {
		this.parent.initAttributes.apply(this);

		/*********************Values stored on db**********************/
		this.Description = this.newData.Description || undefined;

		/*******************Values that don't persist******************/
		this.data = this.updateData();
	};

	// Override the updateData method from parent object
	ShiftGroup.prototype.updateData = function() {
		var returnData = this.parent.updateData.apply(this);
		returnData.Description = this.Description;
		return returnData;
	};

	// Override the toString method from parent object
	ShiftGroup.prototype.toString = function() {
		return 'The ' + this.Description + ' semester type';
	};

	/**************************************************************************
	 *                              CLASS METHODS                             *
	 **************************************************************************/

	ShiftGroup.query = function() {
		var deffered = $q.defer();
		$super.query.call(this, listName)
			.then(function(data) {
				list.splice(0, list.length);
				_.each(data, function(employee) {
					list.push(new ShiftGroup(employee));
				});
				deffered.resolve();
			});
		return deffered.promise;

		// TODO: create the setIntent method test suite
	};

	// Return the newly defined ShiftGroup object
	return ShiftGroup;
});
