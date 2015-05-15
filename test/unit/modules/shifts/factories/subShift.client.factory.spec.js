/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-13 14:59:38
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-13 17:06:02
 */

'use strict';

describe('SubShift factory', function() {

	/**************************************************************************
	 *                                  PREP                                  *
	 **************************************************************************/

	var testSubShift, testRequester, testShift, testSubstitute,

		// Services/Value
		$q, $timeout, currentUser, sharePointUrl, subShifts, employees,
		semesters, shifts,

		// Objects
		SubShift, Data;

	beforeEach(function() {
		// Define the module
		module(ApplicationConfiguration.applicationModuleName);

		// Mock dependencies
		module(function($provide) {
			$provide.value('currentUser', {
				data: {
					Id: 6681
				}
			});
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
			$provide.factory('$alert', function() {
				function alert() {

				}
				return alert;
			});
		});

		// Assign injectiosn of the services/values to local variables
		inject(function($injector) {
			// Services/Values
			$q = $injector.get('$q');
			$timeout = $injector.get('$timeout');
			currentUser = $injector.get('currentUser');
			subShifts = $injector.get('subShifts');
			employees = $injector.get('employees');
			semesters = $injector.get('semesters');
			shifts = $injector.get('shifts');

			// Objects
			Data = $injector.get('Data');
			SubShift = $injector.get('SubShift');
		});

		// Define spies
		spyOn(Data, 'query').andCallThrough();
		spyOn(Data.prototype, 'initAttributes').andCallThrough();
		spyOn(Data.prototype, 'updateData').andCallThrough();
		spyOn(Data.prototype, 'add').andCallThrough();
		spyOn(Data.prototype, 'update').andCallThrough();
		spyOn(SubShift.prototype, 'updateData').andCallThrough();
		spyOn(SubShift.prototype, 'deactivate').andCallThrough();
		spyOn(Array.prototype, 'reverse').andCallThrough();

		// Define the data
		testRequester = {
			Id: 6681,
			toString: function() {
				return 'Test Requester';
			}
		};
		testShift = {
			Id: 48,
			toString: function() {
				return '\nStartTime - EndTime';
			}
		};
		testSubstitute = {
			Id: 7170,
			toString: function() {
				return 'Test Substitute';
			}
		};
		employees.list.splice(0, employees.list.length);
		employees.list.push(testRequester);
		employees.list.push(testSubstitute);
		shifts.list.splice(0, shifts.list.length);
		shifts.list.push(testShift);
		testSubShift = new SubShift({
			'__metadata': {
				'id': 'Web/Lists(guid\'2d0c06cd-a975-48d5-b0fe-112e7602b172\')/Items(71)',
				'uri': sharePointUrl + '_api/Web/Lists(guid\'2d0c06cd-a975-48d5-b0fe-112e7602b172\')/Items(71)',
				'etag': '"4"',
				'type': 'SP.Data.SubShiftListItem'
			},
			'FirstUniqueAncestorSecurableObject': {
				'__deferred': {
					'uri': sharePointUrl + '_api/Web/Lists(guid\'2d0c06cd-a975-48d5-b0fe-112e7602b172\')/Items(71)/FirstUniqueAncestorSecurableObject'
				}
			},
			'RoleAssignments': {
				'__deferred': {
					'uri': sharePointUrl + '_api/Web/Lists(guid\'2d0c06cd-a975-48d5-b0fe-112e7602b172\')/Items(71)/RoleAssignments'
				}
			},
			'AttachmentFiles': {
				'__deferred': {
					'uri': sharePointUrl + '_api/Web/Lists(guid\'2d0c06cd-a975-48d5-b0fe-112e7602b172\')/Items(71)/AttachmentFiles'
				}
			},
			'ContentType': {
				'__deferred': {
					'uri': sharePointUrl + '_api/Web/Lists(guid\'2d0c06cd-a975-48d5-b0fe-112e7602b172\')/Items(71)/ContentType'
				}
			},
			'FieldValuesAsHtml': {
				'__deferred': {
					'uri': sharePointUrl + '_api/Web/Lists(guid\'2d0c06cd-a975-48d5-b0fe-112e7602b172\')/Items(71)/FieldValuesAsHtml'
				}
			},
			'FieldValuesAsText': {
				'__deferred': {
					'uri': sharePointUrl + '_api/Web/Lists(guid\'2d0c06cd-a975-48d5-b0fe-112e7602b172\')/Items(71)/FieldValuesAsText'
				}
			},
			'FieldValuesForEdit': {
				'__deferred': {
					'uri': sharePointUrl + '_api/Web/Lists(guid\'2d0c06cd-a975-48d5-b0fe-112e7602b172\')/Items(71)/FieldValuesForEdit'
				}
			},
			'File': {
				'__deferred': {
					'uri': sharePointUrl + '_api/Web/Lists(guid\'2d0c06cd-a975-48d5-b0fe-112e7602b172\')/Items(71)/File'
				}
			},
			'Folder': {
				'__deferred': {
					'uri': sharePointUrl + '_api/Web/Lists(guid\'2d0c06cd-a975-48d5-b0fe-112e7602b172\')/Items(71)/Folder'
				}
			},
			'ParentList': {
				'__deferred': {
					'uri': sharePointUrl + '_api/Web/Lists(guid\'2d0c06cd-a975-48d5-b0fe-112e7602b172\')/Items(71)/ParentList'
				}
			},
			'FileSystemObjectType': 0,
			'Id': 71,
			'ContentTypeId': '0x01000D4358812528E64E953EE67485DA918D',
			'Title': null,
			'Date': '2014-10-03T06:00:00Z',
			'SubstituteId': 7170,
			'RequesterId': 6681,
			'ShiftId': 48,
			'Active': true,
			'sendEmailOnAccept': {
				'__metadata': {
					'type': 'SP.FieldUrlValue'
				},
				'Description': 'Stage 1',
				'Url': sharePointUrl + '_layouts/15/wrkstat.aspx?List=2d0c06cd-a975-48d5-b0fe-112e7602b172&WorkflowInstanceName=7570a5b6-ce33-4db9-8acc-e4001693d216'
			},
			'NewRequestId': null,
			'SemesterId': 1,
			'ID': 71,
			'Modified': '2014-12-17T02:06:05Z',
			'Created': '2014-09-19T19:56:04Z',
			'AuthorId': 174,
			'EditorId': 11,
			'OData__UIVersionString': '1.0',
			'Attachments': false,
			'GUID': 'b15abd77-fe4f-4ec0-a792-14c021bd915d'
		});
	});

	/**************************************************************************
	 *                                  TESTS                                 *
	 **************************************************************************/

	it('should be able to be instantiated', function() {
		expect(testSubShift).not.toBeNull();
	});
	describe('listName property', function() {
		it('should be "SubShift"', function() {
			expect(testSubShift.listName).toBe('SubShift');
		});
	});
	describe('initAttributes() method', function() {
		it('should populate the properties', function() {
			expect(testSubShift.Active).toBeTruthy();
			expect(testSubShift.Date).toEqual(Date.parse('2014-10-03T06:00:00Z'));
			expect(testSubShift.NewRequestId).toBeUndefined();
			expect(testSubShift.RequesterId).toBe(6681);
			expect(testSubShift.SemesterId).toBe(1);
			expect(testSubShift.ShiftId).toBe(48);
			expect(testSubShift.SubstituteId).toBe(7170);
			expect(testSubShift.NewRequest).toBeUndefined();
			expect(testSubShift.Requester).toEqual(testRequester);
			expect(testSubShift.Semester).toEqual();
			expect(testSubShift.Shift).toEqual(testShift);
			expect(testSubShift.Substitute).toEqual(testSubstitute);
		});
		it('should call the updateData() method.', function() {
			expect(SubShift.prototype.updateData).toHaveBeenCalled();
		});
	});
	describe('updateData() method', function() {
		it('should populate the data property', function() {
			expect(testSubShift.data).toEqual({
				Active: true,
				Date: Date.parse('2014-10-03T06:00:00Z'),
				NewRequestId: undefined,
				RequesterId: 6681,
				SemesterId: 1,
				ShiftId: 48,
				SubstituteId: 7170
			});
		});
		it('should call the Data.prototype.updateData() method.', function() {
			expect(Data.prototype.updateData).toHaveBeenCalled();
		});
	});
	describe('toString() method', function() {
		it('should return "New SubShift" when there is no requester.', function() {
			testSubShift.RequesterId = undefined;
			expect(testSubShift.toString()).toEqual('New SubShift');
		});
		it('should return \n"<Requester>\'s sub request for:\n<Date> <Shift>"\n when there is a requester but no substitute.', function() {
			testSubShift.SubstituteId = undefined;
			expect(testSubShift.toString()).toEqual('Test Requester\'s sub request for:\nFriday Oct 3rd StartTime - EndTime');
		});
		it('should return \n"<Substitute> subbing for <Requester>\n<Date> <Shift>"\n when there is a substitute.', function() {
			expect(testSubShift.toString()).toEqual('Test Substitute subbing for Test Requester\nFriday Oct 3rd from StartTime - EndTime');
		});
	});
	describe('add() method', function() {
		beforeEach(function() {
			this.tempTestSubShift = new SubShift();
			this.tempTestSubShift.add();
			$timeout.flush();
		});
		it('should call the Data.prototype.add() method.', function() {
			expect(Data.prototype.add).toHaveBeenCalled();
		});
		it('should set the Active property to true.', function() {
			expect(this.tempTestSubShift.Active).toBeTruthy();
		});
	});
	describe('deactivate() method', function() {
		beforeEach(function() {
			testSubShift.deactivate();
			$timeout.flush();
		});
		it('should call the Data.prototype.update() method.', function() {
			expect(Data.prototype.update).toHaveBeenCalled();
		});
		it('should set the Active property to false.', function() {
			expect(testSubShift.Active).toBeFalsy();
		});
	});
	describe('newRequest() method', function() {
		beforeEach(function() {
			testSubShift.newRequest();
			$timeout.flush();
		});
		it('should call the Data.prototype.add() method.', function() {
			expect(Data.prototype.add).toHaveBeenCalled();
		});
		it('should call the Data.prototype.update() method.', function() {
			expect(Data.prototype.update).toHaveBeenCalled();
		});
	});
	describe('cancel() method', function() {
		beforeEach(function() {});
		it('should call the deactivate() method.', function() {
			testSubShift.SubstituteId = undefined;
			testSubShift.cancel();
			$timeout.flush();
			expect(SubShift.prototype.deactivate).toHaveBeenCalled();
		});
		it('should not call the deactivate() method if there is a sub or if the current user isn\'t the requester.', function() {
			testSubShift.cancel();
			expect(SubShift.prototype.deactivate).not.toHaveBeenCalled();
			SubShift.prototype.update.reset();
			testSubShift.SubstituteId = undefined;
			currentUser.data.Id = 0;
			testSubShift.cancel();
			expect(SubShift.prototype.deactivate).not.toHaveBeenCalled();
		});
	});
	describe('query() method', function() {
		beforeEach(function() {
			SubShift.query();
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
