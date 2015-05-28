/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-29 16:42:33
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-27 18:36:33
 */

'use strict';

describe('Area object', function() {

	/**************************************************************************
	 *                                  PREP                                  *
	 **************************************************************************/

	var testArea, testNewArea, testPosition,

		// Services
		$q, $timeout,

		// Values
		positions,

		// Objects
		Data, Area;

	beforeEach(function() {
		// Define the module
		module(ApplicationConfiguration.applicationModuleName);

		// Mock the dependencies
		module(function($provide) {
			$provide.factory('Data', function($q) {
				function Data(newData, list, listName) {
					newData = newData || {};
					this.newData = newData;
					this.list = list;
					this.listName = listName;
				}
				Data.query = function() {
					var deffered = $q.defer();
					deffered.resolve([1, 2, 3]);
					return deffered.promise;
				};
				Data.prototype.initAttributes = function() {
					this.Id = this.newData.Id || undefined;
				};
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
			// Services
			$q = $injector.get('$q');
			$timeout = $injector.get('$timeout');

			// Values
			positions = $injector.get('positions');

			// Objects
			Data = $injector.get('Data');
			Area = $injector.get('Area');
		});

		// Define spies
		spyOn(Data, 'query').andCallThrough();
		spyOn(Data.prototype, 'initAttributes').andCallThrough();
		spyOn(Data.prototype, 'updateData').andCallThrough();
		spyOn(Area.prototype, 'updateData').andCallThrough();

		// Define the test data
		positions.list.splice(0, positions.list.length);
		testPosition = {
			Id: 6
		};
		positions.list.push(testPosition);
		testNewArea = new Area();
		testArea = new Area({
			'Area': 'Saras',
			'Description': 'Saras',
			'DefaultPositionId': 6,
			'AResume': true,
			'RResume': true,
			'ACoverLetter': true,
			'RCoverLetter': true
		});
	});

	it('should be able to be instantiated', function() {
		expect(testArea).not.toBe(null);
	});
	describe('"listname" property', function() {
		it('should be "Area"', function() {
			expect(testArea.listName).toBe('Area');
		});
	});
	describe('"initAttributes" method', function() {
		it('should populate the ar property.', function() {
			expect(testArea.ar).toBeTruthy();
			expect(testNewArea.ar).toBeFalsy();
		});
		it('should populate the rr property.', function() {
			expect(testArea.rr).toBeTruthy();
			expect(testNewArea.rr).toBeFalsy();
		});
		it('should populate the acl property.', function() {
			expect(testArea.acl).toBeTruthy();
			expect(testNewArea.acl).toBeFalsy();
		});
		it('should populate the rcl property.', function() {
			expect(testArea.rcl).toBeTruthy();
			expect(testNewArea.rcl).toBeFalsy();
		});
		it('should populate the Area property.', function() {
			expect(testArea.Area).toBe('Saras');
			expect(testNewArea.Area).toBeUndefined();
		});
		it('should populate the Description property.', function() {
			expect(testArea.Description).toBe('Saras');
			expect(testNewArea.Description).toBeUndefined();
		});
		it('should populate the DefaultPositionId property.', function() {
			expect(testArea.DefaultPositionId).toEqual(6);
			expect(testNewArea.DefaultPositionId).toBeUndefined();
		});
		it('should call the Data.prototype.initAttributes() method.', function() {
			expect(Data.prototype.initAttributes.callCount).toBe(2);
		});
		it('should call the updateData() method.', function() {
			expect(Area.prototype.updateData.callCount).toBe(2);
		});
	});
	describe('"updateData" method', function() {
		it('should the data property.', function() {
			expect(testArea.data).toEqual({
				Area: 'Saras',
				Description: 'Saras',
				DefaultPositionId: 6,
				AResume: true,
				RResume: true,
				ACoverLetter: true,
				RCoverLetter: true
			});
		});
	});
	describe('"toString" method', function() {
		it('should return "New Area if the Description property is undefined.', function() {
			expect(testNewArea.toString()).toEqual('New Area');
		});
		it('should return "Saras Area" if the Description property is defined.', function() {
			expect(testArea.toString()).toEqual('Saras Area');
		});
	});
	describe('query() method', function() {
		it('should call the Data.query() method.', function() {
			Area.query();
			$timeout.flush();
			expect(Data.query).toHaveBeenCalled();
		});
	});
});
