/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-29 18:56:31
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-01 13:29:46
 */

'use strict';

/* jasmine specs for the position factory */
describe('Position object', function() {
	var testObject, dataService, Data, Position, $httpBackend, currentUser;

	beforeEach(module(ApplicationConfiguration.applicationModuleName));

	// mock the dataService until I have it properly defined.
	beforeEach(module(function($provide) {
		// $provide.value('currentUser', {data: {}});
		$provide.value('schedules', []);
		$provide.value('subShifts', []);
		$provide.value('availabilities', []);
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
			Position = $injector.get('Position');
			dataService = $injector.get('dataService');
			$httpBackend = $injector.get('$httpBackend');
			currentUser = $injector.get('currentUser');
		});

		// $httpBackend Config
		$httpBackend.whenGET(
			'https://inet.byui.edu/sites/TestingServices/_api/lists/getbytitle(\'Position\')/items(\'4\')').respond({
			d: {
				Id: 4
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
		$httpBackend.whenPOST('https://inet.byui.edu/sites/TestingServices/_api/lists/getbytitle(\'Position\')/items(4)')
			.respond([]);
		$httpBackend.whenPOST('https://inet.byui.edu/sites/TestingServices/_api/lists/getbytitle(\'Position\')/items').respond({
			d: {
				Id: 4
			}
		});
		$httpBackend.flush();

		testObject = new Position({
			"__metadata": {
				"id": "Web/Lists(guid'69041a1a-d23f-4132-b4dd-1b17d6048ac1')/Items(4)",
				"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'69041a1a-d23f-4132-b4dd-1b17d6048ac1')/Items(4)",
				"etag": "\"2\"",
				"type": "SP.Data.PositionListItem"
			},
			"FirstUniqueAncestorSecurableObject": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'69041a1a-d23f-4132-b4dd-1b17d6048ac1')/Items(4)/FirstUniqueAncestorSecurableObject"
				}
			},
			"RoleAssignments": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'69041a1a-d23f-4132-b4dd-1b17d6048ac1')/Items(4)/RoleAssignments"
				}
			},
			"AttachmentFiles": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'69041a1a-d23f-4132-b4dd-1b17d6048ac1')/Items(4)/AttachmentFiles"
				}
			},
			"ContentType": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'69041a1a-d23f-4132-b4dd-1b17d6048ac1')/Items(4)/ContentType"
				}
			},
			"FieldValuesAsHtml": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'69041a1a-d23f-4132-b4dd-1b17d6048ac1')/Items(4)/FieldValuesAsHtml"
				}
			},
			"FieldValuesAsText": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'69041a1a-d23f-4132-b4dd-1b17d6048ac1')/Items(4)/FieldValuesAsText"
				}
			},
			"FieldValuesForEdit": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'69041a1a-d23f-4132-b4dd-1b17d6048ac1')/Items(4)/FieldValuesForEdit"
				}
			},
			"File": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'69041a1a-d23f-4132-b4dd-1b17d6048ac1')/Items(4)/File"
				}
			},
			"Folder": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'69041a1a-d23f-4132-b4dd-1b17d6048ac1')/Items(4)/Folder"
				}
			},
			"ParentList": {
				"__deferred": {
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'69041a1a-d23f-4132-b4dd-1b17d6048ac1')/Items(4)/ParentList"
				}
			},
			"FileSystemObjectType": 0,
			"Id": 4,
			"ContentTypeId": "0x0100DA785C02DECF9E4788A8FEBD3686BF29",
			"Title": "N8DGR8",
			"Position": "Coordinator",
			"GroupId": 4,
			"Description": "Coordinator",
			"ID": 4,
			"Modified": "2015-01-17T21:47:53Z",
			"Created": "2014-08-05T15:31:01Z",
			"AuthorId": 11,
			"EditorId": 11,
			"OData__UIVersionString": "1.0",
			"Attachments": false,
			"GUID": "55aea3a3-63ab-4f05-8ddc-9b56b89ba48d"
		});

		// Spies
		spyOn(dataService, 'addItem').andCallThrough();
		spyOn(dataService, 'updateItem').andCallThrough();
		spyOn(dataService, 'fetchItem').andCallThrough();
		spyOn(dataService, 'deleteItem').andCallThrough();
		spyOn(Position.prototype, 'updateData').andCallThrough();
		spyOn(Position.prototype, 'initAttributes').andCallThrough();
		spyOn(Position.prototype, 'add').andCallThrough();
		spyOn(Position.prototype, 'update').andCallThrough();
		spyOn(Position.prototype, 'refresh').andCallThrough();
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
		it('should be "Position"', function() {
			expect(testObject.listName).toBe('Position');
		});
	});
	describe('"initAttributes" method', function() {
		beforeEach(function() {
			testObject.initAttributes();
		});
		it('should populate the properties.', function() {
			expect(testObject.Description).toBe('Coordinator');
			expect(testObject.Position).toBe('Coordinator');
			expect(testObject.Active).toBeTruthy();
			expect(testObject.Access).toBeTruthy();

			/************Values that are common to most objects************/
			expect(testObject.Created).toEqual(new Date('2014-08-05T15:31:01Z'));
			expect(testObject.GUID).toBe('55aea3a3-63ab-4f05-8ddc-9b56b89ba48d');
			expect(testObject.Id).toBe(4);
			expect(testObject.Modified).toEqual(new Date('2015-01-17T21:47:53Z'));
			expect(testObject.__metadata).toEqual({
				'id': 'Web/Lists(guid\'69041a1a-d23f-4132-b4dd-1b17d6048ac1\')/Items(4)',
				'uri': 'https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid\'69041a1a-d23f-4132-b4dd-1b17d6048ac1\')/Items(4)',
				'etag': '"2"',
				'type': 'SP.Data.PositionListItem'
			});
		});
		it('should call the "updateData()" method.', function() {
			expect(Position.prototype.updateData).toHaveBeenCalled();
		});
	});
	describe('"updateData" method', function() {
		it('should populate the data property.', function() {
			expect(testObject.data).toEqual({
				__metadata: {
					'id': 'Web/Lists(guid\'69041a1a-d23f-4132-b4dd-1b17d6048ac1\')/Items(4)',
					'uri': 'https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid\'69041a1a-d23f-4132-b4dd-1b17d6048ac1\')/Items(4)',
					'etag': '"2"',
					'type': 'SP.Data.PositionListItem'
				},
				Description: 'Coordinator',
				Position: 'Coordinator'
			});
		});
	});
	describe('"toString" method', function() {
		it('should return the Description if there is one.', function() {
			expect(testObject.toString()).toBe('Coordinator position');
		});
		it('should return "New Position" if the Description is undefined', function() {
			testObject.Description = undefined;
			expect(testObject.toString()).toBe('New Position');
		});
	});
	describe('"setAccess" method', function() {
		beforeEach(function() {
			currentUser.data.Position = {
				Description: 'Coordinator'
			};
			currentUser.data.Area = {
				DefaultPosition: {
					Id: 4,
					Description: 'Proctor'
				}
			};
			testObject.Access = false;
		});
		afterEach(function() {
			testObject.Description = 'Coordinator';
			currentUser.data.Admin = false;
		});
		it('should set Access to true if the currentUser is an Admin.', function() {
			currentUser.data.Admin = true;
			testObject.setAccess();
			expect(testObject.Access).toBeTruthy();
		});
		it('should set Access to true if the currentUser\'s position matches this position.', function() {
			testObject.setAccess();
			expect(testObject.Access).toBeTruthy();
		});
		it('should set Access to true if the currentUser is an FTE.', function() {
			currentUser.data.Position.Description = 'FTE'
			testObject.setAccess();
			expect(testObject.Access).toBeTruthy();
		});
		it('should set Access to true if the currentUser\'s area\'s default position matches this position.', function() {
			testObject.Description = 'Techy';
			testObject.setAccess();
			expect(testObject.Access).toBeTruthy();
		});
		it('should set Access to true if the this position is "Proctor"', function() {
			testObject.Description = 'Proctor';
			testObject.setAccess();
			expect(testObject.Access).toBeTruthy();
		});
		it('should set Access to false in all other situations.', function() {
			testObject.Description = 'FTE';
			expect(testObject.Access).toBeFalsy();
		});
	});
	describe('"setActive" method', function() {
		beforeEach(function() {
			currentUser.data.Position = {
				Description: 'Coordinator'
			};
			currentUser.data.Area = {
				DefaultPosition: {
					Id: 4,
					Description: 'Proctor'
				}
			};
			testObject.Access = false;
		});
		it('should set Active true if the currentUser\'s position matches this position.', function() {
			expect(testObject.Active).toBeTruthy();
		});
		it('should set Active true if the currentUser is an FTE and the position mathces their default position.',
			function() {
				currentUser.data.Position.Description = 'Proctor';
				testObject.setActive();
				expect(testObject.Active).toBeFalsy();
				currentUser.data.Position.Description = 'FTE';
				testObject.setActive();
				expect(testObject.Active).toBeTruthy();
			});
	});
	describe('"add" method', function() {
		beforeEach(function() {
			this.tempTestObject1 = new Position({
				Id: 4
			});
			Position.prototype.updateData.reset();
			this.tempTestObject1.add(true);
			$httpBackend.flush();
		});
		it('should call the "updateData()" method.', function() {
			expect(Position.prototype.updateData.callCount).toBe(2);
		});
		it('should call the "initAttributes()" method.', function() {
			expect(Position.prototype.initAttributes).toHaveBeenCalled();
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
			expect(Position.prototype.initAttributes).toHaveBeenCalled();
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
			Position.prototype.updateData.reset();
			testObject.update(true);
			$httpBackend.flush();
		});
		it('should call the "updateData()" method.', function() {
			expect(Position.prototype.updateData.callCount).toBe(2);
		});
		it('should call the "refresh()" method.', function() {
			expect(Position.prototype.refresh).toHaveBeenCalled();
		});
		it('should call the "dataService.updateItem()" method.', function() {
			expect(dataService.updateItem).toHaveBeenCalled();
		});
	});
});
