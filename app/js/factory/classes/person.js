/* global angular, _ */

(function() {
	'use strict';
	angular.module('App')
	.factory('Person', ['$q', '$alert', 'generalService', 'dataService', 'Data',
		function($q, $alert, generalService, dataService, Data) {
			var PROPERTIES = generalService.properties;
			function Person(newData, listName){
				Data.call(this, newData, listName);
				this.$super = Data;
				this.defaultAlertContent = (this.Id === PROPERTIES.currentUser.Id) ? 'Your information' : this.toString();
			}
			Person.prototype = Object.create(Person.$super);
			Person.prototype.constructor = Person;
			Person.prototype.initPublicAttributes = function () {
				this.$super.prototype.initPublicAttributes.apply(this);
				this.EmailAddress = this.newData.EmailAddress || undefined;
				this.FirstName = this.newData.FirstName || undefined;
				this.LastName = this.newData.LastName || undefined;
				this.PhoneNumber = this.newData.PhoneNumber || undefined;
				this.Picture = this.newData.Picture || undefined;
				this.PreferredName = this.newData.PreferredName || undefined;
			};
			Person.prototype.updateData = function () {
				var returnData = this.$super.prototype.updateData.apply(this);
				returnData.EmailAddress = this.EmailAddress;
				returnData.FirstName = this.FirstName;
				returnData.INumber = this.INumber;
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
			Person.prototype.toString = function () {
				if (this.Id === PROPERTIES.currentUser.Id) {
					return 'Your Information';
				}
				if (this.PreferredName) {
						return this.PreferredName + ' ' + this.LastName;
				} else {
					return this.FirstName + ' ' + this.LastName;
				}
			};
			return Person;
		}
	]);
})();
