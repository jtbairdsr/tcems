/* 
 * @Author: Jonathan Baird
 * @Date:   2014-10-28 15:04:11
 * @Last Modified 2014-11-18
 * @Last Modified time: 2014-11-18 17:05:13
 */
(function() {
	var app = angular.module('dataService', []);

	app.service('spContext', ['$http', '$timeout',
		function($http, $timeout) {
			var service = this;
			/////////////////
			// init $scope //
			/////////////////
			service.properties = {
				sharePointUrl: 'https://inet.byui.edu/sites/TestingServices/',
				localUrl: 'http://testcenterems.byui.edu',
				validationTimeout: 0,
				validation: '',
				currentUser: {},
			};
			service.errors = [];


			//////////////////
			// init methods //
			//////////////////
			service.getJson = function(url) {
				return $http.get(url, {
					headers: {
						'accept': 'application/json;odata=verbose'
					}
				});
			};
			// create the getCurrentUser method
			service.getCurrentUser = function() {
				service.getJson(service.properties.sharePointUrl + '_api/web/currentUser')
					.success(function(data) {
						service.properties.currentUser.userId = data.d;
						new service.getItems('Employee')
							.select(['PreferredName', 'FirstName', 'LastName', 'Picture', 'ID', 'EmailAddress', 'PhoneNumber', 'Position/Position'])
							.where(['EmailAddress', 'eq', data.d.Email])
							.expand(['Position'])
							.execute()
							.success(function(data) {
								service.properties.currentUser.employeeInfo = data.d.results[0];
							})
							.error(function(data) {
								service.errors.push(data);
							});
					})
					.error(function(data) {
						service.errors.push(data);
					});
			};

			// create the refreshSecurityValidation method.
			service.refreshSecurityValidation = function() {
				$http.post(service.properties.sharePointUrl + '_api/contextinfo')
					.success(function(data) {
						var siteContextinfo = data.d.GetContextWebInformation;
						service.properties.validationTimeout = siteContextinfo.FormDigestTimeoutSeconds - 10;
						service.properties.validation = siteContextinfo.FormDigestValue;

					})
					.error(function(data) {
						service.errors.push(data);
					});
				$timeout(function() {
					service.refreshSecurityValidation();
				}, service.properties.validationTimeout * 1000);
			};
			service.addItem = function(listName, item) {
				$http.defaults.headers.post = {
					'Accept': 'application/json;odata=verbose',
					'Content-Type': 'application/json;odata=verbose',
					'X-RequestDigest': service.properties.validation,
				};
				return $http.post(service.properties.sharePointUrl + '_api/lists/getbytitle(\'' + listName + '\')/items', item);
			};

			// create the updateItem method
			service.updateItem = function(listName, itemId, item, etag) {
				return $http({
					method: 'POST',
					url: service.properties.sharePointUrl + '_api/lists/getbytitle(\'' + listName + '\')/items(\'' + itemId + '\')',
					body: item,
					headers: {
						'accept': 'application/json;odata=verbose',
						'content-type': 'application/json;odata=verbose',
						'X-RequestDigest': service.properties.validation,
						'IF-MATCH': etag,
						'X-HTTP-Method': 'MERGE'
					}
				});
			};

			// create the deleteItem method
			service.deleteItem = function(listName, itemId) {
				return $http({
					method: 'POST',
					url: service.properties.sharePointUrl + '_api/lists/getbytitle(\'' + listName + '\')/items(\'' + itemId + '\')',
					headers: {
						'X-HTTP-Method': 'DELETE',
						'IF-MATCH': '*',
						'X-RequestDigest': service.properties.validation
					}
				});
			};

			// create the getItem method
			service.getItem = function(listName, itemId) {
				return service.getJson(service.properties.sharePointUrl + '_api/lists/getbytitle(\'' + listName + '\')/items(\'' + itemId + '\')');
			};

			// create the getItems Object
			service.getItems = function(listName) {
				// init properties
				this.query = '';
				this.flag = true;
				this.listName = listName;
				// init methods
				this.select = function(params) {
					var selectQuery = '$select=';
					for (var i = 0; i < params.length; i++) {
						selectQuery += params[i];
						selectQuery += (i == params.length - 1) ? '' : ',';
					}
					this.query += (this.flag) ? '?' + selectQuery : '&' + selectQuery;
					this.flag = false;
					return this;
				};
				this.expand = function(params) {
					var expandQuery = '$expand=';
					for (var i = 0; i < params.length; i++) {
						expandQuery += params[i];
						expandQuery += (i == params.length - 1) ? '' : ',';
					}
					this.query += (this.flag) ? '?' + expandQuery : '&' + expandQuery;
					this.flag = false;
					return this;
				};
				this.where = function(params) {
					var filterQuery = '$filter=',
						orQuery = '',
						andQuery = '',
						filterFlag = true,
						i = 0;
					if (params.or === undefined && params.and === undefined) {
						filterQuery += params[0] + ' ' + params[1] + ((typeof params[2] === 'boolean') ? ' ' + params[2] : ' \'' + params[2] + '\'');
						filterFlag = false;
					} else {
						if (params.or !== undefined) {
							for (i = 0; i < params.or.length; i++) {
								orQuery += params.or[i][0] + ' ' + params.or[i][1] + ' \'' + params.or[i][2] + '\'';
								orQuery += (i == params.or.length - 1) ? '' : ' or ';
							}
							filterQuery += (filterFlag) ? orQuery : ' or ' + orQuery;
							filterFlag = false;
						}
						if (params.and !== undefined) {
							for (i = 0; i < params.and.length; i++) {
								andQuery += params.and[i][0] + ' ' + params.and[i][1] + ' \'' + params.and[i][2] + '\'';
								andQuery += (i == params.and.length - 1) ? '' : ' and ';
							}
							filterQuery += (filterFlag) ? andQuery : ' and ' + andQuery;
							filterFlag = false;
						}
					}
					if (filterFlag) {
						return this;
					} else {
						this.query += (this.flag) ? '?' + filterQuery : '&' + filterQuery;
						this.flag = false;
						return this;
					}

				};
				this.execute = function() {
					return service.getJson(service.properties.sharePointUrl + "_api/lists/getbytitle('" + this.listName + "')/items" + this.query);
				};
			}; // end of getItems Object

			// create the init function... similar to a class constructor
			service.init = function() {
				$http.defaults.headers.post = {
					'Accept': 'application/json;odata=verbose',
					'Content-Type': 'application/json;odata=verbose',
					'X-RequestDigest': service.properties.validation,
				};
				service.refreshSecurityValidation();
				service.getCurrentUser();
			};

			// init the service
			service.init();

		}
	]);

	app.config(['$httpProvider',
		function($httpProvider) {
			$httpProvider.defaults.useXDomain = true;
			delete $httpProvider.defaults.headers.common['X-Requested-With'];
		}
	]);

	app.filter('numberFixedLen', function() {
		return function(a, b) {
			return (1e4 + a + "")
				.slice(-b);
		};
	});

})();
