/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-06 18:08:41
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-04-29 18:55:17
 */

'use strict';

/* jasmine specs for the employment factory */
describe('Employment object', function() {
	var testObject, dataService, Data, Employment, $httpBackend, Employee, areas, positions, employees, employments;

	beforeEach(module(ApplicationConfiguration.applicationModuleName));

	// mock the dataService until I have it properly defined.
	beforeEach(module(function($provide) {
		$provide.value('currentUser', {});
		$provide.value('schedules', []);
		$provide.value('subShifts', []);
		$provide.value('availabilities', []);
		$provide.value('currentSemester', {
			Id: 2
		});
	}));

	// setup for the execution of each test
	beforeEach(function() {
		var thisPrep = this;

		// assign local variable to injections of services.
		inject(function($injector) {
			Data = $injector.get('Data');
			Employment = $injector.get('Employment');
			dataService = $injector.get('dataService');
			$httpBackend = $injector.get('$httpBackend');
			areas = $injector.get('areas');
			positions = $injector.get('positions');
			employees = $injector.get('employees');
			employments = $injector.get('employments');
			Employee = $injector.get('Employee');
		});

		// $httpBackend Config
		$httpBackend.whenGET(
			'https://inet.byui.edu/sites/TestingServices/_api/lists/getbytitle(\'Employment\')/items(\'4859\')').respond({
			d: {
				Id: 4859
			}
		});
		$httpBackend.whenPOST('https://inet.byui.edu/sites/TestingServices/_api/contextinfo').respond({
			d: {
				GetContextWebInformation: {
					FormDigestTimeoutSeconds: 30,
					FormDigestValue: ''
				}
			}
		});
		$httpBackend.whenPOST(
			'https://inet.byui.edu/sites/TestingServices/_api/lists/getbytitle(\'Employment\')/items(4859)').respond([]);
		$httpBackend.whenPOST('https://inet.byui.edu/sites/TestingServices/_api/lists/getbytitle(\'Employment\')/items').respond({
			d: {
				Id: 4859
			}
		});

		$httpBackend.flush();

		// array and object initialization
		areas.list[0] = {
			Id: 1
		};
		positions.list[0] = {
			Id: 1,
		};
		employees.list[0] = new Employee({
			Id: 6562
		});

		testObject = new Employment({
			"__metadata": {
				"id": "Web/Lists(guid'eecb473d-81d3-40a8-ad9a-d95f1f24d6b3')/Items(4859)",
				"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'eecb473d-81d3-40a8-ad9a-d95f1f24d6b3')/Items(4859)",
				"etag": "\"2\"",
				"type": "SP.Data.EmploymentListItem"
			},
			"FirstUniqueAncestorSecurableObject": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'eecb473d-81d3-40a8-ad9a-d95f1f24d6b3')/Items(4859)/FirstUniqueAncestorSecurableObject"
				}
			},
			"RoleAssignments": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'eecb473d-81d3-40a8-ad9a-d95f1f24d6b3')/Items(4859)/RoleAssignments"
				}
			},
			"AttachmentFiles": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'eecb473d-81d3-40a8-ad9a-d95f1f24d6b3')/Items(4859)/AttachmentFiles"
				}
			},
			"ContentType": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'eecb473d-81d3-40a8-ad9a-d95f1f24d6b3')/Items(4859)/ContentType"
				}
			},
			"FieldValuesAsHtml": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'eecb473d-81d3-40a8-ad9a-d95f1f24d6b3')/Items(4859)/FieldValuesAsHtml"
				}
			},
			"FieldValuesAsText": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'eecb473d-81d3-40a8-ad9a-d95f1f24d6b3')/Items(4859)/FieldValuesAsText"
				}
			},
			"FieldValuesForEdit": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'eecb473d-81d3-40a8-ad9a-d95f1f24d6b3')/Items(4859)/FieldValuesForEdit"
				}
			},
			"File": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'eecb473d-81d3-40a8-ad9a-d95f1f24d6b3')/Items(4859)/File"
				}
			},
			"Folder": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'eecb473d-81d3-40a8-ad9a-d95f1f24d6b3')/Items(4859)/Folder"
				}
			},
			"ParentList": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'eecb473d-81d3-40a8-ad9a-d95f1f24d6b3')/Items(4859)/ParentList"
				}
			},
			"FileSystemObjectType": 0,
			"Id": 4859,
			"ContentTypeId": "0x01009335CF36729AA64B86DA183A55FAAE97",
			"Title": null,
			"StartDate": "2012-01-01T00:00:00Z",
			"EndDate": "2014-07-23T00:00:00Z",
			"EmployeeId": 6562,
			"AreaId": 1,
			"PositionId": 1,
			"ID": 4859,
			"Modified": "2015-02-05T23:50:43Z",
			"Created": "2014-09-09T21:42:41Z",
			"AuthorId": 11,
			"EditorId": 11,
			"OData__UIVersionString": "1.0",
			"Attachments": false,
			"GUID": "85695bcc-2072-4c11-8d11-3006597e7ed8"
		});

		// Spies
		spyOn(dataService, 'addItem').andCallThrough();
		spyOn(dataService, 'updateItem').andCallThrough();
		spyOn(dataService, 'fetchItem').andCallThrough();
		spyOn(dataService, 'deleteItem').andCallThrough();
		spyOn(Employment.prototype, 'updateData').andCallThrough();
		spyOn(Employment.prototype, 'initAttributes').andCallThrough();
		spyOn(Employment.prototype, 'add').andCallThrough();
		spyOn(Employment.prototype, 'update').andCallThrough();
		spyOn(Employee.prototype, 'toString').andCallThrough();
		spyOn(Employment.prototype, 'refresh').andCallThrough();
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
		it('should be "Employment"', function() {
			expect(testObject.listName).toBe('Employment');
		});
	});
	describe('"initAttributes" method', function() {
		beforeEach(function() {
			testObject.initAttributes();
		});
		it('should populate the properties.', function() {
			expect(testObject.Area).toEqual({
				Id: 1
			});
			expect(testObject.AreaId).toBe(1);
			expect(testObject.Created).toEqual(new Date('2014-09-09T21:42:41Z'));
			expect(testObject.Employee).toEqual(new Employee({
				Id: 6562
			}));
			expect(testObject.EndDate).toEqual(new Date('2014-07-23T00:00:00Z'));
			expect(testObject.EmployeeId).toBe(6562);
			expect(testObject.GUID).toBe('85695bcc-2072-4c11-8d11-3006597e7ed8');
			expect(testObject.Id).toBe(4859);
			expect(testObject.Modified).toEqual(new Date('2015-02-05T23:50:43Z'));
			expect(testObject.Position).toEqual({
				Id: 1
			});
			expect(testObject.PositionId).toBe(1);
			expect(testObject.StartDate).toEqual(new Date('2012-01-01T00:00:00Z'));
			expect(testObject.__metadata).toEqual({
				'id': 'Web/Lists(guid\'eecb473d-81d3-40a8-ad9a-d95f1f24d6b3\')/Items(4859)',
				'uri': 'https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid\'eecb473d-81d3-40a8-ad9a-d95f1f24d6b3\')/Items(4859)',
				'etag': '"2"',
				'type': 'SP.Data.EmploymentListItem'
			});
			expect(testObject.Edit).toBe(false);
		});
		it('should call the "updateData()" method.', function() {
			expect(Employment.prototype.updateData).toHaveBeenCalled();
		});
	});
	describe('"updateData" method', function() {
		it('should populate the data property.', function() {
			expect(testObject.data).toEqual({
				__metadata: {
					'id': 'Web/Lists(guid\'eecb473d-81d3-40a8-ad9a-d95f1f24d6b3\')/Items(4859)',
					'uri': 'https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid\'eecb473d-81d3-40a8-ad9a-d95f1f24d6b3\')/Items(4859)',
					'etag': '"2"',
					'type': 'SP.Data.EmploymentListItem'
				},
				AreaId: 1,
				EmployeeId: 6562,
				EndDate: new Date('2014-07-23T00:00:00Z'),
				StartDate: new Date('2012-01-01T00:00:00Z'),
				PositionId: 1
			});
		});
	});
	describe('"toString" method', function() {
		it('should call the "Employee.toString()" method if the employee is defined.', function() {
			var result = testObject.toString();
			expect(Employee.prototype.toString).toHaveBeenCalled();
		});
		it('should return the Employee\'s name followed by "\'s employment" if the employee is defined.', function() {
			expect(testObject.toString()).toBe('New Person\'s employment');
		});
		it('should return "New Employment" if the employee is undefined', function() {
			testObject.Employee = undefined;
			expect(testObject.toString()).toBe('New Employment');
		});
	});
	describe('"start" method', function() {
		beforeEach(function() {
			this.tempTestObject = new Employment({
				Id: 4859
			});
			this.tempTestObject.start(true);
			$httpBackend.flush();
		});
		it('should call the "add()" method.', function() {
			expect(Employment.prototype.add).toHaveBeenCalled();
		});
	});
	describe('"end" method', function() {
		beforeEach(function() {
			testObject.end(true);
			$httpBackend.flush();
		});
		it('should call the "update()" method.', function() {
			expect(Employment.prototype.update).toHaveBeenCalled();
		});
	});

	// TODO: create the setIntent method suite
	// TODO: create the declareIntent method suite
	describe('"add" method', function() {
		beforeEach(function() {
			this.tempTestObject1 = new Employment({
				Id: 4859
			});
			Employment.prototype.updateData.reset();
			this.tempTestObject1.add(true);
			$httpBackend.flush();
		});
		it('should call the "updateData()" method.', function() {
			expect(Employment.prototype.updateData.callCount).toBe(2);
		});
		it('should call the "initAttributes()" method.', function() {
			expect(Employment.prototype.initAttributes).toHaveBeenCalled();
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
			expect(Employment.prototype.initAttributes).toHaveBeenCalled();
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
			Employment.prototype.updateData.reset();
			testObject.update(true);
			$httpBackend.flush();
		});
		it('should call the "updateData()" method.', function() {
			expect(Employment.prototype.updateData.callCount).toBe(2);
		});
		it('should call the "refresh()" method.', function() {
			expect(Employment.prototype.refresh).toHaveBeenCalled();
		});
		it('should call the "dataService.updateItem()" method.', function() {
			expect(dataService.updateItem).toHaveBeenCalled();
		});
	});
});
