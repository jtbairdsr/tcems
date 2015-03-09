/* global angular, _ */

(function() {
	'use strict';

	angular.module('App')
	.factory('Employee', ['$q', '$alert', 'generalService', 'dataService', 'Person', 'Employment',
		function($q, $alert, generalService, dataService, Person, Employment) {
			var DATA       = generalService.data,
				PROPERTIES = generalService.properties;
			function Employee(){//{{{
				var $super = Person,
					listname = 'Employee';
				this.parent = $super.prototype;
				$super.call(this, arguments, listname);
			}//}}}
			Employee.prototype = Object.create(Employee.parent);
			Employee.prototype.constructor = Employee;
			Employee.prototype.initPublicAttributes = function() {//{{{
				var employee = this;
				this.parent.initPublicAttributes.apply(this);
				//********************Values stored on DB********************\\//{{{
				this.Active = this.newData.Active || false;
				this.Admin = this.newData.Admin || false;
				this.AreaId = this.newData.AreaId || undefined;
				this.INumber = this.newData.INumber || undefined;
				this.PositionId = this.newData.PositionId || undefined;
				this.Reader = this.newData.Reader || false;
				this.Retired = this.newData.Retired || false;
				this.TeamId = this.newData.TeamId || undefined;
				this.TrackId = this.newData.TrackId || undefined;//}}}
				//**********Values derived from other tables/employees*********\\//{{{
				this.Area = (this.newData.AreaId) ? _.find(DATA.areas, function(area) {
					return area.Id === employee.AreaId;
				}) : {};
				this.Position = (this.newData.PositionId) ? _.find(DATA.positions, function(position) {
					return position.Id === employee.PositionId;
				}) : {};
				this.Team = (this.newData.TeamId) ? _.find(DATA.teams, function(team) {
					return team.Id === employee.TeamId;
				}) : {};
				this.Track = (this.newData.TrackId) ? _.find(DATA.tracks, function(track) {
					return track.Id === employee.TrackId;
				}) : {};
				this.Employments = [];//}}}
				//*****************Values will be calculated*****************\\//{{{
				this.ExtendedPrivledges = (
					this.Position.Position === 'FTE' ||
					this.Position.Position === 'HR' ||
					this.Admin
				);
				this.Intent = {};
				this.Label = (
					'<div><img class="img-circle" src="' + this.Picture +
					'" fallback-src="media/missing.png" width="50px" height="' + ((this.Position.Description === 'FTE') ? 70.8333 : 50) + 'px"> <b>' +
					this.PreferredName + ' ' + this.LastName + '</b></div>'
				);//}}}
				this.data = this.updateData();
			};//}}}
			Employee.prototype.updateData = function() {//{{{
				var returnData = this.parent.updateData.apply(this);
				returnData.Active = this.Active;
				returnData.Admin = this.Admin;
				returnData.AreaId = this.AreaId;
				returnData.INumber = this.INumber;
				returnData.PositionId = this.PositionId;
				returnData.Reader = this.Reader;
				returnData.Retired = this.Retired;
				// returnData.TeamId = this.TeamId;
				returnData.TrackId = this.TrackId;
				return returnData;
			};//}}}
			Employee.prototype.toString = function() {//{{{
				var person = this.parent.toString.apply(this),
					flag   = arguments[0] || 'name', returnItem;
				switch (flag) {
					case 'name':
						returnItem = person;
					break;
					case 'position':
						returnItem = this.Position.Description + ': ' + person;
					break;
				}
				return returnItem;
			};//}}}
			Employee.prototype.add = function() {//{{{//{{{//}}}
				var employee = this;
				this.parent.add.apply(this).then(function() {
					employee.activate();
				});
			};//}}}
			Employee.prototype.activate = function() {//{{{
				var employment = new Employment({
					AreaId: this.AreaId,
					EmployeeId: this.Id,
					PositionId: this.PositionId
				});
				employment.start(true);
				this.Active = true;
				this.update();
			};//}}}
			Employee.prototype.deactivate = function() {//{{{
				var employee = this,
					deffered = $q.defer();
				hideAlert    = arguments[0] || false;
				_.each(DATA.availabilitys, function(availability) {//{{{
					if (availability.EmployeeId === employee.Id &&
						availability.SemesterId === PROPERTIES.currentSemester.Id &&
						availability.Active) {
						availability.deactivate(true);
					}
				});//}}}
				_.each(DATA.schedules, function(schedule) {//{{{
					if (schedule.EmployeeId === employee.Id &&
						schedule.SemesterId === PROPERTIES.currentSemester.Id &&
						schedule.Active) {
						schedule.deactivate(true);
					}
				});//}}}
				_.each(DATA.subShifts, function(subShift) {//{{{
					if (subShift.RequesterId === employee.Id &&
						subShift.SemesterId  === PROPERTIES.currentSemester.Id &&
						subShift.Active) {
						subShift.deactivate(true);
					} else if ( subShift.SubstituteId === employee.Id &&
								subShift.SemesterId   === PROPERTIES.currentSemester.Id &&
								subShift.Active ) {
						if (subShift.NewRequestId) {
							subShift.NewRequest.deactivate(true);
						}
						subShift.newRequest(true);
					}
				});//}}}
				_.each(DATA.employments, function(employment) {//{{{
					if (employment.EndDate    === undefined &&
						employment.EmployeeId === employee.Id) {
						employment.end(true);
					}
				});//}}}
				this.Active = false;
				this.update().then(function () {
					deffered.resolve();
				});
				return deffered.promise;
			};//}}}
			Employee.prototype.retire = function() {//{{{
				var deffered = $q.defer();
				var employee = this;
				_.each(DATA.employments, function(employment) {//{{{
					if (employment.EndDate    === undefined &&
						employment.EmployeeId === employee.Id) {
						employment.end(true);
					}
				});//}}}
				this.Active = false;
				this.Retired = true;
				this.update().then(function() {
					deffered.resolve();
				});
				return deffered.promise;
			};//}}}
			Employee.prototype.setEmployments = function() {//{{{
				var employee = this;
				this.Employments = _.filter(DATA.employments, function(employment) {
					return employment.EmployeeId === employee.Id;
				});
			};//}}}
			Employee.prototype.setIntent = function() {//{{{
				var employee = this;
				this.Intent = _.find(DATA.intents, function(intent) {
					return intent.EmployeeId === employee.Id;
				});
			};//}}}
			Employee.prototype.declareIntent = function() {};
			return Employee;
		}
	]);
})();

// vim:foldmethod=marker:foldlevel=0
