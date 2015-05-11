/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-29 12:23:32
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-01 12:35:52
 */

'use strict';

angular.module('core').factory('AreaPosition', function($q, Data, areaPositions, areas, positions) {

	// Variables attempt make code more readable
	var $super = Data,
		listName = 'AreaPosition',
		list = areaPositions.list;

	// Declare the new AreaPosition object
	function AreaPosition() {
		var newData = arguments[0] || {};
		$super.call(this, newData, list, listName);
		this.parent = $super.prototype;
		this.initAttributes();
	}

	// Set the prototype of the new AreaPosition object to match it's parent.
	AreaPosition.prototype = Object.create($super.prototype);

	// Assign AreaPosition as its own constructor
	AreaPosition.prototype.constructor = AreaPosition;

	// Override the initAttributes method from parent object
	AreaPosition.prototype.initAttributes = function() {
		var object = this;
		this.parent.initAttributes.apply(this);

		/*********************Values stored on DB**********************/
		this.AreaId = this.newData.AreaId || undefined;
		this.PositionId = this.newData.PositionId || undefined;

		/****************Values derived from other tables**************/
		this.Area = (this.newData.AreaId) ? _.find(areas.list, function(area) {
			return area.Id === object.AreaId;
		}) : {};
		this.Position = (this.newData.PositionId) ? _.find(positions.list, function(position) {
			return position.Id === object.PositionId;
		}) : {};

		/*******************Values that don't persist******************/
		this.setAreasPosition();
		this.data = this.updateData();
	}; // }}}

	// Override the updateData method from parent object
	AreaPosition.prototype.updateData = function() {
		var returnData = this.parent.updateData.apply(this);
		returnData.AreaId = this.AreaId;
		returnData.PositionId = this.PositionId;
		return returnData;
	}; // }}}

	// Override the toString method from parent object
	AreaPosition.prototype.toString = function() {
		if (this.AreaId && this.PositionId) {
			return this.Area.Description + ' ' + this.Position.Description;
		} else {
			return 'New AreaPosition';
		}
	};

	// A method to add the position to the linked area object
	AreaPosition.prototype.setAreasPosition = function() {
		if (this.Area.Positions) {
			this.Area.Positions.push(this.Position);
		}
	};

	/**************************************************************************
	 *                              CLASS METHODS                             *
	 **************************************************************************/

	AreaPosition.query = function() {
		var deffered = $q.defer();
		$super.query.call(this, listName)
			.then(function(data) {
				list.splice(0, list.length);
				_.each(data, function(datum) {
					list.push(new AreaPosition(datum));
				});
				deffered.resolve();
			});
		return deffered.promise;

		// TODO: create the setIntent method test suite
	};

	// Return the newly defined AreaPosition object
	return AreaPosition;

});