/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-18 16:30:55
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-19 08:40:05
 */

'use strict';

describe('PApp factory', function() {

	/**************************************************************************
	 *                                  PREP                                  *
	 **************************************************************************/

	var testPApp, testNewPApp, testQuestion, testPosition,

		// Services
		$q, $timeout,

		// Values
		questions, positions,

		// Objects
		PApp, Question, Data;

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
			positions = $injector.get('positions');

			// Data
			PApp = $injector.get('PApp');
			Question = $injector.get('Question');
			Data = $injector.get('Data');
		});

		// Define spies
		spyOn(Data, 'query').andCallThrough();
		spyOn(Data.prototype, 'initAttributes').andCallThrough();
		spyOn(Data.prototype, 'updateData').andCallThrough();
		spyOn(Data.prototype, 'add').andCallThrough();
		spyOn(Data.prototype, 'update').andCallThrough();
		spyOn(PApp.prototype, 'updateData').andCallThrough();

		// Define the test data
		testPApp = new PApp({
			'Id': 1,
			'PositionId': 1,
			'QuestionId': 2
		});
		testNewPApp = new PApp();
		testQuestion = {
			Id: 2,
			toString: function() {
				return 'What is your favorite book?';
			}
		};
		questions.list.splice(0, questions.list.length);
		questions.list.push(testQuestion);
		testPosition = {
			Id: 1,
			toString: function() {
				return 'Proctor';
			}
		};
		positions.list.splice(0, positions.list.length);
		positions.list.push(testPosition);
	});

	/**************************************************************************
	 *                                  TESTS                                 *
	 **************************************************************************/

	it('should be able to be instantiated.', function() {
		expect(testPApp).not.toBeNull();
		expect(testNewPApp).not.toBeNull();
	});
	describe('listName property', function() {
		it('should be "PApp".', function() {
			expect(testPApp.listName).toBe('PApp');
			expect(testNewPApp.listName).toBe('PApp');
		});
	});
	describe('initAttributes method', function() {
		it('should populate the qId property.', function() {
			expect(testPApp.qId).toBe(2);
			expect(testNewPApp.qId).toBeUndefined();
		});
		it('should populate the pId property.', function() {
			expect(testPApp.pId).toBe(1);
			expect(testNewPApp.pId).toBeUndefined();
		});
		it('should populate the pos property.', function() {
			expect(testPApp.pos.Id).toBe(testPosition.Id);
			expect(testNewPApp.pos).toBeUndefined();
		});
		it('should populate the ques property.', function() {
			expect(testPApp.ques.Id).toBe(testQuestion.Id);
			expect(testNewPApp.ques).toBeUndefined();
		});
		it('should call the updateData() method.', function() {
			expect(PApp.prototype.updateData.callCount).toBe(2);
		});
	});
	describe('updateData() method', function() {
		it('should populate the data property.', function() {
			expect(testPApp.data).toEqual({
				PositionId: 1,
				QuestionId: 2
			});
			expect(testNewPApp.data).toEqual({});
		});
		it('should call the Data.prototype.updateData() method.', function() {
			expect(Data.prototype.updateData.callCount).toBe(2);
		});
	});
	describe('toString() method', function() {
		it('should return "New position application question" if it has no Id.', function() {
			expect(testNewPApp.toString()).toBe('New position application question');
		});
		it('should return "<Position>\'s application link to:\n<Question>" if it has an Id.', function() {
			expect(testPApp.toString()).toBe('Proctor\'s application link to:\nWhat is your favorite book?');
		});
	});
	describe('query() method', function() {
		it('should call the Data.query() method.', function() {
			PApp.query();
			$timeout.flush();
			expect(Data.query).toHaveBeenCalled();
		});
	});
});

