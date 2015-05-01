/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-24 14:59:29
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-01 12:00:51
 */

'use strict';

angular.module('core').factory('Track', function(Data, tracks) {

	// Variables attempt make code more readable
	var $super = Data,
		listName = 'Track',
		list = tracks.list;

	// Declare the new Track object
	function Track(newData) {
		newData = newData || {};
		this.parent = $super.prototype;
		$super.call(this, arguments, list, listName);

		// Initialize the attributes of the new Track object
		this.initAttributes();
	}

	// Set the prototype of the new Track object to match it's parent.
	Track.prototype = Object.create($super.prototype);

	// Assign Track as its own constructor
	Track.prototype.constructor = Track;

	/**************************************************************************
	 *                             INSTANCE METHODS                           *
	 **************************************************************************/

	// Override the initAttributes method from parent object
	Track.prototype.initAttributes = function() {
		this.parent.initAttributes.apply(this);

		// [>********************values stored on db**********************<]
		this.Description = this.newData.Description || undefined;

		// [>******************values that don't persist******************<]
		this.data = this.updateData();
	};

	// Override the updateData method from parent object
	Track.prototype.updateData = function() {
		var returnData = this.parent.updateData.apply(this);
		returnData.Description = this.Description;
		return returnData;
	};

	// Override the toString method from parent object
	Track.prototype.toString = function() {};

	/**************************************************************************
	 *                              CLASS METHODS                             *
	 **************************************************************************/

	Track.query = function() {
		$super.query.call(this, listName)
			.then(function(data) {
				list.splice(0, list.length);
				_.each(data, function(employee) {
					list.push(new Track(employee));
				});
			});

		// TODO: create the setIntent method test suite
	};

	// Return the newly defined Track object
	return Track;

	// TODO: write the spec for this factory
});
