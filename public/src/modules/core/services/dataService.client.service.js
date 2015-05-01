/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-24 09:38:01
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-01 14:20:35
 */
'use strict';
var app = angular.module('core');
app.service('dataService', function($http, sharePointUrl, getClass, $timeout, cfpLoadingBar) {
	var that = this;
	that.validation = '';
	$http.defaults.headers.post = {
		'Accept': 'application/json;odata=verbose',
		'Content-Type': 'application/json;odata=verbose',
		'X-RequestDigest': that.validation,
		'X-HTTP-Method': 'POST',
		'If-Match': '*'
	};
	cfpLoadingBar.start();
	that.fetchJson = function(uri, cache) {
		cache = cache || false;
		return $http.get(sharePointUrl + uri, {
			headers: {
				'accept': 'application/json;odata=verbose',
				'cache': cache
			}
		});
	};
	that.postJson = function(params) {
		var universalHeaders = {headers: {}};
		return $http.post(sharePointUrl + params.uri, _.extend(universalHeaders, params.headers), params.data);
	};
	that.fetchCurrentUser = function() {
		return that.fetchJson('_api/web/currentUser', true);
	};
	that.addItem = function(listName, data) {
		return that.postJson({
			uri: '_api/lists/getbytitle(\'' + listName + '\')/items',
			data: data
		});
	};
	that.updateItem = function(listName, itemId, item, etag) {
		etag = etag || '*';
		return that.postJson({
			uri: '_api/lists/getbytitle(\'' + listName + '\')/items(' + itemId + ')',
			data: item,
			headers: {
				'IF-MATCH': etag,
				'X-HTTP-Method': 'MERGE'
			}
		});
	};
	that.deleteItem = function(listName, itemId) {
		return that.postJson({
			uri: '_api/lists/getbytitle(\'' + listName + '\')/items(' + itemId + ')',
			headers: {
				'X-HTTP-Method': 'DELETE',
				'IF-MATCH': '*'
			}
		});
	};
	that.fetchItem = function(listName, itemId, cache) {
		return that.fetchJson('_api/lists/getbytitle(\'' + listName + '\')/items(\'' + itemId + '\')', cache);
	};
	that.fetchItems = function(listName) {
		// Init properties
		this.query = '';
		this.flag = true;
		this.listName = listName;

		// Init methods
		this.select = function(params) {
			var selectQuery = '$select=';
			for (var i = 0; i < params.length; i++) {
				selectQuery += params[i];
				selectQuery += (i === params.length - 1) ? '' : ',';
			}
			this.query += (this.flag) ? '?' + selectQuery : '&' + selectQuery;
			this.flag = false;
			return this;
		};
		this.expand = function(params) {
			var expandQuery = '$expand=';
			for (var i = 0; i < params.length; i++) {
				expandQuery += params[i];
				expandQuery += (i === params.length - 1) ? '' : ',';
			}
			this.query += (this.flag) ? '?' + expandQuery : '&' + expandQuery;
			this.flag = false;
			return this;
		};
		this.where = function(params) {
			var filterQuery = '$filter=',
				andQuery = '',
				orQuery = '',
				filterFlag = true,
				i = 0,
				tempQueryHolder = [],
				addOr = function(orRequest) {
					var query = '';
					if (getClass(orRequest) === 'String') {
						query += orRequest;
					} else {
						for (i = 0; i < orRequest.length; i++) {
							if (getClass(orRequest[i]) === 'String') {
								query += orRequest[i];
							} else {
								query += orRequest[i][0] + ' ' + orRequest[i][1] + ((getClass(orRequest[i][2]) === 'String') ? (((orRequest[
										i][1].split(' ')
									.length > 0) ? '\'' : ' \'') + params.or[i][2] + '\'') : ' ' + orRequest[i][2]);
							}
							query += (i === orRequest.length - 1) ? '' : ' or ';
						}
					}
					return query;
				},
				addAnd = function(andRequest) {
					var query = '';
					if (getClass(andRequest) === 'String') {
						query += andRequest;
					} else {
						for (i = 0; i < andRequest.length; i++) {
							if (getClass(andRequest[i]) === 'String') {
								query += andRequest[i];
							} else {
								query += andRequest[i][0] + ' ' + andRequest[i][1] + ((getClass(andRequest[i][2]) === 'String') ? (((
									andRequest[i][1].split(' ')
									.length > 0) ? '\'' : ' \'') + andRequest[i][2] + '\'') : ' ' + andRequest[i][2]);
							}
							query += (i === andRequest.length - 1) ? '' : ' and ';
						}
					}
					return query;
				};
			if (params.or === undefined && params.and === undefined) {
				filterQuery += params[0] + ' ' + params[1] + ((getClass(params[2]) === 'String') ? (((params[1].split(' ')
					.length > 0) ? '\'' : ' \'') + params[2] + '\'') : ' ' + params[2]);
				filterFlag = false;
			} else {
				if (params.or !== undefined) {
					if (getClass(params.or) !== 'Array') {
						if (params.or.and !== undefined) {
							tempQueryHolder.push('(' + addAnd(params.or.and) + ')');
						}
						if (params.or.or !== undefined) {
							tempQueryHolder.push('(' + addOr(params.or.or) + ')');
						}
						if (params.or.other !== undefined) {
							tempQueryHolder.push(params.or.other);
						}
						orQuery = addOr(tempQueryHolder);
					} else {
						orQuery = addOr(params.or);
					}
					filterQuery += (filterFlag) ? orQuery : ' or ' + orQuery;
					filterFlag = false;
				}
				if (params.and !== undefined) {
					if (getClass(params.and) !== 'Array') {
						if (params.and.or !== undefined) {
							tempQueryHolder.push('(' + addOr(params.and.or) + ')');
						}
						if (params.and.and !== undefined) {
							tempQueryHolder.push('(' + addAnd(params.and.and) + ')');
						}
						if (params.and.other !== undefined) {
							tempQueryHolder.push(params.and.other);
						}
						andQuery = addAnd(tempQueryHolder);
					} else {
						andQuery = addAnd(params.and);
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
		this.top = function(param) {
			param = param || 999999999;
			var topQuery = '$top=' + param;
			this.query += (this.flag) ? '?' + topQuery : '&' + topQuery;
			this.flag = false;
			return this;
		};
		this.execute = function(cache) {
			return that.fetchJson('_api/lists/getbytitle(\'' + this.listName + '\')/items' + this.query, cache);
		};
	};
	that.fetchAllItems = function(listName) {
		return new that.fetchItems(listName)
			.top()
			.execute();
	};
	that.fetchUserByEmail = function(email) {
		return that.fetchJson('_api/web/siteusers/getbyemail(\'' + email + '\')');
	};

	function securityValidation() {
		$http.post(sharePointUrl + '_api/contextinfo').success(function(data) {
			var siteContextinfo = data.d.GetContextWebInformation;
			that.validationTimeout = siteContextinfo.FormDigestTimeoutSeconds - 10;
			that.validation = siteContextinfo.FormDigestValue;
			$timeout(function() {
				securityValidation();
			}, that.validationTimeout * 1000);
		});
	}

	securityValidation();

	return that;
});
