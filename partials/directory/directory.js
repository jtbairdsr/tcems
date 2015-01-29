/*
 * @Author: Jonathan Baird
 * @Date:   2014-10-28 15:04:11
 * @Last Modified 2014-11-18
 * @Last Modified time: 2015-01-28 13:56:37
 */
(function() {
	var directory = angular.module('Directory');

	directory.controller('DirectoryCtrl', ['$scope', '$log', '$modal', 'dataService', 'generalService',
		function($scope, $log, $modal, dataService, generalService) {
			$scope.$log = $log;
			$scope.properties.currentApp = 'Directory';
			$scope.properties.predicate = 'PreferredName';
			var REFRESH = dataService.refresh,
				DATA = generalService.data,
				PROPERTIES = generalService.properties;

			$scope.area = {
				Id: PROPERTIES.currentUser.Area.Id,
				hideOthers: true
			};
			$scope.position = {
				Id: _.find(DATA.positions, function(position) {
					return position.Description === 'FTE';
				}).Id,
				hide: true
			};
			$scope.hideInactive = true;
			var ctrl = this;
			ctrl.refreshContent = function() {
				REFRESH.directory();
			};
		}
	]);

	directory.controller('EmployeeEdit', ['$scope', '$alert', 'dataService', 'generalService', '$timeout',
		function($scope, $alert, dataService, generalService, $timeout) {
			$scope.tab = 'profile';

			var CLASSES = dataService.classes,
				PROPERTIES = generalService.properties;
			var ctrl = this,
				employee = $scope.employee || PROPERTIES.currentUser,
				initialPhoneNumber = employee.PhoneNumber;

			ctrl.newEmployee = new CLASSES.Employee({
				PositionId: PROPERTIES.defaultPosition.Id,
				AreaId: PROPERTIES.currentUser.AreaId
			});
			ctrl.newEmployment = new CLASSES.Employment({
				EmployeeId: employee.Id
			});

			ctrl.editEmployment = function(employment) {
				if (employment.Edit) {
					employment.update();
					employment.Edit = false;
				} else {
					employment.Edit = true;
				}
			};
			ctrl.addEmployment = function() {
				if (ctrl.newEmployment.Edit && ctrl.newEmployment.StartDate) {
					ctrl.newEmployment.add();
					ctrl.newEmployment = new CLASSES.Employment({
						EmployeeId: employee.Id
					});
				} else if (ctrl.newEmployment.Edit) {
					ctrl.newEmployment = new CLASSES.Employment();
				} else {
					ctrl.newEmployment.Edit = true;
				}
			};
			ctrl.addEmployee = function() {
				if (/([a-zA-Z]){3}\d{5}/.test(ctrl.newEmployee.EmailAddress)) {
					ctrl.newEmployee.Picture = '/media/' + ctrl.newEmployee.EmailAddress + '.jpg';
					ctrl.newEmployee.EmailAddress += '@byui.edu';
					if ((ctrl.newEmployee.PhoneNumber = ctrl.newEmployee.PhoneNumber.replace(/\D/g, '')).length === 10) {
						if ((ctrl.newEmployee.INumber = ctrl.newEmployee.INumber.replace(/\D/g, '')).length === 9) {
							ctrl.newEmployee.PreferredName = ctrl.newEmployee.PreferredName || ctrl.newEmployee.FirstName;
							ctrl.newEmployee.add();
						} else {
							$alert({
								show: true,
								placement: 'top-right',
								content: 'Please enter a valid INumber.',
								animation: 'am-fade-and-slide-top',
								duration: '3',
								type: 'danger',
								template: 'partials/alerts/error-alert.html'
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
							template: 'partials/alerts/error-alert.html'
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
						template: 'partials/alerts/error-alert.html'
					});
				}
			};
			ctrl.updateEmployee = function() {
				employee.PhoneNumber = (checkPhoneNumber(employee.PhoneNumber)) ? employee.PhoneNumber : initialPhoneNumber;
				employee.update();
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
				if (phoneNumber.length == 10 || phoneNumber.length == 5) {
					return true;
				} else {
					return false;
				}
			}
		}
	]);
	directory.filter('employeeFilter', ['generalService',
		function(generalService) {
			var DATA = generalService.data,
				PROPERTIES = generalService.properties;
			var positionFTE = _.find(DATA.positions, function(position) {
				return position.Description === 'FTE';
			});
			return function(employees, params) {
				params.inactive = params.inactive || false;
				params.area = (PROPERTIES.currentUser.Area.Description === 'Director') ? false : params.area || false;
				params.position = params.position || false;
				if (params.inactive) {
					employees = _.filter(employees, function(employee) {
						return employee.Active;
					});
				}
				if (params.area) {
					employees = _.filter(employees, function(employee) {
						return employee.Area.Id === PROPERTIES.currentUser.Area.Id;
					});
				}
				if (params.position) {
					employees = _.filter(employees, function(employee) {
						return employee.Position.Id !== positionFTE.Id;
					});
				}
				return employees;
			};
		}
	]);
})();
