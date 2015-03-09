/* global angular, _ */

(function() {
	'use strict';

	angular.module('App')
	.factory('AreaPosition', ['$q', '$alert', 'generalService', 'dataService', 'Data',
		function($q, $alert, generalService, dataService, Data) {
			// define local aliases to subsets in the data on generalService//{{{
			var DATA = generalService.data;//}}}

			// declare the new Area object//{{{
			function AreaPosition() {
				// variables attempt make code more readable
				var $super = Data,
					listname = 'AreaPosition';
				this.parent = $super.prototype;
				$super.call(this, arguments, listname);
			}//}}}

			// set the prototype of the new Area object to match it's parent.//{{{
			AreaPosition.prototype = Object.create(Area.parent);//}}}

			// assign Area as its own constructor//{{{
			AreaPosition.prototype.constructor = Area;//}}}

			// override the initPublicAttributes method from parent object//{{{
			AreaPosition.prototype.initPublicAttributes = function() {
				var areaPosition = this;
				this.parent.initPublicAttributes.apply(this);
				this.AreaId = this.newData.AreaId || undefined;
				this.Area = (this.newData.AreaId) ? _.find(DATA.areas, function(area) {
					return area.Id === object.AreaId;
				}) : {};
				this.PositionId = this.newData.PositionId || undefined;
				this.Position = (this.newData.PositionId) ? _.find(DATA.positions, function(position) {
					return position.Id === object.PositionId;
				}) : {};
				this.setAreasPosition();
				this.data = this.updateData();
			};// }}}

			// override the updateData method from parent object//{{{
			AreaPosition.prototype.updateData = function() {
				var returnData = this.parent.updateData(this);
				returnData.AreaId = this.AreaId;
				returnData.PositionId = this.PositionId;
				return returnData;
			};// }}}

			// override the toString method from parent object//{{{
			Area.prototype.toString = function() {
				return this.Area.Description + ' ' + this.Position.Description;
			};//}}}

			// a method to add the position to the linked area object//{{{
			AreaPosition.prototype.setAreasPosition = function() {
				this.Area.Positions.push(this.Position);
			};//}}}

			// return the newly defined area object//{{{
			return AreaPosition;//}}}

		}
	]);
})();

// vim:foldmethod=marker:foldlevel=0
