/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-13 11:46:50
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-19 11:52:59
 */

'use strict';

describe('applicationService', function() {

	/**************************************************************************
	 *                                  PREP                                  *
	 **************************************************************************/

	var applicationService, $q, $timeout, AApp, APApp, PApp, Question, Response;

	beforeEach(function() {

		module(ApplicationConfiguration.applicationModuleName);

		// Mocks of certain Objects/Values
		module(function($provide) {
			$provide.factory('AApp', function($q) {
				function AApp() {}
				AApp.query = function() {
					var deffered = $q.defer();
					deffered.resolve();
					return deffered.promise;
				};
				return AApp;
			});
			$provide.factory('APApp', function($q) {
				function APApp() {}
				APApp.query = function() {
					var deffered = $q.defer();
					deffered.resolve();
					return deffered.promise;
				};
				return APApp;
			});
			$provide.factory('PApp', function($q) {
				function PApp() {}
				PApp.query = function() {
					var deffered = $q.defer();
					deffered.resolve();
					return deffered.promise;
				};
				return PApp;
			});
			$provide.factory('Question', function($q) {
				function Question() {}
				Question.query = function() {
					var deffered = $q.defer();
					deffered.resolve();
					return deffered.promise;
				};
				return Question;
			});
			$provide.factory('Response', function($q) {
				function Response() {}
				Response.query = function() {
					var deffered = $q.defer();
					deffered.resolve();
					return deffered.promise;
				};
				return Response;
			});
		});

		// Assign injections of needed Services/Values/Objects to local variables
		inject(function($injector) {
			$timeout = $injector.get('$timeout');
			$q = $injector.get('$q');
			applicationService = $injector.get('applicationService');
			AApp = $injector.get('AApp');
			APApp = $injector.get('APApp');
			PApp = $injector.get('PApp');
			Question = $injector.get('Question');
			Response = $injector.get('Response');
		});

		// Create spies
		spyOn(AApp, 'query').andCallThrough();
		spyOn(APApp, 'query').andCallThrough();
		spyOn(PApp, 'query').andCallThrough();
		spyOn(Question, 'query').andCallThrough();
		spyOn(Response, 'query').andCallThrough();
	});
	/**************************************************************************
	 *                                  TESTS                                 *
	 **************************************************************************/

	describe('refresh() method', function() {
		describe('everytime it is called', function() {
			beforeEach(function() {
				applicationService.refresh();
				$timeout.flush();
			});
			it('should call the APApp.query() method.', function() {
				expect(APApp.query).toHaveBeenCalled();
			});
			it('should call the AApp.query() method.', function() {
				expect(AApp.query).toHaveBeenCalled();
			});
			it('should call the PApp.query() method.', function() {
				expect(PApp.query).toHaveBeenCalled();
			});
			it('should call the Question.query() method.', function() {
				expect(Question.query).toHaveBeenCalled();
			});
			it('should call the Response.query() method.', function() {
				expect(Response.query).toHaveBeenCalled();
			});
		});
	});
});

