/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-02 13:59:24
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-02 21:49:54
 */

'use strict';

// Jasmine specs for the shift factory
describe('Shift object', function() {

	/**************************************************************************
	 *                                  PREP                                  *
	 **************************************************************************/

	// Declare global variables
	var testObject,

		// Services/Values
		$httpBackend, $q, dataService, sharePointUrl, positions, shiftGroups,
		schedules,

		// Objects
		Data, Position, Shift, ShiftGroup;

	// Define the module
	beforeEach(module(ApplicationConfiguration.applicationModuleName));

	// Assign local variabl to injections of the services/values
	beforeEach(function() {
		inject(function($injector) {
			// Services/Values
			$httpBackend = $injector.get('$httpBackend');
			$q = $injector.get('$q');
			dataService = $injector.get('dataService');
			sharePointUrl = $injector.get('sharePointUrl');
			positions = $injector.get('positions');
			shiftGroups = $injector.get('shiftGroups');
			schedules = $injector.get('schedules');

			// Objects
			Data = $injector.get('Data');
			Position = $injector.get('Position');
			Shift = $injector.get('Shift');
			ShiftGroup = $injector.get('ShiftGroup');
		});
	});

	// $httpBackend setup
	beforeEach(function() {
		var shift = {
				d: {
					Id: 51
				}
			},
			shifts = {
				d: {
					results: [{
						Id: 51
					}]
				}
			};
		$httpBackend.whenPOST(sharePointUrl + '_api/contextinfo').respond({
			d: {
				GetContextWebInformation: {
					FormDigestTimeoutSeconds: 30,
					FormDigestValue: ''
				}
			}
		});
		$httpBackend.whenPOST(sharePointUrl + '_api/lists/getbytitle(\'Shift\')/items(51)').respond(shifts);
		$httpBackend.whenPOST(sharePointUrl + '_api/lists/getbytitle(\'Shift\')/items').respond(shift);
		$httpBackend.whenGET(sharePointUrl + '_api/lists/getbytitle(\'Shift\')/items(\'51\')').respond(shift);
		$httpBackend.whenGET(sharePointUrl + '_api/lists/getbytitle(\'Shift\')/items?$top=999999999').respond(shifts);
		$httpBackend.flush();
	});

	// Define the spies
	beforeEach(function() {
		spyOn(dataService, 'addItem').andCallThrough();
		spyOn(dataService, 'updateItem').andCallThrough();
		spyOn(dataService, 'fetchItem').andCallThrough();
		spyOn(dataService, 'fetchItems').andCallThrough();
		spyOn(dataService, 'deleteItem').andCallThrough();
		spyOn(Shift.prototype, 'updateData').andCallThrough();
		spyOn(Shift.prototype, 'initAttributes').andCallThrough();
		spyOn(Shift.prototype, 'add').andCallThrough();
		spyOn(Shift.prototype, 'update').andCallThrough();
		spyOn(Shift.prototype, 'refresh').andCallThrough();
		spyOn(Data, 'query').andCallThrough();
	});

	// Define the data
	beforeEach(function() {
		positions.list.splice(0, positions.list.length);
		positions.list.push(new Position({
			Id: 1,
			Description: 'Proctor'
		}));
		shiftGroups.list.splice(0, shiftGroups.list.length);
		shiftGroups.list.push(new ShiftGroup({
			Id: 2
		}));
		schedules.list.splice(0, schedules.list.length);
		schedules.list.push({
			ShiftId: 51,
			Active: true,
			deactivate: function(hideAlert) {
				var deffered = $q.defer();
				deffered.resolve(hideAlert);
				return deffered.promise;
			}
		});
		schedules.list.push({
			ShiftId: 51,
			Active: false,
			deactivate: function(hideAlert) {
				var deffered = $q.defer();
				deffered.resolve(hideAlert);
				return deffered.promise;
			}
		});
		testObject = new Shift({
			'__metadata': {
				'id': 'Web/Lists(guid\'b7e8e421-d65c-43e7-9c5a-77f8515f9be4\')/Items(51)',
				'uri': sharePointUrl + '_api/Web/Lists(guid\'b7e8e421-d65c-43e7-9c5a-77f8515f9be4\')/Items(51)',
				'etag': '"10"',
				'type': 'SP.Data.ShiftListItem'
			},
			'FirstUniqueAncestorSecurableObject': {
				'__deferred': {
					'uri': sharePointUrl + '_api/Web/Lists(guid\'b7e8e421-d65c-43e7-9c5a-77f8515f9be4\')/Items(51)/FirstUniqueAncestorSecurableObject'
				}
			},
			'RoleAssignments': {
				'__deferred': {
					'uri': sharePointUrl + '_api/Web/Lists(guid\'b7e8e421-d65c-43e7-9c5a-77f8515f9be4\')/Items(51)/RoleAssignments'
				}
			},
			'AttachmentFiles': {
				'__deferred': {
					'uri': sharePointUrl + '_api/Web/Lists(guid\'b7e8e421-d65c-43e7-9c5a-77f8515f9be4\')/Items(51)/AttachmentFiles'
				}
			},
			'ContentType': {
				'__deferred': {
					'uri': sharePointUrl + '_api/Web/Lists(guid\'b7e8e421-d65c-43e7-9c5a-77f8515f9be4\')/Items(51)/ContentType'
				}
			},
			'FieldValuesAsHtml': {
				'__deferred': {
					'uri': sharePointUrl + '_api/Web/Lists(guid\'b7e8e421-d65c-43e7-9c5a-77f8515f9be4\')/Items(51)/FieldValuesAsHtml'
				}
			},
			'FieldValuesAsText': {
				'__deferred': {
					'uri': sharePointUrl + '_api/Web/Lists(guid\'b7e8e421-d65c-43e7-9c5a-77f8515f9be4\')/Items(51)/FieldValuesAsText'
				}
			},
			'FieldValuesForEdit': {
				'__deferred': {
					'uri': sharePointUrl + '_api/Web/Lists(guid\'b7e8e421-d65c-43e7-9c5a-77f8515f9be4\')/Items(51)/FieldValuesForEdit'
				}
			},
			'File': {
				'__deferred': {
					'uri': sharePointUrl + '_api/Web/Lists(guid\'b7e8e421-d65c-43e7-9c5a-77f8515f9be4\')/Items(51)/File'
				}
			},
			'Folder': {
				'__deferred': {
					'uri': sharePointUrl + '_api/Web/Lists(guid\'b7e8e421-d65c-43e7-9c5a-77f8515f9be4\')/Items(51)/Folder'
				}
			},
			'ParentList': {
				'__deferred': {
					'uri': sharePointUrl + '_api/Web/Lists(guid\'b7e8e421-d65c-43e7-9c5a-77f8515f9be4\')/Items(51)/ParentList'
				}
			},
			'FileSystemObjectType': 0,
			'Id': 51,
			'ContentTypeId': '0x01003525F6B4DC681648A820283EC869D58D',
			'Title': 'N8DGR8',
			'Day': 'Mon - Wed - Fri',
			'Slots': 8,
			'Current': true,
			'ShiftGroupId': 2,
			'PositionId': 1,
			'CoordinatorId': null,
			'StartTime': '1970-01-01T22:30:00Z',
			'EndTime': '1970-01-02T01:30:00Z',
			'Active': null,
			'ID': 51,
			'Modified': '2014-11-15T01:37:37Z',
			'Created': '2014-08-29T03:36:50Z',
			'AuthorId': 11,
			'EditorId': 11,
			'OData__UIVersionString': '1.0',
			'Attachments': false,
			'GUID': '0d34a263-40a0-458e-9bef-85ca8271b66a'
		});
	});

	// General cleanup
	afterEach(function() {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	});

	/**************************************************************************
	 *                                  TESTS                                 *
	 **************************************************************************/

	it('should be able to be instantiated', function() {
		expect(testObject).not.toBeNull();
	});
	describe('"listname" property', function() {
		it('should be "Shift"', function() {
			expect(testObject.listName).toBe('Shift');
		});
	});
	describe('"initAttributes" method', function() {
		it('should populate the properties.', function() {
			/* [>* * * * * * * Values unique to this object * * * * * * * *<] */
			expect(testObject.Active).toBeTruthy();
			expect(testObject.Current).toBeTruthy();
			expect(testObject.StartTime).toEqual(new Date('1970-01-01T22:30:00Z'));
			expect(testObject.EndTime).toEqual(new Date('1970-01-02T01:30:00Z'));
			expect(testObject.Position).toEqual(new Position({
				Id: 1,
				Description: 'Proctor'
			}));
			expect(testObject.ShiftGroup).toEqual(new ShiftGroup({
				Id: 2
			}));
			expect(testObject.Day).toBe('Mon - Wed - Fri');
			expect(testObject.PositionId).toBe(1);
			expect(testObject.Slots).toBe(8);
			expect(testObject.ShiftGroupId).toBe(2);

			/* [>* * * * * * * Values common to most objects* * * * * * * *<] */
			expect(testObject.Created).toEqual(new Date('2014-08-29T03:36:50Z'));
			expect(testObject.GUID).toBe('0d34a263-40a0-458e-9bef-85ca8271b66a');
			expect(testObject.Id).toBe(51);
			expect(testObject.Modified).toEqual(new Date('2014-11-15T01:37:37Z'));
			expect(testObject.__metadata).toEqual({
				'id': 'Web/Lists(guid\'b7e8e421-d65c-43e7-9c5a-77f8515f9be4\')/Items(51)',
				'uri': sharePointUrl + '_api/Web/Lists(guid\'b7e8e421-d65c-43e7-9c5a-77f8515f9be4\')/Items(51)',
				'etag': '"10"',
				'type': 'SP.Data.ShiftListItem'
			});
		});
		it('should call the "updateData()" method.', function() {
			expect(Shift.prototype.updateData).toHaveBeenCalled();
		});
	});
	describe('"updateData" method', function() {
		it('should populate the data property.', function() {
			var tempObject = {
				__metadata: testObject.__metadata,
				Active: testObject.Active,
				Current: testObject.Current,
				Day: testObject.Day,
				EndTime: testObject.EndTime,
				PositionId: testObject.PositionId,
				Slots: testObject.Slots,
				ShiftGroupId: testObject.ShiftGroupId,
				StartTime: testObject.StartTime
			};
			expect(testObject.data).toEqual(tempObject);
		});
	});
	describe('"toString" method', function() {
		it('should return "New shift" if the it is hasn\'t been saved to the DB yet.', function() {
			testObject.Position = undefined;
			expect(testObject.toString()).toBe('New shift');
		});
		it('should return the Position, Day, StartTime, and EndTime if the shift has been saved to the DB.', function() {
			expect(testObject.toString()).toBe('Proctor: Mon, Wed, Fri\n3:30 - 6:30');
		});
	});
	describe('"add" method', function() {
		beforeEach(function() {
			this.tempTestObject1 = new Shift({
				Id: 4
			});
			Shift.prototype.updateData.reset();
			this.tempTestObject1.add(true);
			$httpBackend.flush();
		});
		it('should call the "updateData()" method.', function() {
			expect(Shift.prototype.updateData.callCount).toBe(2);
		});
		it('should call the "initAttributes()" method.', function() {
			expect(Shift.prototype.initAttributes).toHaveBeenCalled();
		});
		it('should call the "dataService.addItem()" method.', function() {
			expect(dataService.addItem).toHaveBeenCalled();
		});
	});
	describe('"deactivate" method', function() {
		beforeEach(function() {
			testObject.deactivate(true);
			$httpBackend.flush();
		});
		it('should call the "dataService.updateItem" method.', function() {
			expect(dataService.updateItem).toHaveBeenCalled();
		});
		it('should set both "Current" and "Active" properties to false', function() {
			expect(testObject.Current).toBe(false);
			expect(testObject.Active).toBe(testObject.Current);
		});
	});
	describe('"setAvailableSlots" method', function() {
		it('should set the "AvailableSlots" property to 7.', function() {
			expect(testObject.AvailableSlots).toBe(7);
		});
	});
	describe('"query" class method', function() {
		beforeEach(function() {
			testObject.list.splice(0, testObject.list.length);
			Shift.query();
			$httpBackend.flush();
		});
		it('should call the "Data.query" class method', function() {
			expect(Data.query).toHaveBeenCalled();
		});
		it('should call the "dataService.fetchItems" class method', function() {
			expect(dataService.fetchItems).toHaveBeenCalled();
		});
		it('should add all items to the shifts list.', function() {
			expect(testObject.list.length).toBe(1);
		});
	});
});
