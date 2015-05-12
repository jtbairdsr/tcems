/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-29 08:26:17
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-04 20:08:42
 */

'use strict';

angular.module('core').factory('Position', function($q, Data, positions, currentUser) {

	// Variables attempt make code more readable
	var $super = Data,
		listName = 'Position',
		list = positions.list;

	// Declare the new Position object
	function Position() {
		var newData = arguments[0] || {};
		$super.call(this, newData, list, listName);
		this.parent = $super.prototype;

		// Initialize the attributes of the new Position object
		this.initAttributes();
	}

	// Set the prototype of the new Position object to match it's parent.
	Position.prototype = Object.create($super.prototype);

	// Assign Position as its own constructor
	Position.prototype.constructor = Position;

	/**************************************************************************
	 *                             INSTANCE METHODS                           *
	 **************************************************************************/

	// Override the initAttributes method from parent object
	Position.prototype.initAttributes = function() {
		this.parent.initAttributes.apply(this);

		/*********************Values stored on DB**********************/
		this.Position = this.newData.Position || undefined;
		this.PhoneNumber = this.newData.PhoneNumber || undefined;
		this.Email = this.newData.Email || undefined;
		this.Description = this.newData.Description || undefined;

		/*******************Values that don't persist******************/
		this.Active = true;
		this.Access = true;
		this.setAccess();
		this.setActive();
		this.data = this.updateData();
	};

	// Override the updateData method from parent object
	Position.prototype.updateData = function() {
		var returnData = this.parent.updateData.apply(this);
		returnData.Position = this.Position;
		returnData.Description = this.Description;
		return returnData;
	};

	// Override the toString method from parent object
	Position.prototype.toString = function() {
		if (this.Description) {
			return this.Description + ' position';
		} else {
			return 'New Position';
		}
	};

	// Create the setAccess method
	Position.prototype.setAccess = function() {
		if (currentUser.data.Position !== undefined &&
			currentUser.data.Area.DefaultPosition !== undefined) {
			this.Access = (
				this.Id === currentUser.data.Area.DefaultPosition.Id ||
				this.Description === currentUser.data.Position.Description ||
				this.Description === 'Proctor' ||
				(
					(currentUser.data.Position.Description === 'FTE' || currentUser.data.Admin) &&
					!(this.Description === 'FTE' || this.Description === 'Applicant')
				)
			);
		}
	};

	// Create the setActive method
	Position.prototype.setActive = function() {
		if (currentUser.data.Position !== undefined &&
			currentUser.data.Area.DefaultPosition !== undefined) {
			this.Active = (
				((this.Id === currentUser.data.Area.DefaultPosition.Id &&
						currentUser.data.Position.Description === 'FTE') ^
					this.Description === currentUser.data.Position.Description) === 1
			);
		}
	};

	/**************************************************************************
	 *                              CLASS METHODS                             *
	 **************************************************************************/

	Position.query = function() {
		var deffered = $q.defer();
		$super.query.call(this, listName)
			.then(function(data) {
				list.splice(0, list.length);
				_.each(data, function(datum) {
					list.push(new Position(datum));
				});
				deffered.resolve();
			});
		return deffered.promise;

		// TODO: create the query class method test suite
	};

	// Return the newly defined Position object
	return Position;
});
