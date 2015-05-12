(function() {

	'use strict';
	/* jasmine spacs for the availability factory */
	describe('NoTestingDay object', function() {
		var testObject, dataService, Data, NoTestingDay, $httpBackend, noTestingDays, semesters;

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
			$provide.value('currentSemester', {
				Id: 1
			});
		}));

		// setup for the execution of each test
		beforeEach(function() {
			var thisPrep = this;
			// assign local variable to injections of services.
			inject(function($injector) {
				Data = $injector.get('Data');
				NoTestingDay = $injector.get('NoTestingDay');
				dataService = $injector.get('dataService');
				$httpBackend = $injector.get('$httpBackend');
				noTestingDays = $injector.get('noTestingDays');
				semesters = $injector.get('semesters');
			});

			// $httpBackend Config
			$httpBackend.whenGET('https://inet.byui.edu/sites/TestingServices/_api/lists/getbytitle(\'NoTestingDay\')/items(\'3\')').respond({
				d: {
					Id: 3
				}
			});
			$httpBackend.whenPOST('https://inet.byui.edu/sites/TestingServices/_api/lists/getbytitle(\'NoTestingDay\')/items(3)').respond([]);
			$httpBackend.whenPOST('https://inet.byui.edu/sites/TestingServices/_api/lists/getbytitle(\'NoTestingDay\')/items').respond({
				d: {
					Id: 3
				}
			});

			// array and object initialization
			semesters.list[0] = {
				Id: 1
			};

			testObject = new NoTestingDay({
				"__metadata": {
					"id": "Web/Lists(guid'd15e5ce2-243c-4903-945e-7ceb1d9ed056')/Items(3)",
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'd15e5ce2-243c-4903-945e-7ceb1d9ed056')/Items(3)",
					"etag": "\"1\"",
					"type": "SP.Data.NoTestingDayListItem"
				},
				"FirstUniqueAncestorSecurableObject": {
					"__deferred": {
						"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'd15e5ce2-243c-4903-945e-7ceb1d9ed056')/Items(3)/FirstUniqueAncestorSecurableObject"
					}
				},
				"RoleAssignments": {
					"__deferred": {
						"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'd15e5ce2-243c-4903-945e-7ceb1d9ed056')/Items(3)/RoleAssignments"
					}
				},
				"AttachmentFiles": {
					"__deferred": {
						"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'd15e5ce2-243c-4903-945e-7ceb1d9ed056')/Items(3)/AttachmentFiles"
					}
				},
				"ContentType": {
					"__deferred": {
						"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'd15e5ce2-243c-4903-945e-7ceb1d9ed056')/Items(3)/ContentType"
					}
				},
				"FieldValuesAsHtml": {
					"__deferred": {
						"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'd15e5ce2-243c-4903-945e-7ceb1d9ed056')/Items(3)/FieldValuesAsHtml"
					}
				},
				"FieldValuesAsText": {
					"__deferred": {
						"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'd15e5ce2-243c-4903-945e-7ceb1d9ed056')/Items(3)/FieldValuesAsText"
					}
				},
				"FieldValuesForEdit": {
					"__deferred": {
						"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'd15e5ce2-243c-4903-945e-7ceb1d9ed056')/Items(3)/FieldValuesForEdit"
					}
				},
				"File": {
					"__deferred": {
						"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'd15e5ce2-243c-4903-945e-7ceb1d9ed056')/Items(3)/File"
					}
				},
				"Folder": {
					"__deferred": {
						"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'd15e5ce2-243c-4903-945e-7ceb1d9ed056')/Items(3)/Folder"
					}
				},
				"ParentList": {
					"__deferred": {
						"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'd15e5ce2-243c-4903-945e-7ceb1d9ed056')/Items(3)/ParentList"
					}
				},
				"FileSystemObjectType": 0,
				"Id": 3,
				"ContentTypeId": "0x01004BADC479BBE0614FA3518110D5A2D8B7",
				"Title": "Black Friday",
				"Date": "2014-11-28T07:00:00Z",
				"Description": "Black Friday",
				"SemesterId": 1,
				"ID": 3,
				"Modified": "2014-12-13T00:05:09Z",
				"Created": "2014-12-13T00:05:09Z",
				"AuthorId": 11,
				"EditorId": 11,
				"OData__UIVersionString": "1.0",
				"Attachments": false,
				"GUID": "b1b803e6-37cc-49a5-b9d7-e13f0a46cee0"
			});

			// Spies
			spyOn(dataService, 'addItem').andCallThrough();
			spyOn(dataService, 'updateItem').andCallThrough();
			spyOn(dataService, 'fetchItem').andCallThrough();
			spyOn(dataService, 'deleteItem').andCallThrough();
			spyOn(NoTestingDay.prototype, 'updateData').andCallThrough();
			spyOn(NoTestingDay.prototype, 'initAttributes').andCallThrough();
			spyOn(NoTestingDay.prototype, 'add').andCallThrough();
			spyOn(NoTestingDay.prototype, 'update').andCallThrough();
			spyOn(NoTestingDay.prototype, 'refresh').andCallThrough();
		});

		// verify that we have cleaned up all of our $httpBackend usage.
		afterEach(function() {
			$httpBackend.verifyNoOutstandingExpectation();
			$httpBackend.verifyNoOutstandingRequest();
		});

		it('should be able to be instantiated', function() {
			expect(testObject).not.toBe(null);
		});
		describe('"listname" property', function() {
			it('should be "NoTestingDay"', function() {
				expect(testObject.listName).toBe('NoTestingDay');
			});
		});
		describe('"initAttributes" method', function() {
			beforeEach(function() {
				testObject.initAttributes();
			});
			it('should populate the properties.', function() {
				expect(testObject.Date).toEqual(new Date('2014-11-28T07:00:00Z'));
				expect(testObject.Description).toBe('Black Friday');
				expect(testObject.SemesterId).toBe(1);
				expect(testObject.Semester).toEqual({
					Id: 1
				});
				expect(testObject.Title).toBe('Black Friday');

				/************Values that are common to most objects************/
				expect(testObject.Created).toEqual(new Date('2014-12-13T00:05:09Z'));
				expect(testObject.GUID).toBe('b1b803e6-37cc-49a5-b9d7-e13f0a46cee0');
				expect(testObject.Id).toBe(3);
				expect(testObject.Modified).toEqual(new Date('2014-12-13T00:05:09Z'));
				expect(testObject.__metadata).toEqual({
					'id': 'Web/Lists(guid\'d15e5ce2-243c-4903-945e-7ceb1d9ed056\')/Items(3)',
					'uri': 'https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid\'d15e5ce2-243c-4903-945e-7ceb1d9ed056\')/Items(3)',
					'etag': '"1"',
					'type': 'SP.Data.NoTestingDayListItem'
				});
			});
			it('should call the "updateData()" method.', function() {
				expect(NoTestingDay.prototype.updateData).toHaveBeenCalled();
			});
		});
		describe('"updateData" method', function() {
			it('should populate the data property.', function() {
				expect(testObject.data).toEqual({
					__metadata: {
						'id': 'Web/Lists(guid\'d15e5ce2-243c-4903-945e-7ceb1d9ed056\')/Items(3)',
						'uri': 'https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid\'d15e5ce2-243c-4903-945e-7ceb1d9ed056\')/Items(3)',
						'etag': '"1"',
						'type': 'SP.Data.NoTestingDayListItem'
					},
					Date: new Date('2014-11-28T07:00:00Z'),
					Description: 'Black Friday',
					SemesterId: 1,
					Title: 'Black Friday'
				});
			});
		});
		describe('"toString" method', function() {
			it('should return the Title if there is one.', function() {
				expect(testObject.toString()).toBe('Black Friday');
			});
			it('should return "New no testing day" if the Title is undefined', function() {
				testObject.Title = undefined;
				expect(testObject.toString()).toBe('New no testing day');
			});
		});
		describe('"add" method', function() {
			beforeEach(function() {
				this.tempTestObject1 = new NoTestingDay({
					Id: 3
				});
				NoTestingDay.prototype.updateData.reset();
				this.tempTestObject1.add(true);
				$httpBackend.flush();
			});
			it('should call the "updateData()" method.', function() {
				expect(NoTestingDay.prototype.updateData.callCount).toBe(2);
			});
			it('should call the "initAttributes()" method.', function() {
				expect(NoTestingDay.prototype.initAttributes).toHaveBeenCalled();
			});
			it('should call the "dataService.addItem()" method.', function() {
				expect(dataService.addItem).toHaveBeenCalled();
			});
		});
		describe('"refresh" method', function() {
			beforeEach(function() {
				testObject.refresh(true);
				$httpBackend.flush();
			});
			it('should call the "dataService.fetchItem()" method.', function() {
				expect(dataService.fetchItem).toHaveBeenCalled();
			});
			it('should call the "initAttributes()" method.', function() {
				expect(NoTestingDay.prototype.initAttributes).toHaveBeenCalled();
			});
		});
		describe('"remove" method', function() {
			beforeEach(function() {
				testObject.remove(true);
				$httpBackend.flush();
			});
			it('should call the "dataService.deleteItem()" method.', function() {
				expect(dataService.deleteItem).toHaveBeenCalled();
			});
			xit('should remove the item from the availabilities list.', function() {});
		});
		describe('"update" method', function() {
			beforeEach(function() {
				NoTestingDay.prototype.updateData.reset();
				testObject.update(true);
				$httpBackend.flush();
			});
			it('should call the "updateData()" method.', function() {
				expect(NoTestingDay.prototype.updateData.callCount).toBe(2);
			});
			it('should call the "refresh()" method.', function() {
				expect(NoTestingDay.prototype.refresh).toHaveBeenCalled();
			});
			it('should call the "dataService.updateItem()" method.', function() {
				expect(dataService.updateItem).toHaveBeenCalled();
			});
		});
	});
})();
