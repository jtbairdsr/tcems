/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-14 12:24:34
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-14 13:10:00
 */

'use strict';

ddescribe('Semester factory', function() {

	/**************************************************************************
	 *                                  PREP                                  *
	 **************************************************************************/

	var testSemester, testShiftGroup, testNextSemester,

		// Services/Values
		$q, $timeout, semesters, shiftGroups, sharePointUrl,

		// Objects
		Semester, Data;

	beforeEach(function() {
		// Define the module
		module(ApplicationConfiguration.applicationModuleName);

		// Mock the dependencies
		module(function($provide) {
			$provide.factory('Data', function() {
				function Data(newData, list, listName) {
					this.newData = newData;
					this.list = list;
					this.listName = listName;
				}
				Data.query = function() {
					var deffered = $q.defer();
					deffered.resolve([1, 2, 3]);
					return deffered.promise;
				};
				Data.prototype.initAttributes = function() {};
				Data.prototype.updateData = function() {
					return {};
				};
				Data.prototype.add = function() {
					var deffered = $q.defer();
					deffered.resolve();
					return deffered.promise;
				};
				Data.prototype.update = function() {
					var deffered = $q.defer();
					deffered.resolve();
					return deffered.promise;
				};
				return Data;
			});
		});

		// Assign injections of the services/values/objects to local variables
		inject(function($injector) {
			// Services/Values
			$q = $injector.get('$q');
			$timeout = $injector.get('$timeout');
			shiftGroups = $injector.get('shiftGroups');
			semesters = $injector.get('semesters');
			sharePointUrl = $injector.get('sharePointUrl');

			// Objects
			Data = $injector.get('Data');
			Semester = $injector.get('Semester');
		});

		// Define spies
		spyOn(Data, 'query').andCallThrough();
		spyOn(Data.prototype, 'initAttributes').andCallThrough();
		spyOn(Data.prototype, 'updateData').andCallThrough();
		spyOn(Data.prototype, 'add').andCallThrough();
		spyOn(Data.prototype, 'update').andCallThrough();
		spyOn(Semester.prototype, 'updateData').andCallThrough();
		spyOn(Semester.prototype, 'deactivate').andCallThrough();
		spyOn(Array.prototype, 'reverse').andCallThrough();

		// Define the data
		testNextSemester = {
			Id: 4
		};
		testShiftGroup = {
			Id: 3,
			Description: 'Test ShiftGroup'
		};
		semesters.list.splice(0, semesters.list.length);
		semesters.list.push(testNextSemester);
		shiftGroups.list.splice(0, shiftGroups.list.length);
		shiftGroups.list.push(testShiftGroup);
		testSemester = new Semester({
			'__metadata': {
				'id': 'Web/Lists(guid\'e5a20afd-bf5c-4ddf-9478-f8db0a32003c\')/Items(2)',
				'uri': sharePointUrl + '_api/Web/Lists(guid\'e5a20afd-bf5c-4ddf-9478-f8db0a32003c\')/Items(2)',
				'etag': '"12"',
				'type': 'SP.Data.SemesterListItem'
			},
			'FirstUniqueAncestorSecurableObject': {
				'__deferred': {
					'uri': sharePointUrl + '_api/Web/Lists(guid\'e5a20afd-bf5c-4ddf-9478-f8db0a32003c\')/Items(2)/FirstUniqueAncestorSecurableObject'
				}
			},
			'RoleAssignments': {
				'__deferred': {
					'uri': sharePointUrl + '_api/Web/Lists(guid\'e5a20afd-bf5c-4ddf-9478-f8db0a32003c\')/Items(2)/RoleAssignments'
				}
			},
			'AttachmentFiles': {
				'__deferred': {
					'uri': sharePointUrl + '_api/Web/Lists(guid\'e5a20afd-bf5c-4ddf-9478-f8db0a32003c\')/Items(2)/AttachmentFiles'
				}
			},
			'ContentType': {
				'__deferred': {
					'uri': sharePointUrl + '_api/Web/Lists(guid\'e5a20afd-bf5c-4ddf-9478-f8db0a32003c\')/Items(2)/ContentType'
				}
			},
			'FieldValuesAsHtml': {
				'__deferred': {
					'uri': sharePointUrl + '_api/Web/Lists(guid\'e5a20afd-bf5c-4ddf-9478-f8db0a32003c\')/Items(2)/FieldValuesAsHtml'
				}
			},
			'FieldValuesAsText': {
				'__deferred': {
					'uri': sharePointUrl + '_api/Web/Lists(guid\'e5a20afd-bf5c-4ddf-9478-f8db0a32003c\')/Items(2)/FieldValuesAsText'
				}
			},
			'FieldValuesForEdit': {
				'__deferred': {
					'uri': sharePointUrl + '_api/Web/Lists(guid\'e5a20afd-bf5c-4ddf-9478-f8db0a32003c\')/Items(2)/FieldValuesForEdit'
				}
			},
			'File': {
				'__deferred': {
					'uri': sharePointUrl + '_api/Web/Lists(guid\'e5a20afd-bf5c-4ddf-9478-f8db0a32003c\')/Items(2)/File'
				}
			},
			'Folder': {
				'__deferred': {
					'uri': sharePointUrl + '_api/Web/Lists(guid\'e5a20afd-bf5c-4ddf-9478-f8db0a32003c\')/Items(2)/Folder'
				}
			},
			'ParentList': {
				'__deferred': {
					'uri': sharePointUrl + '_api/Web/Lists(guid\'e5a20afd-bf5c-4ddf-9478-f8db0a32003c\')/Items(2)/ParentList'
				}
			},
			'FileSystemObjectType': 0,
			'Id': 2,
			'ContentTypeId': '0x010061AA660B5BE00B48AC6CC4B1659DC865',
			'Title': null,
			'LastDay': '2015-04-10T06:00:00Z',
			'FirstDay': '2015-01-05T07:00:00Z',
			'ShiftGroupId': 3,
			'Year': '2015',
			'Active': false,
			'NextSemesterId': 4,
			'ID': 2,
			'Modified': '2015-04-23T01:43:40Z',
			'Created': '2014-12-15T21:36:38Z',
			'AuthorId': 11,
			'EditorId': 11,
			'OData__UIVersionString': '1.0',
			'Attachments': false,
			'GUID': 'c925a05e-a341-4e5d-bbb8-373e90982e4a'
		});
	});

	/**************************************************************************
	 *                                  TESTS                                 *
	 **************************************************************************/

	it('should be able to be instantiated.', function() {
		expect(testSemester).not.toBeNull();
	});
	describe('listName property', function() {
		it('should be "Semester".', function() {
			expect(testSemester.listName).toBe('Semester');
		});
	});
	describe('initAttributes() method.', function() {
		it('should populate the properties', function() {
			expect(testSemester.Active).toBeFalsy();
			expect(testSemester.FirstDay).toEqual(Date.parse('2015-01-05T07:00:00Z'));
			expect(testSemester.LastDay).toEqual(Date.parse('2015-04-10T06:00:00Z'));
			expect(testSemester.NextSemesterId).toBe(4);
			expect(testSemester.ShiftGroupId).toBe(3);
			expect(testSemester.Year).toBe('2015');
			expect(testSemester.NextSemester).toEqual(testNextSemester);
			expect(testSemester.ShiftGroup).toEqual(testShiftGroup);
		});
		it('should call the updateData() method.', function() {
			expect(Semester.prototype.updateData).toHaveBeenCalled();
		});
	});
	describe('updateData() method', function() {
		it('should populate the data property.', function() {
			expect(testSemester.data).toEqual({
				Active: false,
				FirstDay: testSemester.FirstDay,
				LastDay: testSemester.LastDay,
				NextSemesterId: testSemester.NextSemesterId,
				ShiftGroupId: testSemester.ShiftGroupId,
				Year: testSemester.Year
			});
		});
		it('should call the Data.prototype.updateData() method.', function() {
			expect(Data.prototype.updateData).toHaveBeenCalled();
		});
	});
	describe('toString() method', function() {
		it('should return "New Semester" if there ins\'t a shiftGroup defined.', function() {
			testSemester.ShiftGroup = undefined;
			expect(testSemester.toString()).toBe('New Semester');
		});
		it('should return "<ShiftGroup> <Year> Semester" if there is a shiftGroup defined.', function() {
			expect(testSemester.toString()).toBe('Test ShiftGroup 2015 Semester');
		});
	});
	describe('deactivate() method', function() {
		beforeEach(function() {
			testSemester.deactivate();
			$timeout.flush();
		});
		it('should call the Data.prototype.update() method.', function() {
			expect(Data.prototype.update).toHaveBeenCalled();
		});
		it('should set the Active property to false.', function() {
			expect(testSemester.Active).toBeFalsy();
		});
	});
	describe('query() method', function() {
		beforeEach(function() {
			Semester.query();
			$timeout.flush();
		});
		it('should call the Data.query() method.', function() {
			expect(Data.query).toHaveBeenCalled();
		});
		it('should call the Array.prototype.reverse() method.', function() {
			expect(Array.prototype.reverse).toHaveBeenCalled();
		});
	});
});
