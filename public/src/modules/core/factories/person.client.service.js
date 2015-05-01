/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-29 08:21:38
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-01 11:42:11
 */

'use strict';

angular.module('core').factory('Person', function(Data, currentUser) {
	// Variables attempt make code more readable
	var $super = Data;

	// Declare the new Person object
	function Person(newData, list, listName) {
		$super.call(this, newData, list, listName);
	}

	// Set the prototype of the new Person object to match it's parent.
	Person.prototype = Object.create($super.prototype);

	// Assign Person as its own constructor
	Person.prototype.constructor = Person;

	/**************************************************************************
	 *                             INSTANCE METHODS                           *
	 **************************************************************************/

	// Override the initAttributes method from parent object
	Person.prototype.initAttributes = function() {
		Data.prototype.initAttributes.apply(this);
		this.EmailAddress = this.newData.EmailAddress || undefined;
		this.FirstName = this.newData.FirstName || undefined;
		this.LastName = this.newData.LastName || undefined;
		this.PhoneNumber = this.newData.PhoneNumber || undefined;
		this.Picture = (this.newData.Picture)
		? this.newData.Picture.replace(/\/media/g, 'src/modules/employees/img')
		: 'media/missing.png';
		this.PreferredName = this.newData.PreferredName || undefined;
	};

	// Override the updateData method from parent object
	Person.prototype.updateData = function() {
		var returnData = Data.prototype.updateData.apply(this);
		returnData.EmailAddress = this.EmailAddress;
		returnData.FirstName = this.FirstName;
		returnData.LastName = this.LastName;
		returnData.Picture = this.Picture;
		if (this.PhoneNumber) {
			returnData.PhoneNumber = this.PhoneNumber;
		}
		if (this.PreferredName) {
			returnData.PreferredName = this.PreferredName;
		}
		return returnData;
	};

	// Override the toString method from parent object
	Person.prototype.toString = function() {
		if (this.LastName) {
			if (this.Id === currentUser.Id) {
				return 'Your Information';
			} else if (this.PreferredName) {
				return this.PreferredName + ' ' + this.LastName;
			} else {
				return this.FirstName + ' ' + this.LastName;
			}
		} else {
			return 'New Person';
		}
	};

	/**************************************************************************
	 *                              CLASS METHODS                             *
	 **************************************************************************/

	Person.GET = function(paramListName, attribute, value) {
		return $super.GET.call(this, paramListName, attribute, value);
	};

	// Return the newly defined Person object
	return Person;
});
