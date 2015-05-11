/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-02 13:49:40
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-02 13:58:10
 */

'use strict';

/* jasmine specs for the day factory */
describe('Day object', function() {
	var dataService, Data, Day, $httpBackend, positions, dateService;

	beforeEach(module(ApplicationConfiguration.applicationModuleName));

	// mock the dataService until I have it properly defined.
	beforeEach(module(function($provide) {
		// $provide.value('currentUser', {data: {}});
		$provide.value('schedules', []);
		$provide.value('subShifts', []);
		$provide.value('availabilities', []);
		$provide.value('currentSemester', {
			data: {
				Id: 1,
				FirstDay: new Date()
			}
		});
	}));

	// setup for the execution of each test
	beforeEach(function() {
		var thisPrep = this;

		// assign local variable to injections of services.
		inject(function($injector) {
			Data = $injector.get('Data');
			Day = $injector.get('Day');
			dataService = $injector.get('dataService');
			$httpBackend = $injector.get('$httpBackend');
			positions = $injector.get('positions');
			dateService = $injector.get('dateService');
		});

		// $httpBackend Config
		$httpBackend.whenGET('https://inet.byui.edu/sites/TestingServices/_api/lists/getbytitle(\'Day\')/items(\'2\')')
			.respond({
				d: {}
			});
		$httpBackend.whenPOST('https://inet.byui.edu/sites/TestingServices/_api/contextinfo').respond({
			d: {
				GetContextWebInformation: {
					FormDigestTimeoutSeconds: 30,
					FormDigestValue: ''
				}
			}
		});
		$httpBackend.whenPOST('https://inet.byui.edu/sites/TestingServices/_api/lists/getbytitle(\'Day\')/items(2)').respond(
			[]);
		$httpBackend.whenPOST('https://inet.byui.edu/sites/TestingServices/_api/lists/getbytitle(\'Day\')/items').respond({
			d: {}
		});
		$httpBackend.flush();

		this.testObject = new Day(new Date('2015-01-28T16:09:58Z'));

		// Spies
		spyOn(dataService, 'addItem').andCallThrough();
		spyOn(dataService, 'updateItem').andCallThrough();
		spyOn(dataService, 'fetchItem').andCallThrough();
		spyOn(dataService, 'deleteItem').andCallThrough();
	});

	// verify that we have cleaned up all of our $httpBackend usage.
	afterEach(function() {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	})

	it('should be able to be instantiated', function() {
		expect(this.testObject).toBeDefined();
	});
	describe('"toString" method', function() {
		it('should call the "dataService.addItem()" method.', function() {
			expect(this.testObject.toString()).toEqual('Wednesday the 28th of January');
		});
	});

	// TODO: Finish writing the tests for the various methods of this object.
});
