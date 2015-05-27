/*
 * @Author: jonathan
 * @Date:   2015-05-15 14:21:20
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-22 18:49:47
 */

'use strict';

describe('Question factory', function() {

	/**************************************************************************
	 *                                  PREP                                  *
	 **************************************************************************/

	var testDQuestion, testFFQuestion, testCQuestion, testMCQuestion, testBQuestion,

		// Services
		$q, $timeout,

		// Values
		questions,

		// Objects
		Question, Response, Data;

	beforeEach(function() {
		// Define the module
		module(ApplicationConfiguration.applicationModuleName);

		// Mock the dependencies
		module(function($provide) {
			$provide.factory('Data', function($q) {
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
			$provide.factory('Response', function($q) {
				function Response() {}
				Response.prototype.add = function() {
					var deffered = $q.defer();
					deffered.resolve();
					return deffered.promise;
				};
				return Response;
			});
		});

		// Assign injections of the services/values/objects to local variables
		inject(function($injector) {
			// Services
			$q = $injector.get('$q');
			$timeout = $injector.get('$timeout');

			// Values
			questions = $injector.get('questions');

			// Data
			Question = $injector.get('Question');
			Response = $injector.get('Response');
			Data = $injector.get('Data');
		});

		// Define spies
		spyOn(Data, 'query').andCallThrough();
		spyOn(Data.prototype, 'initAttributes').andCallThrough();
		spyOn(Data.prototype, 'updateData').andCallThrough();
		spyOn(Data.prototype, 'add').andCallThrough();
		spyOn(Data.prototype, 'update').andCallThrough();
		spyOn(Question.prototype, 'updateData').andCallThrough();
		spyOn(Response.prototype, 'add').andCallThrough();

		// Define the test data
		testDQuestion = new Question({
			'Id': 1,
			'AnswerType': 'Date',
			'Content': 'When will you be available to start working?'
		});
		testFFQuestion = new Question({
			'Id': 2,
			'AnswerType': 'FreeForm',
			'Content': 'What is your favorite book?'
		});
		testCQuestion = new Question({
			'Id': 3,
			'AnswerType': 'Choice',
			'Content': 'On a scale of one to ten how chipper are you?',
			'Choices': '1,2,3,4,5,6,7,8,9,10'
		});
		testMCQuestion = new Question({
			'Id': 4,
			'AnswerType': 'MultipleChoice',
			'Content': 'Choose all appropriate responses to a beard.',
			'Choices': 'Send him home.,' + 'Remind him of the honor code.,' + 'Let him test.,' + 'Take him to a Full Time Staff member.,' + 'Ask him to go shave.'
		});
		testBQuestion = new Question({
			'Id': 5,
			'AnswerType': 'Boolean',
			'Content': 'Will you follow the Testing Center Dress and grooming standards?'
		});
	});

	/**************************************************************************
	 *                                  TESTS                                 *
	 **************************************************************************/

	it('should be able to be instantiated.', function() {
		expect(testDQuestion).not.toBeNull();
		expect(testFFQuestion).not.toBeNull();
		expect(testCQuestion).not.toBeNull();
		expect(testMCQuestion).not.toBeNull();
		expect(testBQuestion).not.toBeNull();
	});
	describe('listName property', function() {
		it('should be "Question".', function() {
			expect(testDQuestion.listName).toBe('Question');
			expect(testFFQuestion.listName).toBe('Question');
			expect(testCQuestion.listName).toBe('Question');
			expect(testMCQuestion.listName).toBe('Question');
			expect(testBQuestion.listName).toBe('Question');
		});
	});
	describe('initAttributes() method', function() {
		it('should populate the type property.', function() {
			expect(testDQuestion.type).toBe('Date');
			expect(testFFQuestion.type).toBe('FreeForm');
			expect(testCQuestion.type).toBe('Choice');
			expect(testMCQuestion.type).toBe('MultipleChoice');
			expect(testBQuestion.type).toBe('Boolean');
		});
		it('should populate the content property.', function() {
			expect(testDQuestion.content).toBe('When will you be available to start working?');
			expect(testFFQuestion.content).toBe('What is your favorite book?');
			expect(testCQuestion.content).toBe('On a scale of one to ten how chipper are you?');
			expect(testMCQuestion.content).toBe('Choose all appropriate responses to a beard.');
			expect(testBQuestion.content).toBe('Will you follow the Testing Center Dress and grooming standards?');
		});
		it('should populate the choices property if it is either a "Choice || MultipleChoice" question.', function() {
			expect(testDQuestion.choices).toBeUndefined();
			expect(testFFQuestion.choices).toBeUndefined();
			expect(testCQuestion.choices).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']);
			expect(testMCQuestion.choices).toEqual([
				'Send him home.',
				'Remind him of the honor code.',
				'Let him test.',
				'Take him to a Full Time Staff member.',
				'Ask him to go shave.'
			]);
			expect(testBQuestion.choices).toBeUndefined();
		});
		it('should call the updateData() method.', function() {
			expect(Question.prototype.updateData.callCount).toBe(5);
		});
	});
	describe('updateData() method', function() {
		it('should populate the data property.', function() {
			expect(testDQuestion.data).toEqual({
				Content: 'When will you be available to start working?',
				AnswerType: 'Date'
			});
			expect(testFFQuestion.data).toEqual({
				Content: 'What is your favorite book?',
				AnswerType: 'FreeForm'
			});
			expect(testCQuestion.data).toEqual({
				Content: 'On a scale of one to ten how chipper are you?',
				AnswerType: 'Choice',
				Choices: testCQuestion.choices.toString()
			});
			expect(testMCQuestion.data).toEqual({
				Content: 'Choose all appropriate responses to a beard.',
				AnswerType: 'MultipleChoice',
				Choices: testMCQuestion.choices.toString()
			});
			expect(testBQuestion.data).toEqual({
				Content: 'Will you follow the Testing Center Dress and grooming standards?',
				AnswerType: 'Boolean'
			});
		});
		it('should call the Data.prototype.updateData() method.', function() {
			expect(Data.prototype.updateData.callCount).toBe(5);
		});
	});
	describe('toString() method', function() {
		it('should return "New Question" if there isn\'t an Id defined.', function() {
			testDQuestion.Id = undefined;
			expect(testDQuestion.toString()).toBe('New Question');
		});
		it('should return "<content>" if there is an Id defined.', function() {
			expect(testFFQuestion.toString()).toBe(testFFQuestion.content);
		});
	});
	describe('respond() method', function() {
		it('should call the Response.prototype.add() method.', function() {
			testDQuestion.respond();
			$timeout.flush();
			expect(Response.prototype.add).toHaveBeenCalled();
		});
	});
	describe('query() method', function() {
		it('should call the Data.query() method.', function() {
			Question.query();
			$timeout.flush();
			expect(Data.query).toHaveBeenCalled();
		});
	});
});
