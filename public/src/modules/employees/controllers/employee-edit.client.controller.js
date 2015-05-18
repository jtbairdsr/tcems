/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-04 15:44:43
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-18 10:49:32
 */

'use strict';

angular.module('employees').controller('EmployeeEditController', function(
    $scope, $alert, Employee, Employment, currentUser, currentSemester, employees,
    schedules, subShifts, sentMessages, areas, shiftGroups, tracks, professorService
) {
	$scope.tab = 'profile';
	$scope.userViews = 'src/modules/user/views/';

	var that = this,
        employee = ($scope.emp) ? _.find(employees.list, function(emp) {
	return emp.Id === $scope.emp.id;
        }) : currentUser.data,
        initialPhoneNumber = employee.PhoneNumber;

	$scope.employee = employee;

	that.positions = {
		Employee: [],
		Employment: []
	};
	that.setPositions = function(area, list) {
		list.splice(0, list.length);
		_.each(area.Positions, function(pos) {
			list.push({
				id: pos.Id,
				desc: pos.Description
			});
		});
	};
	that.setPositions(employee.Area, that.positions.Employee);
	that.setPositions(employee.Area, that.positions.Employment);
	that.areas = [];
	_.each(areas.list, function(area) {
		that.areas.push({
			id: area.Id,
			desc: area.Description
		});
	});
	that.tracks = [];
	_.each(tracks.list, function(track) {
		that.tracks.push({
			id: track.Id,
			desc: track.Description
		});
	});
	that.isASub = (_.find(schedules.list, function(schedule) {
		return (
		schedule.EmployeeId === employee.Id &&
		schedule.SemesterId === currentSemester.data.Id &&
		schedule.Active
		);
	}) === undefined);
	that.newEmployee = new Employee({
		PositionId: currentUser.data.Area.DefaultPosition.Id,
		AreaId: currentUser.data.AreaId
	});
	that.newEmployment = new Employment({
		AreaId: employee.AreaId,
		EmployeeId: employee.Id,
		PositionId: employee.PositionId
	});
	that.workedSubShifts = [];
	that.requestedSubShifts = [];
	_.each(subShifts.list, function(subShift) {
		if (subShift.Active &&
		subShift.SemesterId === currentSemester.data.Id) {
			if (subShift.RequesterId === employee.Id) {
				that.requestedSubShifts.push(subShift);
			} else if (subShift.SubstituteId === employee.Id) {
				if (subShift.NewRequestId !== undefined) {
					if (subShift.NewRequestId.SubstituteId === undefined) {
						that.workedSubShifts.push(subShift);
					}
				} else {
					that.workedSubShifts.push(subShift);
				}
			}
		}
	});
	that.unreadMessages = [];
	_.each(sentMessages.list, function(message) {
		if (message.EmployeeId === employee.Id &&
		(message.Message.Mandatory && message.AckDate === undefined) &&
		message.Message.Active &&
		message.Message.SemesterId === currentSemester.data.Id) {
			that.unreadMessages.push({
				Message: message.Message.toString().replace(/\n\r?/g, '<br />'),
				OverDue: (message.Message.DueDate < new Date())
			});
		}
	});
	that.updateArea = function(item) {
		item.Area = _.find(areas.list, function(a) {
			return a.Id === item.AreaId;
		});
		that.setPositions(item.Area, that.positions[item.listName]);
	};
	that.editEmployment = function(employment) {
		if (employment.Edit) {
			employment.update();
			employment.Edit = false;
		} else {
			employment.Edit = true;
		}
	};
	that.addEmployment = function() {
		if (that.newEmployment.Edit && that.newEmployment.StartDate) {
			that.newEmployment.add();
			that.newEmployment = new Employment({
				AreaId: employee.AreaId,
				EmployeeId: employee.Id,
				PositionId: employee.PositionId
			});
		} else if (that.newEmployment.Edit) {
			that.newEmployment = new Employment({
				AreaId: employee.AreaId,
				EmployeeId: employee.Id,
				PositionId: employee.PositionId
			});
		} else {
			that.newEmployment.Edit = true;
		}
	};
	that.addEmployee = function() {
		if (/([a-zA-Z]){3}\d{5}/.test(that.newEmployee.EmailAddress)) {
			that.newEmployee.EmailAddress = that.newEmployee.EmailAddress.split('@')[0];
			that.newEmployee.Picture = '/media/' + that.newEmployee.EmailAddress + '.jpg';
			that.newEmployee.EmailAddress += '@byui.edu';
			if ((that.newEmployee.PhoneNumber = that.newEmployee.PhoneNumber.replace(/\D/g, '')).length === 10) {
				if ((that.newEmployee.INumber = that.newEmployee.INumber.replace(/\D/g, '')).length === 9) {
					that.newEmployee.PreferredName = that.newEmployee.PreferredName || that.newEmployee.FirstName;
					that.newEmployee.add();
				} else {
					$alert({
						show: true,
						placement: 'top-right',
						content: 'Please enter a valid INumber.',
						animation: 'am-fade-and-slide-top',
						duration: '3',
						type: 'danger',
						template: 'src/modules/core/views/alerts/error-alert.client.view.html'
					});
				}
			} else {
				$alert({
					show: true,
					placement: 'top-right',
					content: 'Please enter a valid phone number.',
					animation: 'am-fade-and-slide-top',
					duration: '3',
					type: 'danger',
					template: 'src/modul/core/views/alerts/error-alert.client.view.html'
				});
			}
		} else {
			$alert({
				show: true,
				placement: 'top-right',
				content: 'Please enter a valid BYUI student email address.',
				animation: 'am-fade-and-slide-top',
				duration: '3',
				type: 'danger',
				template: 'src/modul/core/views/alerts/error-alert.client.view.html'
			});
		}
	};
	that.updateEmployee = function() {
		employee.PhoneNumber = (checkPhoneNumber(employee.PhoneNumber)) ? employee.PhoneNumber : initialPhoneNumber;
		employee.update().then(function() {
			$scope.ctrl.refreshContent();
		});
	};
	that.refreshFTI = function() {
		professorService.refresh();
	};

	function checkPhoneNumber(phoneNumber) {
		var phoneNumberArray = phoneNumber.split('-');
		phoneNumber = '';
		for (var i = 0; i < phoneNumberArray.length; i++) {
			phoneNumber += phoneNumberArray[i];
		}
		phoneNumberArray = phoneNumber.split('(');
		phoneNumber = '';
		for (i = 0; i < phoneNumberArray.length; i++) {
			phoneNumber += phoneNumberArray[i];
		}
		phoneNumberArray = phoneNumber.split(')');
		phoneNumber = '';
		for (i = 0; i < phoneNumberArray.length; i++) {
			phoneNumber += phoneNumberArray[i];
		}
		if (phoneNumber.length === 10 || phoneNumber.length === 5) {
			return true;
		} else {
			return false;
		}
	}
});
