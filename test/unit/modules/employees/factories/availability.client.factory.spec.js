/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-29 17:59:52
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-04-29 18:44:02
 */

'use strict';

/* jasmine spacs for the availability factory */
describe('Availability object', function() {
	var dataService, Data, Availability, $httpBackend, employees;

	beforeEach(module(ApplicationConfiguration.applicationModuleName));

	// mock the dataService until I have it properly defined.
	beforeEach(module(function($provide) {
		$provide.value('semesters', {
			list: []
		});
	}));

	// setup for the execution of each test
	beforeEach(function() {
		var thisPrep = this;

		// assign local variable to injections of services.
		inject(function($injector) {
			Data = $injector.get('Data');
			Availability = $injector.get('Availability');
			dataService = $injector.get('dataService');
			$httpBackend = $injector.get('$httpBackend');
			employees = $injector.get('employees');
		});

		// $httpBackend Config
		$httpBackend.whenGET(
			'https://inet.byui.edu/sites/TestingServices/_api/lists/getbytitle(\'Availability\')/items(\'16\')').respond({
			d: {}
		});
		$httpBackend.whenPOST(
			'https://inet.byui.edu/sites/TestingServices/_api/lists/getbytitle(\'Availability\')/items(16)').respond([]);
		$httpBackend.whenPOST('https://inet.byui.edu/sites/TestingServices/_api/contextinfo').respond({
			d: {
				GetContextWebInformation: {
					FormDigestTimeoutSeconds: 30,
					FormDigestValue: ''
				}
			}
		});
		$httpBackend.whenPOST(
			'https://inet.byui.edu/sites/TestingServices/_api/lists/getbytitle(\'Availability\')/items').respond({
			d: {}
		});

		$httpBackend.flush();

		// array and object initialization
		employees.list[0] = {
			Id: 6934,
			string: 'Hello world!',
			toString: function() {
				return this.string;
			}
		};
		this.testObject = new Availability({
			"__metadata": {
				"id": "Web/Lists(guid'5b713622-fea2-4cd4-8f8a-1d852fb8a9c9')/Items(16)",
				"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'5b713622-fea2-4cd4-8f8a-1d852fb8a9c9')/Items(16)",
				"etag": "\"3\"",
				"type": "SP.Data.AvailabilityListItem"
			},
			"FirstUniqueAncestorSecurableObject": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'5b713622-fea2-4cd4-8f8a-1d852fb8a9c9')/Items(16)/FirstUniqueAncestorSecurableObject"
				}
			},
			"RoleAssignments": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'5b713622-fea2-4cd4-8f8a-1d852fb8a9c9')/Items(16)/RoleAssignments"
				}
			},
			"AttachmentFiles": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'5b713622-fea2-4cd4-8f8a-1d852fb8a9c9')/Items(16)/AttachmentFiles"
				}
			},
			"ContentType": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'5b713622-fea2-4cd4-8f8a-1d852fb8a9c9')/Items(16)/ContentType"
				}
			},
			"FieldValuesAsHtml": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'5b713622-fea2-4cd4-8f8a-1d852fb8a9c9')/Items(16)/FieldValuesAsHtml"
				}
			},
			"FieldValuesAsText": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'5b713622-fea2-4cd4-8f8a-1d852fb8a9c9')/Items(16)/FieldValuesAsText"
				}
			},
			"FieldValuesForEdit": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'5b713622-fea2-4cd4-8f8a-1d852fb8a9c9')/Items(16)/FieldValuesForEdit"
				}
			},
			"File": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'5b713622-fea2-4cd4-8f8a-1d852fb8a9c9')/Items(16)/File"
				}
			},
			"Folder": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'5b713622-fea2-4cd4-8f8a-1d852fb8a9c9')/Items(16)/Folder"
				}
			},
			"ParentList": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'5b713622-fea2-4cd4-8f8a-1d852fb8a9c9')/Items(16)/ParentList"
				}
			},
			"FileSystemObjectType": 0,
			"Id": 16,
			"EmployeeId": 6934,
			"Current": true,
			"Title": "N8DGR8",
			"ContentTypeId": "0x0100575CE4D72755134E8C877A076710196E",
			"Day": "Tuesday",
			"StartTime": "1970-01-01T14:30:00Z",
			"EndTime": "1970-01-01T18:25:00Z",
			"SemesterId": 1,
			"Active": null,
			"ID": 16,
			"Modified": "2015-01-06T23:49:30Z",
			"Created": "2014-09-19T05:05:53Z",
			"AuthorId": 178,
			"EditorId": 11,
			"OData__UIVersionString": "1.0",
			"Attachments": false,
			"GUID": "85c66de1-b759-438c-919a-125336a54128"
		});

		// Spies
		spyOn(dataService, 'addItem').andCallThrough();
		spyOn(dataService, 'updateItem').andCallThrough();
		spyOn(dataService, 'fetchItem').andCallThrough();
		spyOn(dataService, 'deleteItem').andCallThrough();
		spyOn(this.testObject, 'updateData').andCallThrough();
		spyOn(this.testObject.Employee, 'toString').andCallThrough();
	});

	// verify that we have cleaned up all of our $httpBackend usage.
	afterEach(function() {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	})

	it('should be able to be instantiated', function() {
		expect(this.testObject).not.toBe(null);
	});
	it('should have matching "Current" and "Active" properties.', function() {
		expect(this.testObject.Current).toBe(this.testObject.Active);
	});
	describe('"listname" property', function() {
		it('should be "Availability"', function() {
			expect(this.testObject.listName).toBe('Availability');
		});
	});
	describe('"initAttributes" method', function() {
		beforeEach(function() {
			this.testObject.initAttributes();
		});
		it('should populate the properties.', function() {
			expect(this.testObject.Id).toBe(16);
			expect(this.testObject.EmployeeId).toBe(6934);
			expect(this.testObject.Current).toBe(true);
			expect(this.testObject.Day).toBe('Tuesday');
			expect(this.testObject.StartTime).toEqual(new Date('1970-01-01T14:30:00Z'));
			expect(this.testObject.EndTime).toEqual(new Date('1970-01-01T18:25:00Z'));
			expect(this.testObject.SemesterId).toBe(1);
			expect(this.testObject.Modified).toEqual(new Date('2015-01-06T23:49:30Z'));
			expect(this.testObject.Created).toEqual(new Date('2014-09-19T05:05:53Z'));
			expect(this.testObject.__metadata).toEqual({
				"id": "Web/Lists(guid'5b713622-fea2-4cd4-8f8a-1d852fb8a9c9')/Items(16)",
				"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'5b713622-fea2-4cd4-8f8a-1d852fb8a9c9')/Items(16)",
				"etag": "\"3\"",
				"type": "SP.Data.AvailabilityListItem"
			});
		});
		it('should call the "updateData()" method.', function() {
			expect(this.testObject.updateData).toHaveBeenCalled();
		});
	});
	describe('"updateData" method', function() {
		it('should the data property.', function() {
			expect(this.testObject.data).toEqual({
				Active: this.testObject.Active,
				Current: this.testObject.Current,
				Day: this.testObject.Day,
				EmployeeId: this.testObject.EmployeeId,
				EndTime: this.testObject.EndTime,
				SemesterId: this.testObject.SemesterId,
				StartTime: this.testObject.StartTime,
				__metadata: this.testObject.__metadata
			});
		});
	});
	describe('"toString" method', function() {
		it('should return "New Availability if no employee is attached.', function() {
			this.testObject.Employee = undefined;
			expect(this.testObject.toString()).toEqual('New Availability');
		});
		it('should call the "Employee.toString()" method if there is an employee attached.', function() {
			expect(this.testObject.toString()).toEqual('Hello world!\'s availability');
			expect(this.testObject.Employee.toString).toHaveBeenCalled();
		});
	});
	describe('"add" method', function() {
		beforeEach(function() {
			this.tempTestObject = new Availability({
				Id: 16
			});
			this.tempTestObject.Current = false;
			this.tempTestObject.Active = null;
			this.tempTestObject.add(true);
			$httpBackend.flush();
		});
		it('should call the "dataService.addItem()" method.', function() {
			expect(dataService.addItem).toHaveBeenCalled();
		});
	});
	describe('"deactivate" method', function() {
		beforeEach(function() {
			this.testObject.deactivate(true);
			$httpBackend.flush();
		});
		it('should call the "dataService.updateItem" method.', function() {
			expect(dataService.updateItem).toHaveBeenCalled();
		});
		it('should set both "Current" and "Active" properties to false', function() {
			expect(this.testObject.Current).toBe(false);
			expect(this.testObject.Active).toBe(this.testObject.Current);
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
