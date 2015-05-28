/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-29 16:36:13
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-27 17:40:21
 */

'use strict';

describe('AreaPosition object', function() {

	/**************************************************************************
	 *                                  PREP                                  *
	 **************************************************************************/

	var testAreaPosition, testNewAreaPosition, testArea, testPosition,

		// Services
		$q, $timeout,

		// Values
		positions, areas,

		// Objects
		Data, AreaPosition;

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
			areas = $injector.get('areas');
			positions = $injector.get('positions');

			// Objects
			Data = $injector.get('Data');
			AreaPosition = $injector.get('AreaPosition');
		});

		// Define spies
		spyOn(Data, 'query').andCallThrough();
		spyOn(Data.prototype, 'initAttributes').andCallThrough();
		spyOn(Data.prototype, 'updateData').andCallThrough();
		spyOn(AreaPosition.prototype, 'updateData').andCallThrough();
		spyOn(AreaPosition.prototype, 'setAreasPosition').andCallThrough();

		// Define the test data
		areas.list.splice(0, areas.list.length);
		positions.list.splice(0, positions.list.length);
		testArea = {
			Id: 1,
			Description: 'Test Area',
			Positions: []
		};
		testPosition = {
			Id: 4,
			Description: 'Test Position'
		};
		areas.list.push(testArea);
		positions.list.push(testPosition);
		testAreaPosition = new AreaPosition({
			'Id': 2,
			'AreaId': 1,
			'PositionId': 4,
			'Hiring': 'January 1, 2015',
			'Entry': true,
			'CanSeeApps': true,
			'Open': true,
			'Referal': true,
			'Review': true,
			'AResume': true,
			'RResume': true,
			'ACoverLetter': true,
			'RCoverLetter': true
		});
		testNewAreaPosition = new AreaPosition();
	});

	it('should be able to be instantiated', function() {
		expect(testAreaPosition).not.toBe(null);
	});
	describe('"listname" property', function() {
		it('should be "AreaPosition"', function() {
			expect(testAreaPosition.listName).toBe('AreaPosition');
		});
	});
	describe('"initAttributes" method', function() {
		it('should populate the AreaId property.', function() {
			expect(testAreaPosition.AreaId).toBe(1);
			expect(testNewAreaPosition.AreaId).toBeUndefined();
		});
		it('should populate the PositionId property.', function() {
			expect(testAreaPosition.PositionId).toBe(4);
			expect(testNewAreaPosition.PositionId).toBeUndefined();
		});
		it('should populate the hiring property.', function() {
			expect(testAreaPosition.hiring).toEqual(Date.parse('January 1, 2015'));
			expect(testNewAreaPosition.hiring).toBeUndefined();
		});
		it('should populate the cSApps property.', function() {
			expect(testAreaPosition.cSApps).toBeTruthy();
			expect(testNewAreaPosition.cSApps).toBeFalsy();
		});
		it('should populate the entry property.', function() {
			expect(testAreaPosition.entry).toBeTruthy();
			expect(testNewAreaPosition.entry).toBeFalsy();
		});
		it('should populate the open property.', function() {
			expect(testAreaPosition.open).toBeTruthy();
			expect(testNewAreaPosition.open).toBeFalsy();
		});
		it('should populate the referal property.', function() {
			expect(testAreaPosition.referal).toBeTruthy();
			expect(testNewAreaPosition.referal).toBeFalsy();
		});
		it('should populate the review property.', function() {
			expect(testAreaPosition.review).toBeTruthy();
			expect(testNewAreaPosition.review).toBeFalsy();
		});
		it('should populate the ar property.', function() {
			expect(testAreaPosition.ar).toBeTruthy();
			expect(testNewAreaPosition.ar).toBeFalsy();
		});
		it('should populate the rr property.', function() {
			expect(testAreaPosition.rr).toBeTruthy();
			expect(testNewAreaPosition.rr).toBeFalsy();
		});
		it('should populate the acl property.', function() {
			expect(testAreaPosition.acl).toBeTruthy();
			expect(testNewAreaPosition.acl).toBeFalsy();
		});
		it('should populate the rcl property.', function() {
			expect(testAreaPosition.rcl).toBeTruthy();
			expect(testNewAreaPosition.rcl).toBeFalsy();
		});
		it('should populate the Area property.', function() {
			expect(testAreaPosition.Area).toEqual(testArea);
			expect(testNewAreaPosition.Area).toBeUndefined();
		});
		it('should populate the Position property.', function() {
			expect(testAreaPosition.Position).toEqual(testPosition);
			expect(testNewAreaPosition.Position).toBeUndefined();
		});
		it('should call the Data.prototype.initAttributes() method.', function() {
			expect(Data.prototype.initAttributes.callCount).toBe(2);
		});
		it('should call the setAreasPosition() method.', function() {
			expect(AreaPosition.prototype.setAreasPosition.callCount).toBe(2);
		});
		it('should call the updateData() method.', function() {
			expect(AreaPosition.prototype.updateData.callCount).toBe(2);
		});
	});
	describe('"updateData" method', function() {
		it('should set the data property.', function() {
			expect(testAreaPosition.data).toEqual({
				AreaId: 1,
				PositionId: 4,
				CanSeeApps: true,
				Entry: true,
				Hiring: Date.parse('January 1, 2015'),
				Open: true,
				Referal: true,
				Review: true,
				AResume: true,
				RResume: true,
				ACoverLetter: true,
				RCoverLetter: true
			});
		});
		it('should call the Data.prototype.updateData() method.', function() {
			expect(Data.prototype.updateData.callCount).toBe(2);
		});
	});
	describe('"toString" method', function() {
		it('should return "New AreaPosition if either the Area or Position properties are undefined.', function() {
			expect(new AreaPosition().toString()).toEqual('New AreaPosition');
		});
		it('should return "Saras AreaPosition" if the Description property is defined.', function() {
			expect(testAreaPosition.toString()).toEqual('Test Area Test Position');
		});
	});
	describe('query() method', function() {
		it('should call the Data.query() method.', function() {
			AreaPosition.query();
			$timeout.flush();
			expect(Data.query).toHaveBeenCalled();
		});
	});
});
