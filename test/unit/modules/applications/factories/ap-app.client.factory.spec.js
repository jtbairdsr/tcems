/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-18 16:30:55
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-19 08:21:45
 */

'use strict';

describe('APApp factory', function() {

	/**************************************************************************
	 *                                  PREP                                  *
	 **************************************************************************/

	var testAPApp, testNewAPApp, testQuestion, testAreaPosition,

		// Services
		$q, $timeout,

		// Values
		questions, areaPositions,

		// Objects
		APApp, Question, Data;

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
			questions = $injector.get('questions');
			areaPositions = $injector.get('areaPositions');

			// Data
			APApp = $injector.get('APApp');
			Question = $injector.get('Question');
			Data = $injector.get('Data');
		});

		// Define spies
		spyOn(Data, 'query').andCallThrough();
		spyOn(Data.prototype, 'initAttributes').andCallThrough();
		spyOn(Data.prototype, 'updateData').andCallThrough();
		spyOn(Data.prototype, 'add').andCallThrough();
		spyOn(Data.prototype, 'update').andCallThrough();
		spyOn(APApp.prototype, 'updateData').andCallThrough();

		// Define the test data
		testAPApp = new APApp({
			'Id': 1,
			'AreaPositionId': 1,
			'QuestionId': 2
		});
		testNewAPApp = new APApp();
		testQuestion = {
			Id: 2,
			toString: function() {
				return 'What is your favorite book?';
			}
		};
		questions.list.splice(0, questions.list.length);
		questions.list.push(testQuestion);
		testAreaPosition = {
			Id: 1,
			toString: function() {
				return 'Campus';
			}
		};
		areaPositions.list.splice(0, areaPositions.list.length);
		areaPositions.list.push(testAreaPosition);
	});

	/**************************************************************************
	 *                                  TESTS                                 *
	 **************************************************************************/

	it('should be able to be instantiated.', function() {
		expect(testAPApp).not.toBeNull();
		expect(testNewAPApp).not.toBeNull();
	});
	describe('listName property', function() {
		it('should be "APApp".', function() {
			expect(testAPApp.listName).toBe('APApp');
			expect(testNewAPApp.listName).toBe('APApp');
		});
	});
	describe('initAttributes method', function() {
		it('should populate the qId property.', function() {
			expect(testAPApp.qId).toBe(2);
			expect(testNewAPApp.qId).toBeUndefined();
		});
		it('should populate the aPId property.', function() {
			expect(testAPApp.aPId).toBe(1);
			expect(testNewAPApp.aPId).toBeUndefined();
		});
		it('should populate the ap property.', function() {
			expect(testAPApp.ap.Id).toBe(testAreaPosition.Id);
			expect(testNewAPApp.ap).toBeUndefined();
		});
		it('should populate the ques property.', function() {
			expect(testAPApp.ques.Id).toBe(testQuestion.Id);
			expect(testNewAPApp.ques).toBeUndefined();
		});
		it('should call the updateData() method.', function() {
			expect(APApp.prototype.updateData.callCount).toBe(2);
		});
	});
	describe('updateData() method', function() {
		it('should populate the data property.', function() {
			expect(testAPApp.data).toEqual({
				AreaPositionId: 1,
				QuestionId: 2
			});
			expect(testNewAPApp.data).toEqual({});
		});
		it('should call the Data.prototype.updateData() method.', function() {
			expect(Data.prototype.updateData.callCount).toBe(2);
		});
	});
	describe('toString() method', function() {
		it('should return "New area-position application question" if it has no Id.', function() {
			expect(testNewAPApp.toString()).toBe('New area-position application question');
		});
		it('should return "<AreaPosition>\'s application link to:\n<Question>" if it has an Id.', function() {
			expect(testAPApp.toString()).toBe('Campus\'s application link to:\nWhat is your favorite book?');
		});
	});
	describe('query() method', function() {
		it('should call the Data.query() method.', function() {
			APApp.query();
			$timeout.flush();
			expect(Data.query).toHaveBeenCalled();
		});
	});
});

