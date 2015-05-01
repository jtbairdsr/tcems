/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-29 08:59:05
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-01 13:47:30
 */

'use strict';

angular.module('employees').factory('Employee', function(
	$q, Person, Employment, employees, currentSemester, areas,
	availabilities, employments, intents, positions, schedules,
	subShifts, teams, tracks, currentUser
) {

	// Variables attempt make code more readable
	var $super = Person,
		listName = 'Employee',
		list = employees.list;

	// Declare the new Area object
	function Employee() {
		var newData = arguments[0] || {};
		$super.call(this, newData, list, listName);
		this.parent = $super.prototype;

		// Initialize the attributes of the new Employee object
		this.initAttributes();
	}

	// Set the prototype of the new Employee object to match it's parent.
	Employee.prototype = Object.create($super.prototype);

	// Assign Employee as its own constructor
	Employee.prototype.constructor = Employee;

	/**************************************************************************
	 *                             INSTANCE METHODS                           *
	 **************************************************************************/

	// Override the initAttributes method from parent object
	Employee.prototype.initAttributes = function() {
		var object = this;
		$super.prototype.initAttributes.apply(this);

		/*********************Values stored on DB**********************/
		this.Active = this.newData.Active || false;
		this.Admin = this.newData.Admin || false;
		this.AreaId = this.newData.AreaId || undefined;
		this.INumber = this.newData.INumber || undefined;
		this.PositionId = this.newData.PositionId || undefined;
		this.Reader = this.newData.Reader || false;
		this.Retired = this.newData.Retired || false;
		this.TeamId = this.newData.TeamId || undefined;
		this.TrackId = this.newData.TrackId || undefined;

		/****************Values derived from other tables**************/
		this.Area = (this.newData.AreaId) ? _.find(areas.list, function(area) {
			return area.Id === object.AreaId;
		}) : undefined;
		this.Position = (this.newData.PositionId) ? _.find(positions.list, function(position) {
			return position.Id === object.PositionId;
		}) : undefined;
		this.Team = (this.newData.TeamId) ? _.find(teams.list, function(team) {
			return team.Id === object.TeamId;
		}) : undefined;
		this.Track = (this.newData.TrackId) ? _.find(tracks.list, function(track) {
			return track.Id === object.TrackId;
		}) : undefined;
		this.Employments = [];
		this.Intent = undefined;

		/*******************Values that don't persist******************/
		this.Label = (this.Position) ? (
			'<div><img class="img-circle" src="' + this.Picture + '" fallback-src="media/missing.png" width="50px" height="' + ((this.Position.Description === 'FTE') ? 70.8333 : 50) + 'px"> <b>' + this.PreferredName + ' ' + this.LastName + '</b></div>'
		) : (
			'<div><img class="img-circle" src="' + this.Picture + '" fallback-src="media/missing.png"> <b>New Employee</b></div>'
		);
		this.data = this.updateData();

		return this;
	};

	// Override the updateData method from parent object
	Employee.prototype.updateData = function() {
		var returnData = $super.prototype.updateData.apply(this);
		returnData.Active = this.Active;
		returnData.Admin = this.Admin;
		returnData.AreaId = this.AreaId;
		returnData.INumber = this.INumber;
		returnData.PositionId = this.PositionId;
		returnData.Reader = this.Reader;
		returnData.Retired = this.Retired;
		returnData.TrackId = this.TrackId;
		return returnData;
	};

	/**
	 * Override the toString method from parent object
	 *
	 * @param      {String}    flag    a string to determine how to represent
	 *                                     the employee
	 * @returns    {String}            a string representation of the employee
	 */
	Employee.prototype.toString = function(flag) {
		flag = flag || 'name';
		var person = $super.prototype.toString.apply(this),
			returnItem;
		switch (flag) {
			case 'name':
				returnItem = person;
				break;
			case 'position':
				returnItem = this.Position.Description + ': ' + person;
				break;
		}
		return returnItem;
	};

	/**
	 * Override the add method from parent object
	 * Adds a new Employee to the db and activates it
	 *
	 * @param      {Boolean}    hideAlert    true will hide compleation alert
	 * @returns    {Promise}                 will be resolved when all  the
	 *                                           data is saved to the db
	 */
	Employee.prototype.add = function(hideAlert) {
		hideAlert = hideAlert || false;
		var object = this,
			deffered = $q.defer();
		$super.prototype.add.call(this, hideAlert)
			.then(function() {
				object.activate(true)
					.then(function() {
						deffered.resolve();
					});
			});

		return deffered.promise;
	};

	/**
	 * Creates an employment record and activates the employee
	 *
	 * @param      {Boolean}    hideAlert    true will hide compleation alert
	 * @returns    {Promise}                 will be resolved when all the
	 *                                           data is saved to the db
	 */
	Employee.prototype.activate = function(hideAlert) {
		hideAlert = hideAlert || false;
		var deffered = $q.defer(),
			that = this,
			employment = new Employment({
				AreaId: this.AreaId,
				EmployeeId: this.Id,
				PositionId: this.PositionId
			});
		employment.start(true)
			.then(function() {
				that.Active = true;
				that.update(hideAlert)
					.then(function() {
						deffered.resolve();
					});
			});
		return deffered.promise;
	};

	/**
	 * Deactivates the employee as well as all related availabilities,
	 * schedules, subshifts, and employments.
	 *
	 * @param      {Boolean}    hideAlert    true will hide compleation alert
	 * @returns    {Promise}                 will be resolved when all the
	 *                                           data is saved to the db
	 */
	Employee.prototype.deactivate = function(hideAlert) {
		hideAlert = hideAlert || false;
		var object = this,
			deffered = $q.defer();
		_.each(availabilities.list, function(availability) {
			if (availability.EmployeeId === object.Id &&
				availability.SemesterId === currentSemester.Id &&
				availability.Active) {
				availability.deactivate(true);
			}
		});
		_.each(schedules.list, function(schedule) {
			if (schedule.EmployeeId === object.Id &&
				schedule.SemesterId === currentSemester.Id &&
				schedule.Active) {
				schedule.deactivate(true);
			}
		});
		_.each(subShifts.list, function(subShift) {
			if (subShift.RequesterId === object.Id &&
				subShift.SemesterId === currentSemester.Id &&
				subShift.Active) {
				subShift.deactivate(true);
			} else if (subShift.SubstituteId === object.Id &&
				subShift.SemesterId === currentSemester.Id &&
				subShift.NewRequestId === undefined &&
				subShift.Active) {
				subShift.newRequest(true);
			}
		});

		_.each(this.Employments, function(employment) {
			if (employment.EndDate === undefined) {
				employment.end(true);
			}
		});
		this.Active = false;
		this.update(hideAlert).then(function() {
			deffered.resolve();
		});
		return deffered.promise;
	};

	/**
	 * Retires the employee
	 *
	 * @param      {Boolean}    hideAlert    true will hide compleation alert
	 * @returns    {Promise}                 will be resolved when all the
	 *                                           data is saved to the db
	 */
	Employee.prototype.retire = function(hideAlert) {
		hideAlert = hideAlert || false;
		var deffered = $q.defer(),
			object = this;
		this.deactivate(true).then(function() {
			object.Retired = true;
			object.update(hideAlert).then(function() {
				deffered.resolve();
			});
		});
		return deffered.promise;
	};

	// Create the setEmployments method
	Employee.prototype.setEmployments = function() {
		var object = this;
		_.each(employments.list, function(employment) {
			if (employment.EmployeeId === object.Id) {
				object.Employments.push(employment);
			}
		});
	};

	Employee.prototype.setIntent = function() {
		// TODO: create the setIntent method.
		// TODO: add documentation to the setIntent method.
		// TODO: create the setIntent method test suite
		// var object = this;
		// this.Intent = _.find(intents, function(intent) {
		// 	return intent.EmployeeId === object.Id;
		// });
	};

	/**************************************************************************
	 *                              CLASS METHODS                             *
	 **************************************************************************/

	Employee.GET = function(attribute, value) {
		var deffered = $q.defer();
		$super.GET.call(this, listName, attribute, value)
			.then(function(data) {
				deffered.resolve(new Employee(data));
			});
		return deffered.promise;
	};

	Employee.query = function() {
		var object = this;
		$super.query.apply(this)
			.then(function(data) {
				list.splice(0, list.length);
				_.each(data, function(employee) {
					object.list.push(new Employee(employee));
				});
			});

		// TODO: create the setIntent method test suite
	};

	/**
	 * Query all active employees from the db
	 *
	 * @returns    {[Employee]}    an array of active Employees
	 */
	Employee.queryActive = function() {
		var returnArray = [],
			filter = ['Active', 'eq', 1];
		$super.queryFilter.call(this, filter)
			.then(function(data) {
				_.each(data, function(employee) {
					returnArray.push(new Employee(employee));
				});
			});
		return returnArray;

		// TODO: create the setIntent method test suite
	};

	/**
	 * Query all inactive employees from the db
	 *
	 * @returns    {[Employee]}    an array of inactive Employees
	 */
	Employee.queryInactive = function() {
		var returnArray = [],
			filter = ['Active', 'eq', 0];
		$super.queryFilter.call(this, filter)
			.then(function(data) {
				_.each(data, function(employee) {
					returnArray.push(new Employee(employee));
				});
			});
		return returnArray;

		// TODO: create the setIntent method test suite
	};

	/**
	 * Query all retired employees from the db
	 *
	 * @returns    {[Employee]}    an array of retired Employees
	 */
	Employee.queryRetired = function() {
		var returnArray = [],
			filter = ['Retired', 'eq', 1];
		$super.queryFilter.call(this, filter)
			.then(function(data) {
				_.each(data, function(employee) {
					returnArray.push(new Employee(employee));
				});
			});
		return returnArray;

		// TODO: create the setIntent method test suite
	};

	/**
	 * Query all employees of a position from the db
	 *
	 * @param      {int}           position    the id of a position
	 * @returns    {[Employee]}                an array of Employees
	 */
	Employee.queryByPosition = function(position) {
		position = position || currentUser.Position.Id;
		var filter, expand,
			returnArray = [];
		if (typeof position === 'number') {
			filter = ['Position/Id', 'eq', position];
			expand = ['Position'];
			$super.queryFilter.call(this, filter, expand)
				.then(function(data) {
					_.each(data, function(employee) {
						returnArray.push(new Employee(employee));
					});
				});
		}
		return returnArray;

		// TODO: create the setIntent method test suite
	};

	// Return the newly defined Employee object
	return Employee;
});
