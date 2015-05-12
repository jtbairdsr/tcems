/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-27 20:10:59
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-01 12:41:00
 */

'use strict';

angular.module('employees').factory('Area', function(Data, areas, positions) {

	// Variables attempt make code more readable
	var $super = Data,
		listName = 'Area',
		list = areas.list;

	// Declare the new Area object
	function Area() {
		var newData = arguments[0] || {};
		$super.call(this, newData, list, listName);
		this.parent = $super.prototype;
		this.initAttributes();
	}

	// Set the prototype of the new Area object to match it's parent.
	Area.prototype = Object.create($super.prototype);

	// Assign Area as its own constructor
	Area.prototype.constructor = Area;

	/**************************************************************************
	 *                             INSTANCE METHODS                           *
	 **************************************************************************/

	// Override the initAttributes method from parent object
	Area.prototype.initAttributes = function() {
		var object = this;
		this.parent.initAttributes.apply(this);

		/*********************Values stored on DB**********************/
		this.Area = this.newData.Area || undefined;
		this.Description = this.newData.Description || undefined;
		this.DefaultPositionId = this.newData.DefaultPositionId || undefined;

		/****************Values derived from other tables**************/
		this.DefaultPosition = (this.newData.DefaultPositionId) ? _.find(positions.list, function(position) {
			return position.Id === object.DefaultPositionId;
		}) : {};
		this.Positions = this.newData.Positions || [];

		/*******************Values that don't persist******************/
		this.data = this.updateData();
	};

	// Override the updateData method from parent object
	Area.prototype.updateData = function() {
		var returnData = this.parent.updateData.apply(this);
		returnData.Area = this.Area;
		returnData.Description = this.Description;
		returnData.DefaultPositionId = this.DefaultPositionId;
		return returnData;
	};

	// Override the toString method from parent object
	Area.prototype.toString = function() {
		if (this.Description === undefined) {
			return 'New Area';
		} else {
			return this.Description + ' Area';
		}
	};

	/**************************************************************************
	 *                              CLASS METHODS                             *
	 **************************************************************************/

	Area.query = function() {
		$super.query.call(this, listName)
			.then(function(data) {
				list.splice(0, list.length);
				_.each(data, function(employee) {
					list.push(new Area(employee));
				});
			});

		// TODO: create the setIntent method test suite
	};

	// Return the newly defined Area object
	return Area;
});
