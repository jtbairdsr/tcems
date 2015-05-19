/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-18 16:30:55
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-19 08:11:04
 */

'use strict';

describe('AApp factory', function() {

	/**************************************************************************
	 *                                  PREP                                  *
	 **************************************************************************/

	var testAApp, testNewAApp, testQuestion, testArea,

		// Services
		$q, $timeout,

		// Values
		aApps, questions, areas,

		// Objects
		AApp, Question, Data;

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
			aApps = $injector.get('aApps');
			questions = $injector.get('questions');
			areas = $injector.get('areas');

			// Data
			AApp = $injector.get('AApp');
			Question = $injector.get('Question');
			Data = $injector.get('Data');
		});

		// Define spies
		spyOn(Data, 'query').andCallThrough();
		spyOn(Data.prototype, 'initAttributes').andCallThrough();
		spyOn(Data.prototype, 'updateData').andCallThrough();
		spyOn(Data.prototype, 'add').andCallThrough();
		spyOn(Data.prototype, 'update').andCallThrough();
		spyOn(AApp.prototype, 'updateData').andCallThrough();

		// Define the test data
		testAApp = new AApp({
			'Id': 1,
			'AreaId': 1,
			'QuestionId': 2
		});
		testNewAApp = new AApp();
		testQuestion = {
			Id: 2,
			toString: function() {
				return 'What is your favorite book?';
			}
		};
		questions.list.splice(0, questions.list.length);
		questions.list.push(testQuestion);
		testArea = {
			Id: 1,
			toString: function() {
				return 'Campus';
			}
		};
		areas.list.splice(0, areas.list.length);
		areas.list.push(testArea);
	});

	/**************************************************************************
	 *                                  TESTS                                 *
	 **************************************************************************/

	it('should be able to be instantiated.', function() {
		expect(testAApp).not.toBeNull();
		expect(testNewAApp).not.toBeNull();
	});
	describe('listName property', function() {
		it('should be "AApp".', function() {
			expect(testAApp.listName).toBe('AApp');
			expect(testNewAApp.listName).toBe('AApp');
		});
	});
	describe('initAttributes method', function() {
		it('should populate the qId property.', function() {
			expect(testAApp.qId).toBe(2);
			expect(testNewAApp.qId).toBeUndefined();
		});
		it('should populate the aId property.', function() {
			expect(testAApp.aId).toBe(1);
			expect(testNewAApp.aId).toBeUndefined();
		});
		it('should populate the area property.', function() {
			expect(testAApp.area.Id).toBe(testArea.Id);
			expect(testNewAApp.area).toBeUndefined();
		});
		it('should populate the ques property.', function() {
			expect(testAApp.ques.Id).toBe(testQuestion.Id);
			expect(testNewAApp.ques).toBeUndefined();
		});
		it('should call the updateData() method.', function() {
			expect(AApp.prototype.updateData.callCount).toBe(2);
		});
	});
	describe('updateData() method', function() {
		it('should populate the data property.', function() {
			expect(testAApp.data).toEqual({
				AreaId: 1,
				QuestionId: 2
			});
			expect(testNewAApp.data).toEqual({});
		});
		it('should call the Data.prototype.updateData() method.', function() {
			expect(Data.prototype.updateData.callCount).toBe(2);
		});
	});
	describe('toString() method', function() {
		it('should return "New area application question" if it has no Id.', function() {
			expect(testNewAApp.toString()).toBe('New area application question');
		});
		it('should return "<Area>\'s application link to:\n<Question>" if it has an Id.', function() {
			expect(testAApp.toString()).toBe('Campus\'s application link to:\nWhat is your favorite book?');
		});
	});
	describe('query() method', function() {
		it('should call the Data.query() method.', function() {
			AApp.query();
			$timeout.flush();
			expect(Data.query).toHaveBeenCalled();
		});
	});
});

