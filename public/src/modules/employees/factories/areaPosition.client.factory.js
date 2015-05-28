/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-29 12:23:32
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-27 17:54:05
 */

'use strict';

angular.module('core').factory('AreaPosition', function(
	$q, Data, areaPositions, areas, positions
) {
	// Variables attempt make code more readable
	var $super = Data,
		listName = 'AreaPosition',
		list = areaPositions.list;

	// Declare the new AreaPosition object
	function AreaPosition(newData) {
		$super.call(this, newData, list, listName);
		this.parent = $super.prototype;
		this.initAttributes();
	}

	// Set the prototype of the new AreaPosition object to match it's parent.
	AreaPosition.prototype = Object.create($super.prototype);

	// Assign AreaPosition as its own constructor
	AreaPosition.prototype.constructor = AreaPosition;

	/**************************************************************************
	 *                             INSTANCE METHODS                           *
	 **************************************************************************/

	// Override the initAttributes method from parent object
	AreaPosition.prototype.initAttributes = function() {
		var that = this;
		this.parent.initAttributes.apply(this);

		/*********************Values stored on DB**********************/
		this.AreaId = this.newData.AreaId || undefined;
		this.PositionId = this.newData.PositionId || undefined;
		this.cSApps = this.newData.CanSeeApps || this.newData.cSApps || false;
		this.entry = this.newData.Entry || this.newData.entry || false;
		this.hiring = (this.newData.Hiring) ? Date.parse(this.newData.Hiring) : ((this.newData.hiring) ? Date.parse(this.newData.hiring) : undefined);
		this.open = this.newData.Open || this.newData.open || false;
		this.referal = this.newData.Referal || this.newData.referal || false;
		this.review = this.newData.Review || this.newData.review || false;
		this.ar = this.newData.AResume || this.newData.ar || false;
		this.rr = this.newData.RResume || this.newData.rr || false;
		this.acl = this.newData.ACoverLetter || this.newData.acl || false;
		this.rcl = this.newData.RCoverLetter || this.newData.rcl || false;

		/****************Values derived from other tables**************/
		this.Area = (this.AreaId) ? _.find(areas.list, function(a) {
			return a.Id === that.AreaId;
		}) : undefined;
		this.Position = (this.PositionId) ? _.find(positions.list, function(pos) {
			return pos.Id === that.PositionId;
		}) : undefined;

		/*******************Values that don't persist******************/
		this.setAreasPosition();
		this.data = this.updateData();
	};

	// Override the updateData method from parent object
	AreaPosition.prototype.updateData = function() {
		var returnData = this.parent.updateData.apply(this);
		returnData.AreaId = this.AreaId;
		returnData.PositionId = this.PositionId;
		returnData.CanSeeApps = this.cSApps;
		returnData.Entry = this.entry;
		returnData.Hiring = this.hiring;
		returnData.Open = this.open;
		returnData.Referal = this.referal;
		returnData.Review = this.review;
		returnData.AResume = this.ar;
		returnData.RResume = this.rr;
		returnData.ACoverLetter = this.acl;
		returnData.RCoverLetter = this.rcl;
		return returnData;
	};

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
		if (this.Area && this.Area.Positions) {
			this.Area.Positions.push(this.Position);
		}
	};

	AreaPosition.prototype.toggleOpen = function() {
		if (this.open) {
			this.open = false;
		} else {
			this.hiring = Date.today();
			this.open = true;
			this.referal = true;
		}
		this.update();
	};
	AreaPosition.prototype.toggleReferal = function() {
		if (this.referal) {
			this.referal = false;
		} else {
			this.hiring = Date.today();
			this.referal = true;
		}
		this.update();
	};
	AreaPosition.prototype.toggleReview = function() {
		if (this.review) {
			this.review = false;
		} else {
			this.review = true;
			this.open = false;
			this.referal = false;
		}
		this.update();
	};
	AreaPosition.prototype.closeHiring = function() {
		this.open = false;
		this.review = false;
		this.referal = false;
		this.update();
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
	};

	// Return the newly defined AreaPosition object
	return AreaPosition;

});
