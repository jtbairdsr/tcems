/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-29 08:28:40
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-01 09:13:45
 */

'use strict';

angular.module('professors').factory('Professor',
	function(Person, professors) {

		// Variables attempt make code more readable
		var $super = Person,
			listName = 'Professor',
			list = professors.list;

		// Declare the new Professor object
		function Professor(newData) {
			newData = newData || {};
			this.parent = $super.prototype;
			$super.call(this, newData, list, listName);

			// Initialize the attributes of the new Professor object
			this.initAttributes();
		}

		// Set the prototype of the new Professor object to match it's parent.
		Professor.prototype = Object.create($super.prototype);

		// Assign Professor as its own constructor
		Professor.prototype.constructor = Professor;

		// Override the initAttributes method from parent object
		Professor.prototype.initAttributes = function() {
			this.parent.initAttributes.apply(this);

			/*********************Values stored on DB**********************/
			this.OfficeAddress = this.newData.OfficeAddress || undefined;
			this.OfficePhone = this.newData.OfficePhone || undefined;
			this.OtherPhone = this.newData.OtherPhone || undefined;

			/*******************Values that don't persist******************/
			this.data = this.updateData();
		};

		// Override the updateData method from parent object
		Professor.prototype.updateData = function() {
			var returnData = this.parent.updateData.apply(this);
			returnData.OfficeAddress = this.OfficeAddress;
			returnData.OfficePhone = this.OfficePhone;
			returnData.OtherPhone = this.OtherPhone;
			return returnData;
		};

		// Override the toString method from parent object
		Professor.prototype.toString = function() {
			return this.listName + ': ' + this.FirstName + ' ' + this.LastName;
		};

		// Return the newly defined Professor object
		return Professor;
	}
);
