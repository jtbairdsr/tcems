/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-29 18:42:16
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-01 13:47:40
 */

'use strict';

/* jasmine specs for the employee factory */
describe('Employee object', function() {
	var testObject, dataService, Data, Employee, $httpBackend, Employment, areas, positions, tracks, Person,
		availabilities, subShifts, schedules, employments, currentSemester, testAvailability, testAvailability1,
		testAvailability2, testSchedule, testSchedule1, testSchedule2, testSubShift, testSubShift1, testSubShift2,
		testEmployment, currentUser;

	beforeEach(module(ApplicationConfiguration.applicationModuleName));

	// mock the dataService until I have it properly defined.
	beforeEach(module(function($provide) {
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
			Person = $injector.get('Person');
			Employee = $injector.get('Employee');
			dataService = $injector.get('dataService');
			Employment = $injector.get('Employment');
			$httpBackend = $injector.get('$httpBackend');
			areas = $injector.get('areas');
			positions = $injector.get('positions');
			tracks = $injector.get('tracks');
			availabilities = $injector.get('availabilities');
			subShifts = $injector.get('subShifts');
			schedules = $injector.get('schedules');
			employments = $injector.get('employments');
			currentSemester = $injector.get('currentSemester');
			currentUser = $injector.get('currentUser');
		});

		// $httpBackend Config
		$httpBackend.whenGET(
			'https://inet.byui.edu/sites/TestingServices/_api/lists/getbytitle(\'Employee\')/items(\'6664\')').respond({
			d: {
				Id: 6664
			}
		});
		$httpBackend.whenGET(
			'https://inet.byui.edu/sites/TestingServices/_api/lists/getbytitle(\'Employment\')/items(\'1\')').respond({
			d: {
				Id: 1
			}
		});
		$httpBackend.whenPOST(
			'https://inet.byui.edu/sites/TestingServices/_api/lists/getbytitle(\'Employee\')/items(6664)').respond([]);
		$httpBackend.whenPOST(
			'https://inet.byui.edu/sites/TestingServices/_api/lists/getbytitle(\'Employment\')/items(1)').respond([]);
		$httpBackend.whenPOST('https://inet.byui.edu/sites/TestingServices/_api/contextinfo').respond({
			d: {
				GetContextWebInformation: {
					FormDigestTimeoutSeconds: 30,
					FormDigestValue: ''
				}
			}
		});
		$httpBackend.whenPOST('https://inet.byui.edu/sites/TestingServices/_api/lists/getbytitle(\'Employee\')/items').respond({
			d: {
				Id: 6664
			}
		});
		$httpBackend.whenPOST(
			'https://inet.byui.edu/sites/TestingServices/_api/lists/getbytitle(\'Employment\')/items'
		).respond({
			d: {
				Id: 6664
			}
		});

		$httpBackend.flush();

		// array and object initialization
		areas.list[0] = {
			Id: 3
		};
		positions.list[0] = {
			Id: 7,
			Description: 'Techy'
		};
		tracks.list[0] = {
			Id: 2
		};
		employments.list[0] = new Employment({
			AreaId: 1,
			EmployeeId: 6664,
			PositionId: 1
		});

		function testAvailability(empId, semId, active) {
			this.EmployeeId = empId;
			this.SemesterId = semId;
			this.Active = active;
			this.deactivate = function() {
				return this;
			}
		}

		function testSchedule(empId, semId, active) {
			this.EmployeeId = empId;
			this.SemesterId = semId;
			this.Active = active;
			this.deactivate = function() {
				return this;
			}
		}

		function testSubShift(reqId, subId, semId, active, newReqId) {
			newReqId = newReqId || undefined;
			this.RequesterId = reqId;
			this.SubstituteId = subId;
			this.SemesterId = semId;
			this.Active = active;
			this.NewRequestId = newReqId;
			this.deactivate = function() {
					return this;
				},
				this.newRequest = function() {
					return this;
				}
		}
		for (var i = 0; i < 5; i++) {
			switch (i) {
				case 0:
					availabilities.list[i] = new testAvailability(6664, currentSemester.Id, true);
					schedules.list[i] = new testSchedule(6664, currentSemester.Id, true);
					subShifts.list[i] = new testSubShift(6664, i, currentSemester.Id, true);
					break;
				case 1:
					availabilities.list[i] = new testAvailability(i, currentSemester.Id, true);
					schedules.list[i] = new testSchedule(i, currentSemester.Id, true);
					subShifts.list[i] = new testSubShift(i, 6664, currentSemester.Id, true, i);
					break;
				case 2:
					availabilities.list[i] = new testAvailability(6664, currentSemester.Id, false);
					schedules.list[i] = new testSchedule(6664, currentSemester.Id, false);
					subShifts.list[i] = new testSubShift(i, 6664, currentSemester.Id, true);
					break;
				case 3:
					availabilities.list[i] = new testAvailability(6664, i, false);
					schedules.list[i] = new testSchedule(6664, i, false);
					subShifts.list[i] = new testSubShift(i, 6664, i, true);
					break;
				default:
					availabilities.list[i] = new testAvailability(i, i, false);
					schedules.list[i] = new testSchedule(i, i, false);
					subShifts.list[i] = new testSubShift(i, i, i, false, i);
			}
			spyOn(availabilities.list[i], 'deactivate');
			spyOn(schedules.list[i], 'deactivate');
			spyOn(subShifts.list[i], 'deactivate');
			spyOn(subShifts.list[i], 'newRequest');
		}

		testObject = new Employee({
			'__metadata': {
				'id': 'Web/Lists(guid\'e8e0c59b-5405-4663-a8bd-02d009d20dae\')/Items(6664)',
				'uri': 'https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid\'e8e0c59b-5405-4663-a8bd-02d009d20dae\')/Items(6664)',
				'etag': '"27"',
				'type': 'SP.Data.EmployeeListItem'
			},
			'FirstUniqueAncestorSecurableObject': {
				'__deferred': {
					'uri': 'https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid\'e8e0c59b-5405-4663-a8bd-02d009d20dae\')/Items(6664)/FirstUniqueAncestorSecurableObject'
				}
			},
			'RoleAssignments': {
				'__deferred': {
					'uri': 'https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid\'e8e0c59b-5405-4663-a8bd-02d009d20dae\')/Items(6664)/RoleAssignments'
				}
			},
			'AttachmentFiles': {
				'__deferred': {
					'uri': 'https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid\'e8e0c59b-5405-4663-a8bd-02d009d20dae\')/Items(6664)/AttachmentFiles'
				}
			},
			'ContentType': {
				'__deferred': {
					'uri': 'https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid\'e8e0c59b-5405-4663-a8bd-02d009d20dae\')/Items(6664)/ContentType'
				}
			},
			'FieldValuesAsHtml': {
				'__deferred': {
					'uri': 'https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid\'e8e0c59b-5405-4663-a8bd-02d009d20dae\')/Items(6664)/FieldValuesAsHtml'
				}
			},
			'FieldValuesAsText': {
				'__deferred': {
					'uri': 'https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid\'e8e0c59b-5405-4663-a8bd-02d009d20dae\')/Items(6664)/FieldValuesAsText'
				}
			},
			'FieldValuesForEdit': {
				'__deferred': {
					'uri': 'https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid\'e8e0c59b-5405-4663-a8bd-02d009d20dae\')/Items(6664)/FieldValuesForEdit'
				}
			},
			'File': {
				'__deferred': {
					'uri': 'https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid\'e8e0c59b-5405-4663-a8bd-02d009d20dae\')/Items(6664)/File'
				}
			},
			'Folder': {
				'__deferred': {
					'uri': 'https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid\'e8e0c59b-5405-4663-a8bd-02d009d20dae\')/Items(6664)/Folder'
				}
			},
			'ParentList': {
				'__deferred': {
					'uri': 'https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid\'e8e0c59b-5405-4663-a8bd-02d009d20dae\')/Items(6664)/ParentList'
				}
			},
			'FileSystemObjectType': 0,
			'Id': 6664,
			'Title': null,
			'FirstName': 'Jonathan',
			'PreferredName': 'Jonathan',
			'LastName': 'Baird',
			'PhoneNumber': '2083805215',
			'EmailAddress': 'bai11006@byui.edu',
			'INumber': '097163767',
			'Reader': false,
			'PersonIDId': 11,
			'ContentTypeId': '0x01001D0FE919A1DAA44E86C4FAE41E156B0A',
			'TrackId': 2,
			'TeamId': null,
			'PositionId': 7,
			'AreaId': 3,
			'Active': true,
			'Admin': true,
			'Picture': '/media/bai11006.jpg',
			'Retired': false,
			'ID': 6664,
			'Modified': '2015-01-31T02:29:38Z',
			'Created': '2014-09-09T21:43:00Z',
			'AuthorId': 11,
			'EditorId': 11,
			'OData__UIVersionString': '1.0',
			'Attachments': false,
			'GUID': 'ff37ae09-1bda-4272-aef8-2e16cbfd78e1'
		});
		testEmployment = new Employment({
			Id: 1,
			AreaId: 1,
			EmployeeId: 6664,
			PositionId: 1
		});
		testObject.Employments[0] = testEmployment;

		// Spies
		spyOn(dataService, 'addItem').andCallThrough();
		spyOn(dataService, 'updateItem').andCallThrough();
		spyOn(dataService, 'fetchItem').andCallThrough();
		spyOn(dataService, 'deleteItem').andCallThrough();
		spyOn(testObject, 'updateData').andCallThrough();
		spyOn(Person.prototype, 'toString').andCallThrough();
		spyOn(Employee.prototype, 'activate').andCallThrough();
		spyOn(Employee.prototype, 'deactivate').andCallThrough();
		spyOn(Employment.prototype, 'start').andCallThrough();
		spyOn(testEmployment, 'end').andCallThrough();
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
		it('should be "Employee"', function() {
			expect(testObject.listName).toBe('Employee');
		});
	});
	describe('"initAttributes" method', function() {
		beforeEach(function() {
			testObject.initAttributes();
		});
		it('should populate the properties.', function() {
			expect(testObject.Active).toBe(true);
			expect(testObject.Admin).toBe(true);
			expect(testObject.Area).toEqual({
				Id: 3
			});
			expect(testObject.AreaId).toBe(3);
			expect(testObject.Created).toEqual(new Date('2014-09-09T21:43:00Z'));
			expect(testObject.Employments).toEqual([]);
			expect(testObject.EmailAddress).toBe('bai11006@byui.edu');
			expect(testObject.FirstName).toBe('Jonathan');
			expect(testObject.Id).toBe(6664);
			expect(testObject.Intent).toBeUndefined();
			expect(testObject.INumber).toBe('097163767');
			expect(testObject.LastName).toBe('Baird');
			expect(testObject.Modified).toEqual(new Date('2015-01-31T02:29:38Z'));
			expect(testObject.Picture).toBe('src/modules/employees/img/bai11006.jpg');
			expect(testObject.PhoneNumber).toBe('2083805215');
			expect(testObject.Position).toEqual({
				Id: 7,
				Description: 'Techy'
			});
			expect(testObject.PositionId).toBe(7);
			expect(testObject.PreferredName).toBe('Jonathan');
			expect(testObject.Reader).toBe(false);
			expect(testObject.Retired).toBe(false);
			expect(testObject.Team).toBeUndefined();
			expect(testObject.TeamId).toBeUndefined();
			expect(testObject.Track).toEqual({
				Id: 2
			});
			expect(testObject.TrackId).toBe(2);
			expect(testObject.__metadata).toEqual({
				'id': 'Web/Lists(guid\'e8e0c59b-5405-4663-a8bd-02d009d20dae\')/Items(6664)',
				'uri': 'https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid\'e8e0c59b-5405-4663-a8bd-02d009d20dae\')/Items(6664)',
				'etag': '"27"',
				'type': 'SP.Data.EmployeeListItem'
			});
		});
		it('should call the "updateData()" method.', function() {
			expect(testObject.updateData).toHaveBeenCalled();
		});
	});
	describe('"updateData" method', function() {
		it('should populate the data property.', function() {
			expect(testObject.data).toEqual({
				Active: testObject.Active,
				Admin: testObject.Admin,
				AreaId: testObject.AreaId,
				EmailAddress: testObject.EmailAddress,
				FirstName: testObject.FirstName,
				INumber: testObject.INumber,
				LastName: testObject.LastName,
				Picture: testObject.Picture,
				PhoneNumber: (testObject.PhoneNumber) ? testObject.PhoneNumber : undefined,
				PositionId: testObject.PositionId,
				PreferredName: (testObject.PreferredName) ? testObject.PreferredName : undefined,
				Reader: testObject.Reader,
				Retired: testObject.Retired,
				TeamId: testObject.TeamId,
				TrackId: testObject.TrackId,
				__metadata: testObject.__metadata
			});
		});
	});
	describe('"toString" method', function() {
		it('should call the "Person.toString()" method.', function() {
			var temp = testObject.toString();
			expect(Person.prototype.toString).toHaveBeenCalled();
		});
		it('should return employees name if called with no parameter.', function() {
			expect(testObject.toString()).toEqual('Jonathan Baird');
		});
		it('should return "Position.Description: employees name" if called with "position" as the parameter.', function() {
			expect(testObject.toString('position')).toEqual('Techy: Jonathan Baird');
		});
	});
	describe('"add" method', function() {
		beforeEach(function() {
			this.tempTestObject1 = new Employee();
			this.tempTestObject1.add(true);
			$httpBackend.flush();
		});
		it('should call the "dataService.addItem()" method.', function() {
			expect(dataService.addItem).toHaveBeenCalled();
		});
		it('should call the "activate()" method.', function() {
			expect(testObject.activate).toHaveBeenCalled();
		});
	});
	describe('"activate" method', function() {
		beforeEach(function() {
			testObject.activate(true);
			$httpBackend.flush();
		});
		it('should call the "dataService.updateItem()" method.', function() {
			expect(dataService.updateItem).toHaveBeenCalled();
		});
		it('should call the "Employment.start()" method.', function() {
			expect(Employment.prototype.start).toHaveBeenCalled();
		});
	});
	describe('"deactivate" method', function() {
		beforeEach(function() {
			testObject.deactivate(true);
			$httpBackend.flush();
		});
		it('should deactivate all availabilities and schedules associated with this employee.', function() {
			expect(availabilities.list[0].deactivate).toHaveBeenCalled();
			expect(schedules.list[0].deactivate).toHaveBeenCalled();
		});
		it('should not deactivate any other availabilities or schedules.', function() {
			expect(availabilities.list[1].deactivate).not.toHaveBeenCalled();
			expect(availabilities.list[2].deactivate).not.toHaveBeenCalled();
			expect(availabilities.list[3].deactivate).not.toHaveBeenCalled();
			expect(availabilities.list[4].deactivate).not.toHaveBeenCalled();
			expect(schedules.list[1].deactivate).not.toHaveBeenCalled();
			expect(schedules.list[2].deactivate).not.toHaveBeenCalled();
			expect(schedules.list[3].deactivate).not.toHaveBeenCalled();
			expect(schedules.list[4].deactivate).not.toHaveBeenCalled();
		});
		it('should deactivate all subShifts requested by this employee.', function() {
			expect(subShifts.list[0].deactivate).toHaveBeenCalled();
		});
		it('should submit NewRequests for all subShifts filled by this employee.', function() {
			expect(subShifts.list[2].newRequest).toHaveBeenCalled();
		});
		it('should not deactivate or request any other subShifts.', function() {
			expect(subShifts.list[1].deactivate).not.toHaveBeenCalled();
			expect(subShifts.list[2].deactivate).not.toHaveBeenCalled();
			expect(subShifts.list[3].deactivate).not.toHaveBeenCalled();
			expect(subShifts.list[4].deactivate).not.toHaveBeenCalled();
			expect(subShifts.list[0].newRequest).not.toHaveBeenCalled();
			expect(subShifts.list[1].newRequest).not.toHaveBeenCalled();
			expect(subShifts.list[3].newRequest).not.toHaveBeenCalled();
			expect(subShifts.list[4].newRequest).not.toHaveBeenCalled();
		});
		it('should end all employments associated with this employee', function() {
			expect(testEmployment.end).toHaveBeenCalled();
		});
		it('should call the "dataService.updateItem" method.', function() {
			expect(dataService.updateItem).toHaveBeenCalled();
		});
	});
	describe('"retire" method', function() {
		beforeEach(function() {
			testObject.retire(true);
			$httpBackend.flush();
		});
		it('should call the "deactivate" method.', function() {
			expect(Employee.prototype.deactivate).toHaveBeenCalled();
		});
		it('should call the "dataService.updateItem" method.', function() {
			expect(dataService.updateItem.callCount).toBe(3);
		});
	});
	describe('"setEmployements" method', function() {
		beforeEach(function() {
			this.employmentsLength = testObject.Employments.length;
			testObject.setEmployments();
		});
		it('should add all relevant employments to the employees "Employments" property.', function() {
			expect(testObject.Employments.length).toBe(this.employmentsLength + 1);
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
		beforeEach(function() {
			testObject.remove(true);
			$httpBackend.flush();
		});
		it('should call the "dataService.deleteItem()" method.', function() {
			expect(dataService.deleteItem).toHaveBeenCalled();
		});
		xit('should remove the item from the availabilities list.', function() {});
	});
});
