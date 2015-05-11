/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-29 16:36:13
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-04-29 18:46:19
 */

'use strict';

/* jasmine spacs for the availability factory */
describe('AreaPosition object', function() {
	var dataService, Data, AreaPosition, $httpBackend, testObject, positions, areas;

	beforeEach(module(ApplicationConfiguration.applicationModuleName));

	// setup for the execution of each test
	beforeEach(function() {
		// assign local variable to injections of services.
		inject(function($injector) {
			Data = $injector.get('Data');
			AreaPosition = $injector.get('AreaPosition');
			dataService = $injector.get('dataService');
			$httpBackend = $injector.get('$httpBackend');
			areas = $injector.get('areas');
			positions = $injector.get('positions');
		});

		// $httpBackend Config
		$httpBackend.whenGET(
			'https://inet.byui.edu/sites/TestingServices/_api/lists/getbytitle(\'AreaPosition\')/items(\'2\')').respond({
			d: {}
		});
		$httpBackend.whenPOST(
			'https://inet.byui.edu/sites/TestingServices/_api/lists/getbytitle(\'AreaPosition\')/items(2)').respond([]);
		$httpBackend.whenPOST('https://inet.byui.edu/sites/TestingServices/_api/contextinfo').respond({
			d: {
				GetContextWebInformation: {
					FormDigestTimeoutSeconds: 30,
					FormDigestValue: ''
				}
			}
		});
		$httpBackend.whenPOST(
			'https://inet.byui.edu/sites/TestingServices/_api/lists/getbytitle(\'AreaPosition\')/items').respond({
			d: {}
		});

		// Flush any calls made during instantiation
		$httpBackend.flush();

		// array and object initialization
		positions.list[0] = {
			Id: 4,
			Description: 'Test Position',
		};
		areas.list[0] = {
			Id: 1,
			Description: 'Test Area',
			Positions: []
		};
		testObject = new AreaPosition({
			"__metadata": {
				"id": "Web/Lists(guid'980240f2-3be4-4c36-afed-0801082ccf72')/Items(2)",
				"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'980240f2-3be4-4c36-afed-0801082ccf72')/Items(2)",
				"etag": "\"1\"",
				"type": "SP.Data.AreaPositionListItem"
			},
			"FirstUniqueAncestorSecurableObject": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'980240f2-3be4-4c36-afed-0801082ccf72')/Items(2)/FirstUniqueAncestorSecurableObject"
				}
			},
			"RoleAssignments": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'980240f2-3be4-4c36-afed-0801082ccf72')/Items(2)/RoleAssignments"
				}
			},
			"AttachmentFiles": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'980240f2-3be4-4c36-afed-0801082ccf72')/Items(2)/AttachmentFiles"
				}
			},
			"ContentType": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'980240f2-3be4-4c36-afed-0801082ccf72')/Items(2)/ContentType"
				}
			},
			"FieldValuesAsHtml": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'980240f2-3be4-4c36-afed-0801082ccf72')/Items(2)/FieldValuesAsHtml"
				}
			},
			"FieldValuesAsText": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'980240f2-3be4-4c36-afed-0801082ccf72')/Items(2)/FieldValuesAsText"
				}
			},
			"FieldValuesForEdit": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'980240f2-3be4-4c36-afed-0801082ccf72')/Items(2)/FieldValuesForEdit"
				}
			},
			"File": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'980240f2-3be4-4c36-afed-0801082ccf72')/Items(2)/File"
				}
			},
			"Folder": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'980240f2-3be4-4c36-afed-0801082ccf72')/Items(2)/Folder"
				}
			},
			"ParentList": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'980240f2-3be4-4c36-afed-0801082ccf72')/Items(2)/ParentList"
				}
			},
			"FileSystemObjectType": 0,
			"Id": 2,
			"ContentTypeId": "0x0100E86BC688A532D04785E32DDF978308A6",
			"Title": null,
			"AreaId": 1,
			"PositionId": 4,
			"ID": 2,
			"Modified": "2015-01-28T20:22:37Z",
			"Created": "2015-01-28T20:22:37Z",
			"AuthorId": 11,
			"EditorId": 11,
			"OData__UIVersionString": "1.0",
			"Attachments": false,
			"GUID": "f17c272c-6422-4017-8ebe-3e623b73e0c0"
		});

		// Spies
		spyOn(dataService, 'addItem').andCallThrough();
		spyOn(dataService, 'updateItem').andCallThrough();
		spyOn(dataService, 'fetchItem').andCallThrough();
		spyOn(dataService, 'deleteItem').andCallThrough();
		spyOn(testObject, 'updateData').andCallThrough();
		spyOn(testObject, 'setAreasPosition').andCallThrough();
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
		it('should be "AreaPosition"', function() {
			expect(testObject.listName).toBe('AreaPosition');
		});
	});
	describe('"initAttributes" method', function() {
		beforeEach(function() {
			testObject.initAttributes();
		});
		it('should populate the properties.', function() {
			expect(testObject.Id).toBe(2);
			expect(testObject.AreaId).toBe(1);
			expect(testObject.PositionId).toBe(4);
			expect(testObject.Modified).toEqual(new Date('2015-01-28T20:22:37Z'));
			expect(testObject.Created).toEqual(new Date('2015-01-28T20:22:37Z'));
			expect(testObject.__metadata).toEqual({
				'id': 'Web/Lists(guid\'980240f2-3be4-4c36-afed-0801082ccf72\')/Items(2)',
				'uri': 'https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid\'980240f2-3be4-4c36-afed-0801082ccf72\')/Items(2)',
				'etag': '"1"',
				'type': 'SP.Data.AreaPositionListItem'
			});
			expect(testObject.Area).toEqual(areas.list[0]);
			expect(testObject.Position).toEqual({
				Id: 4,
				Description: 'Test Position',
			});
		});
		it('should call the "setAreasPosition()" method.', function() {
			expect(testObject.setAreasPosition).toHaveBeenCalled();
		});
		it('should call the "updateData()" method.', function() {
			expect(testObject.updateData).toHaveBeenCalled();
		});
	});
	describe('"updateData" method', function() {
		beforeEach(function() {
			testObject.updateData();
		});
		it('should set the data property.', function() {
			expect(testObject.data).toEqual({
				AreaId: testObject.AreaId,
				PositionId: testObject.PositionId,
				__metadata: testObject.__metadata
			});
		});
	});
	describe('"toString" method', function() {
		it('should return "New AreaPosition if either the Area or Position properties are undefined.', function() {
			expect(new AreaPosition().toString()).toEqual('New AreaPosition');
		});
		it('should return "Saras AreaPosition" if the Description property is defined.', function() {
			expect(testObject.toString()).toEqual('Test Area Test Position');
		});
	});
	describe('"add" method', function() {
		beforeEach(function() {
			this.tempTestObject = new AreaPosition({
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
			testObject.refresh(true);
			$httpBackend.flush();
			expect(dataService.fetchItem).toHaveBeenCalled();
		});
	});
	describe('"remove" method', function() {
		it('should call the "dataService.deleteItem()" method.', function() {
			testObject.remove(true);
			$httpBackend.flush();
			expect(dataService.deleteItem).toHaveBeenCalled();
		});
		xit('should remove the item from the areaPositions list.', function() {});
	});
});
