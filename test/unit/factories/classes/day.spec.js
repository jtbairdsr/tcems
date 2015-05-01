(function() {

	'use strict';
	/* jasmine spacs for the availability factory */
	describe('Day object', function() {
		var dataService, Data, Day, $httpBackend, positions, dateService;

		beforeEach(module('Services'));

		// mock the dataService until I have it properly defined.
		beforeEach(module(function($provide) {
			$provide.service('dataService', [
				function dataService() {
					var service = this;

					// inject the required services and values for the dataService
					inject(function(sharePointUrl, $http) {
						service.sharePointUrl = sharePointUrl;
						service.$http = $http;
					})
					this.fetchJson = function(url) {
						return service.$http.get(url, {
							headers: {
								'accept': 'application/json;odata=verbose',
							}
						});
					}
					this.addItem = function(listName, item) {
						return service.$http.post(this.sharePointUrl +
							'_api/lists/getbytitle(\'' + listName + '\')/items', item);
					};
					this.updateItem = function(listName, itemId, item, etag) {
						return service.$http({
							method: 'POST',
							url: this.sharePointUrl + '_api/lists/getbytitle(\'' +
								listName + '\')/items(' + itemId + ')',
							data: item,
							headers: {
								'accept': 'application/json;odata=verbose',
								'content-type': 'application/json;odata=verbose',
								'IF-MATCH': etag,
								'X-HTTP-Method': 'MERGE'
							}
						});
					};
					this.fetchItem = function(listName, itemId) {
						return this.fetchJson(this.sharePointUrl +
							'_api/lists/getbytitle(\'' + listName + '\')/items(\'' + itemId +
							'\')', false);
					};
					this.deleteItem = function(listName, itemId) {
						return service.$http({
							method: 'POST',
							url: this.sharePointUrl +
								'_api/lists/getbytitle(\'' +
								listName + '\')/items(' + itemId + ')',
							headers: {
								'X-HTTP-Method': 'DELETE',
								'IF-MATCH': '*'
							}
						});
					};
					return this;
				}
			]);
		}));

		// setup for the execution of each test
		beforeEach(function() {
			var thisPrep = this;
			// assign local variable to injections of services.
			inject(function($injector) {
				Data = $injector.get('Data');
				Day = $injector.get('Day');
				dataService = $injector.get('dataService');
				$httpBackend = $injector.get('$httpBackend');
				positions = $injector.get('positions');
				dateService = $injector.get('dateService');
			});

			// $httpBackend Config
			$httpBackend.whenGET('https://inet.byui.edu/sites/TestingServices/_api/lists/getbytitle(\'Day\')/items(\'2\')').respond({
				d: {}
			});
			$httpBackend.whenPOST('https://inet.byui.edu/sites/TestingServices/_api/lists/getbytitle(\'Day\')/items(2)').respond([]);
			$httpBackend.whenPOST('https://inet.byui.edu/sites/TestingServices/_api/lists/getbytitle(\'Day\')/items').respond({
				d: {}
			});

			this.testObject = new Day(new Date('2015-01-28T16:09:58Z'));

			// Spies
			spyOn(dataService, 'addItem').andCallThrough();
			spyOn(dataService, 'updateItem').andCallThrough();
			spyOn(dataService, 'fetchItem').andCallThrough();
			spyOn(dataService, 'deleteItem').andCallThrough();
		});

		// verify that we have cleaned up all of our $httpBackend usage.
		afterEach(function() {
			$httpBackend.verifyNoOutstandingExpectation();
			$httpBackend.verifyNoOutstandingRequest();
		})

		it('should be able to be instantiated', function() {
			expect(this.testObject).toBeDefined();
		});
		describe('"toString" method', function() {
			it('should call the "dataService.addItem()" method.', function() {
				expect(this.testObject.toString()).toEqual('Wednesday the 28th of January');
			});
		});
		// TODO: Finish writing the tests for the various methods of this object.
	});
})();
