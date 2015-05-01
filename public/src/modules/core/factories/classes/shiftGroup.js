/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-29 08:33:23
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-04-29 12:22:43
 */

'use strict';

angular.module('core').factory('ShiftGroup', ['Data', 'shiftGroups',
	function(Data, shiftGroups) {

		// declare the new ShiftGroup object
		function ShiftGroup() {
			// variables attempt make code more readable
			var $super = Data,
				listname = 'ShiftGroup',
				list = shiftGroups;
			this.parent = $super.prototype;
			$super.call(this, arguments, list, listname);
		}

		// set the prototype of the new ShiftGroup object to match it's parent.
		ShiftGroup.prototype = Object.create(ShiftGroup.parent);

		// assign ShiftGroup as its own constructor
		ShiftGroup.prototype.constructor = ShiftGroup;

		// override the initAttributes method from parent object
		ShiftGroup.prototype.initAttributes = function() {
			this.parent.initAttributes.apply(this);

			/*********************values stored on db**********************/
			this.Description = this.newData.Description || undefined;

			/*******************values that don't persist******************/
			this.data = this.updateData();
		};

		// override the updateData method from parent object
		ShiftGroup.prototype.updateData = function() {
			var returnData = this.parent.updateData.apply(this);
			returnData.Description = this.Description;
			return returnData;
		};

		// override the toString method from parent object
		ShiftGroup.prototype.toString = function() {
			return 'The ' + this.Description + ' semester type';
		};

		// initialize the attributes of the new ShiftGroup object
		ShiftGroup.initAttributes();

		// return the newly defined ShiftGroup object
		return ShiftGroup;
	}
]);
