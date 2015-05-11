(function() {

	'use strict';
	/* jasmine spacs for the availability factory */
	describe('FacultyTestingInfo object', function() {
		var testObject, dataService, Data, FacultyTestingInfo, $httpBackend, Professor, professors, facultyTestingInfos;

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
				Id: 2
			});
			$provide.factory('Professor', [
				function() {
					function Professor(empId) {
						this.Id = empId;
					}
					Professor.prototype.toString = function() {
						return 'Temp Professor';
					};
					return Professor;
				}
			]);
		}));

		// setup for the execution of each test
		beforeEach(function() {
			var thisPrep = this;
			// assign local variable to injections of services.
			inject(function($injector) {
				Data = $injector.get('Data');
				FacultyTestingInfo = $injector.get('FacultyTestingInfo');
				dataService = $injector.get('dataService');
				$httpBackend = $injector.get('$httpBackend');
				professors = $injector.get('professors');
				facultyTestingInfos = $injector.get('facultyTestingInfos');
				Professor = $injector.get('Professor');
			});

			// $httpBackend Config
			$httpBackend.whenGET('https://inet.byui.edu/sites/TestingServices/_api/lists/getbytitle(\'FacultyTestingInfo\')/items(\'100\')').respond({
				d: {
					Id: 100
				}
			});
			$httpBackend.whenPOST('https://inet.byui.edu/sites/TestingServices/_api/lists/getbytitle(\'FacultyTestingInfo\')/items(100)').respond([]);
			$httpBackend.whenPOST('https://inet.byui.edu/sites/TestingServices/_api/lists/getbytitle(\'FacultyTestingInfo\')/items').respond({
				d: {
					Id: 100
				}
			});

			// array and object initialization
			professors.list[0] = new Professor(28)

			testObject = new FacultyTestingInfo({
				"__metadata": {
					"id": "Web/Lists(guid'3afc995b-cdc2-49c3-a0c7-fc4759ab7e9f')/Items(100)",
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'3afc995b-cdc2-49c3-a0c7-fc4759ab7e9f')/Items(100)",
					"etag": "\"1\"",
					"type": "SP.Data.FacultyTestingInfoListItem"
				},
				"FirstUniqueAncestorSecurableObject": {
					"__deferred": {
						"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'3afc995b-cdc2-49c3-a0c7-fc4759ab7e9f')/Items(100)/FirstUniqueAncestorSecurableObject"
					}
				},
				"RoleAssignments": {
					"__deferred": {
						"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'3afc995b-cdc2-49c3-a0c7-fc4759ab7e9f')/Items(100)/RoleAssignments"
					}
				},
				"AttachmentFiles": {
					"__deferred": {
						"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'3afc995b-cdc2-49c3-a0c7-fc4759ab7e9f')/Items(100)/AttachmentFiles"
					}
				},
				"ContentType": {
					"__deferred": {
						"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'3afc995b-cdc2-49c3-a0c7-fc4759ab7e9f')/Items(100)/ContentType"
					}
				},
				"FieldValuesAsHtml": {
					"__deferred": {
						"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'3afc995b-cdc2-49c3-a0c7-fc4759ab7e9f')/Items(100)/FieldValuesAsHtml"
					}
				},
				"FieldValuesAsText": {
					"__deferred": {
						"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'3afc995b-cdc2-49c3-a0c7-fc4759ab7e9f')/Items(100)/FieldValuesAsText"
					}
				},
				"FieldValuesForEdit": {
					"__deferred": {
						"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'3afc995b-cdc2-49c3-a0c7-fc4759ab7e9f')/Items(100)/FieldValuesForEdit"
					}
				},
				"File": {
					"__deferred": {
						"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'3afc995b-cdc2-49c3-a0c7-fc4759ab7e9f')/Items(100)/File"
					}
				},
				"Folder": {
					"__deferred": {
						"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'3afc995b-cdc2-49c3-a0c7-fc4759ab7e9f')/Items(100)/Folder"
					}
				},
				"ParentList": {
					"__deferred": {
						"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'3afc995b-cdc2-49c3-a0c7-fc4759ab7e9f')/Items(100)/ParentList"
					}
				},
				"FileSystemObjectType": 0,
				"Id": 100,
				"ProfessorId": 28,
				"Stipulation": "Take before you work.",
				"Other": null,
				"Title": null,
				"ContentTypeId": "0x0100B79D5A2CBE886C4899404CCCE1EB0FB3",
				"ID": 100,
				"Modified": "2014-09-18T01:48:07Z",
				"Created": "2014-09-18T01:48:07Z",
				"AuthorId": 11,
				"EditorId": 11,
				"OData__UIVersionString": "1.0",
				"Attachments": false,
				"GUID": "86282081-9678-426e-8658-965fdc7a9afc"
			});

			// Spies
			spyOn(dataService, 'addItem').andCallThrough();
			spyOn(dataService, 'updateItem').andCallThrough();
			spyOn(dataService, 'fetchItem').andCallThrough();
			spyOn(dataService, 'deleteItem').andCallThrough();
			spyOn(FacultyTestingInfo.prototype, 'updateData').andCallThrough();
			spyOn(FacultyTestingInfo.prototype, 'initAttributes').andCallThrough();
			spyOn(FacultyTestingInfo.prototype, 'add').andCallThrough();
			spyOn(FacultyTestingInfo.prototype, 'update').andCallThrough();
			spyOn(FacultyTestingInfo.prototype, 'refresh').andCallThrough();
			spyOn(Professor.prototype, 'toString').andCallThrough();
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
			it('should be "FacultyTestingInfo"', function() {
				expect(testObject.listName).toBe('FacultyTestingInfo');
			});
		});
		describe('"initAttributes" method', function() {
			beforeEach(function() {
				testObject.initAttributes();
			});
			it('should populate the properties.', function() {
				expect(testObject.Stipulation).toBe('Take before you work.');
				expect(testObject.Professor).toEqual({
					Id: 28
				});
				expect(testObject.ProfessorId).toBe(28);
				expect(testObject.Other).toBeUndefined();
				expect(testObject.Created).toEqual(new Date('2014-09-18T01:48:07Z'));
				expect(testObject.GUID).toBe('86282081-9678-426e-8658-965fdc7a9afc');
				expect(testObject.Id).toBe(100);
				expect(testObject.Modified).toEqual(new Date('2014-09-18T01:48:07Z'));
				expect(testObject.__metadata).toEqual({
					'id': 'Web/Lists(guid\'3afc995b-cdc2-49c3-a0c7-fc4759ab7e9f\')/Items(100)',
					'uri': 'https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid\'3afc995b-cdc2-49c3-a0c7-fc4759ab7e9f\')/Items(100)',
					'etag': '"1"',
					'type': 'SP.Data.FacultyTestingInfoListItem'
				});
			});
			it('should call the "updateData()" method.', function() {
				expect(FacultyTestingInfo.prototype.updateData).toHaveBeenCalled();
			});
		});
		describe('"updateData" method', function() {
			it('should populate the data property.', function() {
				expect(testObject.data).toEqual({
					__metadata: {
						'id': 'Web/Lists(guid\'3afc995b-cdc2-49c3-a0c7-fc4759ab7e9f\')/Items(100)',
						'uri': 'https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid\'3afc995b-cdc2-49c3-a0c7-fc4759ab7e9f\')/Items(100)',
						'etag': '"1"',
						'type': 'SP.Data.FacultyTestingInfoListItem'
					},
					ProfessorId: 28,
					Stipulation: 'Take before you work.',
					Other: undefined
				});
			});
		});
		describe('"toString" method', function() {
			it('should call the "Professor.toString()" method if the Professor is defined.', function() {
				var result = testObject.toString();
				expect(Professor.prototype.toString).toHaveBeenCalled();
			});
			it('should return the Professor\'s name followed by "\'s testing information" if the Professor is defined.', function() {
				expect(testObject.toString()).toBe('Temp Professor\'s testing information');
			});
			it('should return "New FacultyTestingInfo" if the employee is undefined', function() {
				testObject.Professor = undefined;
				expect(testObject.toString()).toBe('New FacultyTestingInfo');
			});
		});
		describe('"add" method', function() {
			beforeEach(function() {
				this.tempTestObject1 = new FacultyTestingInfo({
					Id: 100
				});
				FacultyTestingInfo.prototype.updateData.reset();
				this.tempTestObject1.add(true);
				$httpBackend.flush();
			});
			it('should call the "updateData()" method.', function() {
				expect(FacultyTestingInfo.prototype.updateData.callCount).toBe(2);
			});
			it('should call the "initAttributes()" method.', function() {
				expect(FacultyTestingInfo.prototype.initAttributes).toHaveBeenCalled();
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
				expect(FacultyTestingInfo.prototype.initAttributes).toHaveBeenCalled();
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
				FacultyTestingInfo.prototype.updateData.reset();
				testObject.update(true);
				$httpBackend.flush();
			});
			it('should call the "updateData()" method.', function() {
				expect(FacultyTestingInfo.prototype.updateData.callCount).toBe(2);
			});
			it('should call the "refresh()" method.', function() {
				expect(FacultyTestingInfo.prototype.refresh).toHaveBeenCalled();
			});
			it('should call the "dataService.updateItem()" method.', function() {
				expect(dataService.updateItem).toHaveBeenCalled();
			});
		});
	});
})();
