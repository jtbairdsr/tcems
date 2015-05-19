/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-18 16:30:55
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-19 07:39:07
 */

'use strict';

describe('Response factory', function() {

	/**************************************************************************
	 *                                  PREP                                  *
	 **************************************************************************/

	var testFFResponse, testMCResponse, testCResponse, testBResponse, testDResponse, testNewResponse,
		testFFQuestion, testMCQuestion, testCQuestion, testBQuestion, testDQuestion, testEmployee,

		// Services
		$q, $timeout,

		// Values
		responses, questions, employees,

		// Objects
		Response, Question, Employee, Data;

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
			responses = $injector.get('responses');
			questions = $injector.get('questions');
			employees = $injector.get('employees');

			// Data
			Response = $injector.get('Response');
			Question = $injector.get('Question');
			Employee = $injector.get('Employee');
			Data = $injector.get('Data');
		});

		// Define spies
		spyOn(Data, 'query').andCallThrough();
		spyOn(Data.prototype, 'initAttributes').andCallThrough();
		spyOn(Data.prototype, 'updateData').andCallThrough();
		spyOn(Data.prototype, 'add').andCallThrough();
		spyOn(Data.prototype, 'update').andCallThrough();
		spyOn(Response.prototype, 'updateData').andCallThrough();

		// Define the test data
		testFFResponse = new Response({
			Id: 1,
			'Type': 'FreeForm',
			'Content': 'The Return of the King',
			'EmployeeId': 6664,
			'QuestionId': 2
		});
		testMCResponse = new Response({
			Id: 2,
			'Type': 'MultipleChoice',
			'Content': 'Remind him of the honor code.,Let him test.',
			'EmployeeId': 6664,
			'QuestionId': 4
		});
		testCResponse = new Response({
			Id: 3,
			'Type': 'Choice',
			'Content': '8',
			'EmployeeId': 6664,
			'QuestionId': 3
		});
		testBResponse = new Response({
			Id: 4,
			'Type': 'Boolean',
			'Content': 'Yes',
			'EmployeeId': 6664,
			'QuestionId': 5
		});
		testDResponse = new Response({
			Id: 5,
			'Type': 'Date',
			'Content': 'January 1, 2011',
			'EmployeeId': 6664,
			'QuestionId': 1
		});
		testNewResponse = new Response();
		testFFQuestion = {
			Id: 2,
			toString: function() {
				return 'What is your favorite book?';
			}
		};
		testMCQuestion = {
			Id: 4,
			toString: function() {
				return 'Choose all appropriate responses to a beard.';
			}
		};
		testCQuestion = {
			Id: 3,
			toString: function() {
				return 'On a scale of one to ten how chipper are you?';
			}
		};
		testBQuestion = {
			Id: 5,
			toString: function() {
				return 'Will you follow the Testing Center Dress and grooming standards?';
			}
		};
		testDQuestion = {
			Id: 1,
			toString: function() {
				return 'When will you be available to start working?';
			}
		};
		questions.list.splice(0, questions.list.length);
		questions.list.push(testFFQuestion);
		questions.list.push(testMCQuestion);
		questions.list.push(testCQuestion);
		questions.list.push(testBQuestion);
		questions.list.push(testDQuestion);
		testEmployee = {
			Id: 6664,
			toString: function() {
				return 'Jonathan Baird';
			}
		};
		employees.list.splice(0, employees.list.length);
		employees.list.push(testEmployee);
	});

	/**************************************************************************
	 *                                  TESTS                                 *
	 **************************************************************************/

	it('should be able to be instantiated.', function() {
		expect(testFFResponse).not.toBeNull();
		expect(testMCResponse).not.toBeNull();
		expect(testCResponse).not.toBeNull();
		expect(testBResponse).not.toBeNull();
		expect(testDResponse).not.toBeNull();
		expect(testNewResponse).not.toBeNull();
	});
	describe('listName property', function() {
		it('should be "Response".', function() {
			expect(testFFResponse.listName).toBe('Response');
			expect(testMCResponse.listName).toBe('Response');
			expect(testCResponse.listName).toBe('Response');
			expect(testBResponse.listName).toBe('Response');
			expect(testDResponse.listName).toBe('Response');
			expect(testNewResponse.listName).toBe('Response');
		});
	});
	describe('initAttributes() method', function() {
		it('should populate the type property.', function() {
			expect(testFFResponse.type).toBe('FreeForm');
			expect(testMCResponse.type).toBe('MultipleChoice');
			expect(testCResponse.type).toBe('Choice');
			expect(testBResponse.type).toBe('Boolean');
			expect(testDResponse.type).toBe('Date');
			expect(testNewResponse.type).toBeUndefined();
		});
		it('should populate the content property.', function() {
			expect(testFFResponse.content).toBe('The Return of the King');
			expect(testMCResponse.content).toEqual(['Remind him of the honor code.', 'Let him test.']);
			expect(testCResponse.content).toBe('8');
			expect(testBResponse.content).toBeTruthy();
			expect(testDResponse.content).toEqual(Date.parse('January 1, 2011'));
			expect(testNewResponse.content).toBeUndefined();
		});
		it('should populate the qId property.', function() {
			expect(testFFResponse.qId).toBe(2);
			expect(testMCResponse.qId).toBe(4);
			expect(testCResponse.qId).toBe(3);
			expect(testBResponse.qId).toBe(5);
			expect(testDResponse.qId).toBe(1);
			expect(testNewResponse.qId).toBeUndefined();
		});
		it('should populate the eId property.', function() {
			expect(testFFResponse.eId).toBe(6664);
			expect(testMCResponse.eId).toBe(6664);
			expect(testCResponse.eId).toBe(6664);
			expect(testBResponse.eId).toBe(6664);
			expect(testDResponse.eId).toBe(6664);
			expect(testNewResponse.eId).toBeUndefined();
		});
		it('should populate the emp property.', function() {
			expect(testFFResponse.emp.Id).toBe(testEmployee.Id);
			expect(testMCResponse.emp.Id).toBe(testEmployee.Id);
			expect(testCResponse.emp.Id).toBe(testEmployee.Id);
			expect(testBResponse.emp.Id).toBe(testEmployee.Id);
			expect(testDResponse.emp.Id).toBe(testEmployee.Id);
			expect(testNewResponse.emp).toBeUndefined();
		});
		it('should populate the ques property.', function() {
			expect(testFFResponse.ques.Id).toBe(testFFQuestion.Id);
			expect(testMCResponse.ques.Id).toBe(testMCQuestion.Id);
			expect(testCResponse.ques.Id).toBe(testCQuestion.Id);
			expect(testBResponse.ques.Id).toBe(testBQuestion.Id);
			expect(testDResponse.ques.Id).toBe(testDQuestion.Id);
			expect(testNewResponse.ques).toBeUndefined();
		});
		it('should call the updateData() method.', function() {
			expect(Response.prototype.updateData.callCount).toBe(6);
		});
	});
	describe('updateData() method', function() {
		it('should populate the data property.', function() {
			expect(testFFResponse.data).toEqual({
				Content: 'The Return of the King',
				Type: 'FreeForm',
				EmployeeId: 6664,
				QuestionId: 2
			});
			expect(testMCResponse.data).toEqual({
				Content: 'Remind him of the honor code.,Let him test.',
				Type: 'MultipleChoice',
				EmployeeId: 6664,
				QuestionId: 4
			});
			expect(testCResponse.data).toEqual({
				Content: '8',
				Type: 'Choice',
				EmployeeId: 6664,
				QuestionId: 3
			});
			expect(testBResponse.data).toEqual({
				Content: 'true',
				Type: 'Boolean',
				EmployeeId: 6664,
				QuestionId: 5
			});
			expect(testDResponse.data).toEqual({
				Content: 'January 1, 2011',
				Type: 'Date',
				EmployeeId: 6664,
				QuestionId: 1
			});
			expect(testNewResponse.data).toEqual({});
		});
		it('should call the Data.prototype.updateData() method.', function() {
			expect(Data.prototype.updateData.callCount).toBe(6);
		});
	});
	describe('toString() method', function() {
		it('should return "New response" if it has no Id.', function() {
			expect(testNewResponse.toString()).toBe('New response');
		});
		it('should return "<Employee>\'s response to:\n<Question>" if it has an Id.', function() {
			expect(testFFResponse.toString()).toBe('Jonathan Baird\'s response to:\nWhat is your favorite book?');
		});
	});
	describe('query() method', function() {
		it('should call the Data.query() method.', function() {
			Response.query();
			$timeout.flush();
			expect(Data.query).toHaveBeenCalled();
		});
	});
});

