/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-29 16:42:33
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-01 13:51:08
 */

'use strict';

/* jasmine specs for the availability factory */
describe('Area object', function() {
	var dataService, Data, Area, $httpBackend, positions, Position;

	beforeEach(module(ApplicationConfiguration.applicationModuleName));

	// setup for the execution of each test
	beforeEach(function() {
		var thisPrep = this;

		// assign local variable to injections of services.
		inject(function($injector) {
			Data = $injector.get('Data');
			Area = $injector.get('Area');
			dataService = $injector.get('dataService');
			$httpBackend = $injector.get('$httpBackend');
			positions = $injector.get('positions');
			Position = $injector.get('Position');
		});

		// $httpBackend Config
		$httpBackend.whenGET(
			'https://inet.byui.edu/sites/TestingServices/_api/lists/getbytitle(\'Area\')/items(\'2\')'
		).respond({
			d: {}
		});
		$httpBackend.whenPOST(
			'https://inet.byui.edu/sites/TestingServices/_api/lists/getbytitle(\'Area\')/items(2)'
		).respond([]);
		$httpBackend.whenPOST(
			'https://inet.byui.edu/sites/TestingServices/_api/contextinfo'
		).respond({
			d: {
				GetContextWebInformation: {
					FormDigestTimeoutSeconds: 30,
					FormDigestValue: ''
				}
			}
		});
		$httpBackend.whenPOST(
			'https://inet.byui.edu/sites/TestingServices/_api/lists/getbytitle(\'Area\')/items'
		).respond({
			d: {}
		});

		$httpBackend.flush();

		// array and object initialization
		positions.list[0] = new Position({
			Id: 6
		});
		this.testObject = new Area({
			"__metadata": {
				"id": "Web/Lists(guid'73f1aaaf-8a88-47e7-b02b-5c6e6b353978')/Items(2)",
				"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'73f1aaaf-8a88-47e7-b02b-5c6e6b353978')/Items(2)",
				"etag": "\"4\"",
				"type": "SP.Data.AreaListItem"
			},
			"FirstUniqueAncestorSecurableObject": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'73f1aaaf-8a88-47e7-b02b-5c6e6b353978')/Items(2)/FirstUniqueAncestorSecurableObject"
				}
			},
			"RoleAssignments": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'73f1aaaf-8a88-47e7-b02b-5c6e6b353978')/Items(2)/RoleAssignments"
				}
			},
			"AttachmentFiles": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'73f1aaaf-8a88-47e7-b02b-5c6e6b353978')/Items(2)/AttachmentFiles"
				}
			},
			"ContentType": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'73f1aaaf-8a88-47e7-b02b-5c6e6b353978')/Items(2)/ContentType"
				}
			},
			"FieldValuesAsHtml": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'73f1aaaf-8a88-47e7-b02b-5c6e6b353978')/Items(2)/FieldValuesAsHtml"
				}
			},
			"FieldValuesAsText": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'73f1aaaf-8a88-47e7-b02b-5c6e6b353978')/Items(2)/FieldValuesAsText"
				}
			},
			"FieldValuesForEdit": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'73f1aaaf-8a88-47e7-b02b-5c6e6b353978')/Items(2)/FieldValuesForEdit"
				}
			},
			"File": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'73f1aaaf-8a88-47e7-b02b-5c6e6b353978')/Items(2)/File"
				}
			},
			"Folder": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'73f1aaaf-8a88-47e7-b02b-5c6e6b353978')/Items(2)/Folder"
				}
			},
			"ParentList": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'73f1aaaf-8a88-47e7-b02b-5c6e6b353978')/Items(2)/ParentList"
				}
			},
			"FileSystemObjectType": 0,
			"Id": 2,
			"ContentTypeId": "0x010053F9BEB474E12346B2A4830AC39B9482",
			"Title": null,
			"Area": "Saras",
			"Description": "Saras",
			"DefaultPositionId": 6,
			"ID": 2,
			"Modified": "2015-01-28T16:09:58Z",
			"Created": "2014-08-05T15:22:07Z",
			"AuthorId": 11,
			"EditorId": 11,
			"OData__UIVersionString": "1.0",
			"Attachments": false,
			"GUID": "9da28bfd-7fcc-4c3e-8446-5752679691ab"
		});

		// Spies
		spyOn(dataService, 'addItem').andCallThrough();
		spyOn(dataService, 'updateItem').andCallThrough();
		spyOn(dataService, 'fetchItem').andCallThrough();
		spyOn(dataService, 'deleteItem').andCallThrough();
		spyOn(this.testObject, 'updateData').andCallThrough();
	});

	// verify that we have cleaned up all of our $httpBackend usage.
	afterEach(function() {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	})

	it('should be able to be instantiated', function() {
		expect(this.testObject).not.toBe(null);
	});
	describe('"listname" property', function() {
		it('should be "Area"', function() {
			expect(this.testObject.listName).toBe('Area');
		});
	});
	describe('"initAttributes" method', function() {
		beforeEach(function() {
			this.testObject.initAttributes();
		});
		it('should populate the properties.', function() {
			expect(this.testObject.Id).toBe(2);
			expect(this.testObject.Description).toBe('Saras');
			expect(this.testObject.DefaultPositionId).toBe(6);
			expect(this.testObject.Modified).toEqual(new Date('2015-01-28T16:09:58Z'));
			expect(this.testObject.Created).toEqual(new Date('2014-08-05T15:22:07Z'));
			expect(this.testObject.__metadata).toEqual({
				'id': 'Web/Lists(guid\'73f1aaaf-8a88-47e7-b02b-5c6e6b353978\')/Items(2)',
				'uri': 'https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid\'73f1aaaf-8a88-47e7-b02b-5c6e6b353978\')/Items(2)',
				'etag': '"4"',
				'type': 'SP.Data.AreaListItem'
			});
			expect(this.testObject.DefaultPosition).toEqual(positions.list[0]);
			expect(this.testObject.Positions).toEqual([]);
		});
		it('should call the "updateData()" method.', function() {
			expect(this.testObject.updateData).toHaveBeenCalled();
		});
	});
	describe('"updateData" method', function() {
		it('should the data property.', function() {
			expect(this.testObject.data).toEqual({
				Area: this.testObject.Area,
				Description: this.testObject.Description,
				DefaultPositionId: this.testObject.DefaultPositionId,
				__metadata: this.testObject.__metadata
			});
		});
	});
	describe('"toString" method', function() {
		it('should return "New Area if the Description property is undefined.', function() {
			expect(new Area().toString()).toEqual('New Area');
		});
		it('should return "Saras Area" if the Description property is defined.', function() {
			expect(this.testObject.toString()).toEqual('Saras Area');
		});
	});
	describe('"add" method', function() {
		beforeEach(function() {
			this.tempTestObject = new Area({
				Id: 16
			});
			this.tempTestObject.add(true);
			$httpBackend.flush();
		});
		it('should call the "dataService.addItem()" method.', function() {
			expect(dataService.addItem).toHaveBeenCalled();
		});
	});
	describe('"refresh" method', function() {
		it('should call the "dataService.fetchItem()" method.', function() {
			this.testObject.refresh(true);
			$httpBackend.flush();
			expect(dataService.fetchItem).toHaveBeenCalled();
		});
	});
	describe('"remove" method', function() {
		beforeEach(function() {
			this.testObject.remove(true);
			$httpBackend.flush();
		});
		it('should call the "dataService.deleteItem()" method.', function() {
			expect(dataService.deleteItem).toHaveBeenCalled();
		});
		xit('should remove the item from the availabilities list.', function() {});
	});
});
