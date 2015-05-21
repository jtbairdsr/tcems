/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-24 09:28:20
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-20 20:09:49
 */

'use strict';

// User service used for getting the currentUser from the SharePoint database
angular.module('user').factory('User', function(
	$q, $location, dataService, loadEmployeeData, currentUser, Employee,
	Professor, Position, Area, Track, areaPositions
) {
	// Declare the new Area object
	function User(emp) {
		this.emp = emp;

		/*******************Values that don't persist******************/
		var positionTest = /FTE|HR/;
		if (this.emp) {
			this.Id = this.emp.Id || undefined;
			this.Position = this.emp.Position || undefined;
			this.Area = this.emp.Area || undefined;
			this.Admin = this.emp.Admin || false;
			this.Active = this.emp.Active || false;
			this.Picture = this.emp.Picture || undefined;
			this.hrPrivledges = (this.emp.Position) ? (
				positionTest.test(this.emp.Position.Description) || this.emp.Admin
			) : false;
			this.extendedPrivledges = (this.emp.Position) ? (
				this.hrPrivledges || this.emp.Position.Description === 'Coordinator'
			) : false;
			this.defaultPosition = (this.emp.Area) ? (this.emp.Area.DefaultPosition) : undefined;
			this.cSApps = (_.find(areaPositions.list, function(aP) {
				return aP.AreaId === emp.AreaId && aP.PositionId === emp.PositionId && aP.cSApps;
			}) !== undefined);
		}
	}

	// Assign Employee as its own constructor
	User.prototype.constructor = Employee;

	User.GET = function() {
		var userInfo,
			deffered = $q.defer();
		Position.query().then(function() {
			$q.all([Area.query(), Track.query()]).then(function() {
				dataService.fetchCurrentUser().success(function(data) {
					userInfo = data.d;
					Employee.GET('EmailAddress', userInfo.Email).then(function(data) {
						loadEmployeeData = (data && data.Active);
						if (loadEmployeeData) {
							currentUser.data = new User(data);
							if (/inactiveEmployee/.test($location.path())) {
								$location.path('/main/schedule');
							}
							deffered.resolve(currentUser.data, loadEmployeeData);
						} else if (/([a-zA-Z]){3}\d{5}/.test(userInfo.Email)) {
							if (!data || data.Position.Description === 'Applicant') {
								if (data) {
									currentUser.data = new User(data);
								}
								$location.path('/main/application');
							} else {
								currentUser.data = new User(data);
								$location.path('/main/inactiveEmployee');
							}
							deffered.resolve(currentUser.data, loadEmployeeData);
						} else if (!(/([a-zA-Z]){3}\d{5}/.test(userInfo.Email))) {
							Professor.GET('EmailAddress', userInfo.Email).success(function(data) {
								$location.path('/main/faculty/info');
								if (data.d.results.length > 0) {
									currentUser.data = new Professor(data);
								} else {
									currentUser.data = new Professor({
										EmailAddress: userInfo.Email
									});
								}
							});
							deffered.resolve(currentUser.data, loadEmployeeData);
						} else {
							$location.path('/inactiveEmployee');
							deffered.resolve(currentUser.data, loadEmployeeData);
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
	return User;
});

