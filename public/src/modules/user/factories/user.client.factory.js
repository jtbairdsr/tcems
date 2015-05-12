/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-24 09:28:20
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-11 10:24:32
 */

'use strict';

// User service used for getting the currentUser from the SharePoint database
angular.module('user').factory('User', function(
	$q, $location, dataService, loadEmployeeData, currentUser, Employee, Professor, Position, Area, Track
) {
	// Variables attempt make code more readable
	var $super = Employee;

	// Declare the new Area object
	function User(newData) {
		newData = newData || {};
		$super.call(this, newData);
		this.parent = $super.prototype;

		// Initialize the attributes of the new Employee object
		this.initAttributes();
	}

	// Set the prototype of the new Employee object to match it's parent.
	User.prototype = Object.create($super.prototype);

	// Assign Employee as its own constructor
	User.prototype.constructor = Employee;

	// Override the initAttributes method from parent object
	User.prototype.initAttributes = function() {
		this.parent.initAttributes.apply(this);

		/*******************Values that don't persist******************/
		var positionTest = /FTE|HR/;
		this.hrPrivledges = (this.Position) ? (
			positionTest.test(this.Position.Description) || this.Admin
		) : false;
		this.extendedPrivledges = (this.Position) ? (
			this.hrPrivledges || this.Position.Description === 'Coordinator'
		) : false;
		this.defaultPosition = (this.Area) ? (this.Area.DefaultPosition) : undefined;
		this.data = this.updateData();

		return this;
	};

	User.GET = function() {
		var userInfo,
			deffered = $q.defer();
		Position.query()
			.then(function() {
				$q.all([Area.query(), Track.query()])
					.then(function() {
						dataService.fetchCurrentUser()
							.success(function(data) {
								userInfo = data.d;
								Employee.GET('EmailAddress', userInfo.Email)
									.then(function(data) {
										loadEmployeeData = (data && data.Active);
										if (loadEmployeeData) {
											currentUser.data = new User(data);
											deffered.resolve(currentUser.data);
										} else if (/([a-zA-Z]){3}\d{5}/.test(userInfo.Email)) {
											$location.path('/inactiveEmployee');
											deffered.resolve(currentUser.data);
										} else if (!(/([a-zA-Z]){3}\d{5}/.test(userInfo.Email))) {
											Professor.GET('EmailAddress', userInfo.Email)
												.success(function(data) {
													$location.path('/main/faculty/info');
													if (data.d.results.length > 0) {
														currentUser.data = new Professor(data);
													} else {
														currentUser.data = new Professor({
															EmailAddress: userInfo.Email
														});
													}
												});
											deffered.resolve(currentUser.data);
										} else {
											$location.path('/inactiveEmployee');
											deffered.resolve(currentUser.data);
										}
									});
							});
					});
			});
		return deffered.promise;
	};

	User.prototype.declareIntent = function() {
		// TODO: create the declareIntent method.
		// TODO: add documentation to the declareIntent method.
		// TODO: create the declareIntent method test suite
	};

	User.prototype.add = function() {};

	User.prototype.remove = function() {};

	User.prototype.retire = function() {};

	User.prototype.deactivate = function() {};

	return User;
});
