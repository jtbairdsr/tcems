/* global angular, _ */

(function() {
	'use strict';

	angular.module('App')
	.factory('Area', ['$q', '$alert', 'generalService', 'dataService', 'Data',
		function($q, $alert, generalService, dataService, Data){
			// define local aliases to subsets in the data on generalService//{{{
			var DATA = generalService.data;//}}}

			// declare the new Area object//{{{
			function Area() {
				// variables attempt make code more readable
				var $super = Data,
					listname = 'Area';
				this.parent = $super.prototype;
				$super.call(this, arguments, listname);
			}//}}}

			// set the prototype of the new Area object to match it's parent.//{{{
			Area.prototype = Object.create(Area.parent);//}}}

			// assign Area as its own constructor//{{{
			Area.prototype.constructor = Area;//}}}

			// override the initPublicAttributes method from parent object//{{{
			Area.prototype.initPublicAttributes = function() {
				var area = this;
				this.parent.initPublicAttributes.apply(this);
				this.Area = this.newData.Area || undefined;
				this.Description = this.newData.Description || undefined;
				this.DefaultPositionId = this.newData.DefaultPositionId || undefined;
				this.DefaultPosition = (this.newData.DefaultPositionId) ? _.find(DATA.positions, function(position) {
					return position.Id === area.DefaultPositionId;
				}) : {};
				this.Positions = this.newData.Positions || [];
				this.data = this.updateData();
			};//}}}

			// override the updateData method from parent object//{{{
			Area.prototype.updateData = function() {
				var returnData = this.parent.updateData.apply(this);
				returnData.Area = this.Area;
				returnData.Description = this.Description;
				returnData.DefaultPositionId = this.DefaultPositionId;
				return returnData;
			};//}}}

			// override the toString method from parent object//{{{
			Area.prototype.toString = function() {
				return this.Description + ' Area';
			};//}}}

			// create a setter method for the Positions attribute//{{{
			Area.prototype.setPositions = function() {
				var area = this;
				this.Positions = [];
				_.each(DATA.areaPositions, function(areaPosition) {
					if (areaPosition.Area.Id === area.Id) {
						area.Positions.push(areaPosition.Position);
					}
				});
			};//}}}

			// return the newly defined area object//{{{
			return Area;//}}}

		}
	]);
})();


// vim:foldmethod=marker:foldlevel=0
