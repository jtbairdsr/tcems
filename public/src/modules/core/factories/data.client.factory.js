/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-29 08:36:11
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-07 13:14:36
 */
'use strict';

angular.module('core').factory('Data',
	function($q, $alert, dataService) {

		var alertDirectoryPath = 'src/modules/core/views/alerts/',
			successAlertTpl = alertDirectoryPath + 'success-alert.client.view.html';

		// Declare the new Data object
		function Data(newData, list, listName) {
			this.newData = newData;
			this.list = list;
			this.listName = listName;
		}

		// Create the propertyList
		Data.prototype.propertyList = ['Created', 'GUID', 'Id', 'Modified'];

		/**********************************************************************
		 *                           INSTANCE METHODS                         *
		 **********************************************************************/

		Data.prototype.initAttributes = function() {
			/*********************Values stored on DB**********************/
			this.Created = (this.newData.Created) ? Date.parse(this.newData.Created) : undefined;
			this.GUID = this.newData.GUID || undefined;
			this.Id = this.newData.Id || undefined;
			this.Modified = (this.newData.Modified) ? Date.parse(this.newData.Modified) : undefined;
			this.__metadata = this.newData.__metadata || {
				type: 'SP.Data.' + this.listName + 'ListItem'
			};

			/*******************Values that don't persist******************/
			this.defaultAlertContent = this.toString();
			this.addAlertContent = this.defaultAlertContent + ' has been added!';
			this.removeAlertContent = this.defaultAlertContent + ' has been removed!';
			this.updateAlertContent = this.defaultAlertContent + ' has been updated!';
		};

		Data.prototype.updateData = function() {
			return {
				__metadata: this.__metadata
			};
		};

		Data.prototype.add = function(hideAlert, newObject) {
			/** @privateAtribute {object} an alias for this */
			var object = this,
				deffered = $q.defer();
			hideAlert = hideAlert || false;
			newObject = newObject || false;
			this.data = this.updateData();
			if (this.__metadata.etag === undefined) {
				dataService.addItem(this.listName, this.data)
					.success(function(data) {
						if (!newObject) {
							object.newData = data.d;
							object.initAttributes();
							object.list.push(object);
						}
						if (!hideAlert) {
							$alert({
								show: true,
								placement: 'top-right',
								content: object.addAlertContent,
								animation: 'am-fade-and-slide-top',
								duration: '3',
								type: 'success',
								template: successAlertTpl
							});
						}
						deffered.resolve(object.Id);
					});
			}
			return deffered.promise;
		};

		Data.prototype.remove = function(hideAlert) {
			/** @privateAtribute {object} an alias for this */
			var object = this;
			hideAlert = hideAlert || false;
			var deffered = $q.defer();
			dataService.deleteItem(this.listName, this.Id)
				.success(function() {
					object.list = object.list.splice(object.list.indexOf(object), 1);
					if (!hideAlert) {
						$alert({
							show: true,
							placement: 'top-right',
							content: object.removeAlertContent,
							animation: 'am-fade-and-slide-top',
							duration: '3',
							type: 'success',
							template: successAlertTpl
						});
					}
					deffered.resolve();
				});
			return deffered.promise;
		};

		Data.prototype.update = function(hideAlert) {
			var deffered = $q.defer(),
				/** @privateAtribute {object} an alias for this */
				object = this;
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
									template: successAlertTpl
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
						template: alertDirectoryPath + 'error-alert.client.view.html'
					});
				});
			return deffered.promise;
		};

		Data.prototype.refresh = function() {
			var deffered = $q.defer(),
				/** @privateAtribute {object} an alias for this */
				object = this;
			dataService.fetchItem(this.listName, this.Id)
				.success(function(data) {
					object.newData = data.d;
					object.initAttributes();
					deffered.resolve();
				});
			return deffered.promise;
		};

		/**********************************************************************
		 *                            CLASS METHODS                           *
		 **********************************************************************/

		Data.GET = function(listName, attribute, value) {
			var deffered = $q.defer();
			new dataService.fetchItems(listName).top().where([attribute, 'eq', value]).execute()
				.success(function(data) {
					deffered.resolve(data.d.results[0]);
				});
			return deffered.promise;
		};

		Data.query = function(listName) {
			var deffered = $q.defer();
			dataService.fetchAllItems(listName)
				.success(function(data) {
					deffered.resolve(data.d.results);
				});
			return deffered.promise;
		};

		Data.queryFilter = function(listName, filter, expand, select) {
			var deffered = $q.defer();
			if (expand) {
				new dataService.fetchItems(listName).top().select(select).where(filter).expand(expand).execute()
					.success(function(data) {
						deffered.resolve(data.d.results);
					});
			} else {
				new dataService.fetchItems(listName).top().where(filter).execute()
					.success(function(data) {
						deffered.resolve(data.d.results);
					});
			}
			return deffered.promise;
		};

		// Return the newly defined Data object
		return Data;
	}
);
