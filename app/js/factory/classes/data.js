/* global angular, _ */
(function() {
	'use strict';

	angular.module('App')
	.factory('Data', ['$q', '$alert', 'generalService', 'dataService',
		function($q, $alert, generalService, dataService) {
			var DATA       = generalService.data,
				PROPERTIES = generalService.properties;
			function Data(newData, listName){
				this.newData = newData;
				this.listName = listName;
			}
			Data.prototype.initPublicAttributes = function () {
				this.Created = (this.newData.Created) ? Date.parse(this.newData.Created) : undefined;
				this.GUID = this.newData.GUID || undefined;
				this.Id = this.newData.Id || undefined;
				this.Modified = (this.newData.Modified) ? Date.parse(this.newData.Modified) : undefined;
				this.__metadata = this.newData.__metadata || {
					type: 'SP.Data.' + this.listName + 'ListItem',
				};
				this.defaultAlertContent = this.toString();
				this.addAlertContent = this.defaultAlertContent + ' has been added!';
				this.removeAlertContent = this.defaultAlertContent + ' has been removed!';
				this.updateAlertContent = this.defaultAlertContent + ' has been updated!';
			};
			Data.prototype.updateData = function () {
				return {
					__metadata: this.__metadata
				};
			};
			Data.prototype.add = function (hideAlert) {
				/** @privateAtribute {object} an alias for this */
				var object = this;
				hideAlert = hideAlert || false;
				newObject = newObject || false;
				var deffered = $q.defer();
				this.data = this.updateData();
				if (this.__metadata.etag === undefined) {
					dataService.addItem(this.listName, this.data)
					.success(function(data) {
						if (!newObject) {
							object.newData = data.d;
							object.initPublicAttributes();
							DATA[object.listName.charAt(0).toLowerCase() + object.listName.slice(1) + 's'].push(object);
						}
						if (!hideAlert) {
							$alert({
								show: true,
								placement: 'top-right',
								content: object.addAlertContent,
								animation: 'am-fade-and-slide-top',
								duration: '3',
								type: 'success',
								template: 'partials/alerts/success-alert.html'
							});
						}
						deffered.resolve(object.Id);
					});
				}
				return deffered.promise;
			};
			Data.prototype.remove = function(hideAlert) {//{{{
				/** @privateAtribute {object} an alias for this */
				var object = this;
				hideAlert = hideAlert || false;
				var deffered = $q.defer();
				dataService.deleteItem(this.listName, this.Id)
				.success(function() {
					DATA[object.listName.charAt(0).toLowerCase() + object.listName.slice(1) + 's'] = _.without(DATA[object.listName.charAt(0).toLowerCase() + object.listName.slice(1) + 's'], object);
					if (!hideAlert) {
						$alert({
							show: true,
							placement: 'top-right',
							content: object.removeAlertContent,
							animation: 'am-fade-and-slide-top',
							duration: '3',
							type: 'success',
							template: 'partials/alerts/success-alert.html'
						});
					}
					deffered.resolve();
				});
				return deffered.promise;
			};//}}}
			Data.prototype.update = function(hideAlert) {//{{{
				var deffered = $q.defer();
				/** @privateAtribute {object} an alias for this */
				var object = this;
				hideAlert = hideAlert || false;
				this.__metadata.etag = this.__metadata.etag || '*';
				this.data = this.updateData();
				dataService.updateItem(this.listName, this.Id, this.data, this.__metadata.etag)
				.success(function() {
					object.refresh()
					.then(function() {
						if (!hideAlert) {
							$alert({
								show: true,
								placement: 'top-right',
								content: object.updateAlertContent,
								animation: 'am-fade-and-slide-top',
								duration: '3',
								type: 'success',
								template: 'partials/alerts/success-alert.html'
							});
						}
						deffered.resolve();
					});
				})
				.error(function(data) {
					console.error('There has been an error with your network request.', data);
					$alert({
						show: true,
						placement: 'top-right',
						content: 'You must refesh your data before you can change that item',
						animation: 'am-fade-and-slide-top',
						duration: '3',
						type: 'danger',
						template: 'partials/alerts/error-alert.html'
					});
				});
				return deffered.promise;
			};//}}}
			Data.prototype.refresh = function() {//{{{
				var deffered = $q.defer();
				/** @privateAtribute {object} an alias for this */
				var object = this;
				dataService.fetchItem(this.listName, this.Id)
				.success(function(data) {
					object.newData = data.d;
					object.initPublicAttributes();
					deffered.resolve();
				});
				return deffered.promise;
			};//}}}
			return Data;
		}
	]);
})();

//vim:foldmethod=marker:foldlevel=0
