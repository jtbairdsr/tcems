/* 
 * @Author: Jonathan Baird
 * @Date:   2014-10-28 15:04:11
 * @Last Modified 2014-11-18
 * @Last Modified time: 2014-11-18 17:03:10
 */
(function() {
	var directory = angular.module('Directory');

	directory.controller('DirectoryCtrl', ['$scope', '$modal', 'dataService',
		function($scope, $modal, dataService) {
			$scope.properties.currentApp = 'Directory';
			$scope.properties.predicate = 'PreferredName';
			var ctrl = this;
			ctrl.refreshContent = function() {
				new dataService.getItems('Employee')
					.top(999999999)
					.select(['Id', 'Picture', 'FirstName', 'PreferredName', 'LastName', 'PhoneNumber', 'EmailAddress', 'INumber', 'Position/Position', 'Position/Id', 'Reader', 'Area/Area', 'Area/Id', 'Team/Id', 'Track/Description', 'Track/Id', 'Active'])
					.expand(['Position', 'Area', 'Team', 'Track'])
					.execute(false)
					.success(function(data) {
						$scope.arrays.directoryEmployees = data.d.results;
					});
			};
			$scope.$on('Refresh Content', function() {
				ctrl.refreshContent();
			});

		}
	]);
	directory.controller('EmployeeEdit', ['$scope', '$modal', 'dataService',
		function($scope, $modal, dataService) {
			var ctrl = this,
				employee = $scope.employee || $scope.properties.currentUser.employeeInfo,
				checkPhoneNumber = function(phoneNumber) {
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
				};
			$scope.updatedEmployee = {
				'__metadata': {
					type: 'SP.Data.EmployeeListItem'
				},
				PreferredName: employee.PreferredName,
				LastName: employee.LastName,
				PhoneNumber: employee.PhoneNumber,
				PositionId: employee.Position.Id,
				Reader: employee.Reader,
				AreaId: employee.Area.Id,
				Active: employee.Active,
				TrackId: employee.Track.Id
			};
			ctrl.newEmployee = {
				'__metadata': {
					type: 'SP.Data.EmployeeListItem'
				},
				FirstName: '',
				PreferredName: '',
				LastName: '',
				PhoneNumber: '',
				EmailAddress: '',
				INumber: '',
				PositionId: '',
				Reader: false,
				AreaId: '',
				Active: true,
				Admin: false,
				Picture: ''
			};
			ctrl.addEmployee = function() {
				var newEmployment = {
					'__metadata': {
						type: 'SP.Data.EmploymentListItem'
					},
					StartDate: Date.today()
						.toISOString(),
					EmployeeId: ''
				};
				if (/([a-zA-Z]){3}\d{5}/.test(ctrl.newEmployee.EmailAddress)) {
					ctrl.newEmployee.Picture = '/media/' + ctrl.newEmployee.EmailAddress + '.jpg';
					ctrl.newEmployee.EmailAddress += '@byui.edu';
					ctrl.newEmployee.PhoneNumber = ctrl.newEmployee.PhoneNumber.replace(/\D/g, '');
					if (ctrl.newEmployee.PhoneNumber.length === 10) {
						ctrl.newEmployee.INumber = ctrl.newEmployee.INumber.replace(/\D/g, '');
						if (ctrl.newEmployee.INumber.length === 9) {
							ctrl.newEmployee.PreferredName = (ctrl.newEmployee.PreferredName.length === 0) ? ctrl.newEmployee.FirstName : ctrl.newEmployee.PreferredName;
							dataService.addItem('Employee', ctrl.newEmployee)
								.success(function(data) {
									newEmployment.EmployeeId = data.d.Id;
									dataService.addItem('Employment', newEmployment)
										.success(function(data) {
											$modal({
												show: true,
												placement: 'center',
												title: 'Notice',
												content: ctrl.newEmployee.PreferredName + ' ' + ctrl.newEmployee.LastName + ' has been added!'
											});
											$scope.$emit('Refresh Content');
										});
								});
						} else {
							$modal({
								show: true,
								placement: 'center',
								title: 'Notice',
								content: 'Please enter a valid INumber.'
							});
						}
					} else {
						$modal({
							show: true,
							placement: 'center',
							title: 'Notice',
							content: 'Please enter a valid phone number.'
						});
					}
				} else {
					$modal({
						show: true,
						placement: 'center',
						title: 'Notice',
						content: 'Please enter a valid BYUI student email address.'
					});
				}
			};
			ctrl.updateEmployee = function() {
				var createNewEmployment = function() {
					var employment = {
						'__metadata': {
							type: 'SP.Data.EmploymentListItem'
						},
						StartDate: Date.today()
							.toISOString(),
						EmployeeId: employee.Id
					};
					dataService.addItem('Employment', employment);
				};
				if ($scope.updatedEmployee.Active !== employee.active) {
					if ($scope.updatedEmployee.Active) {
						// alert('add new employment record');
						createNewEmployment();
					} else {
						new dataService.getItems('Employment')
							.select(['Id', 'StartDate', 'EndDate', 'Employee/Id'])
							.expand(['Employee'])
							.where(['Employee/Id', 'eq', employee.Id])
							.execute(false)
							.success(function(data) {
								var employment = {};
								for (var i = 0; i < data.d.results.length; i++) {
									if (data.d.results[i].EndDate === null) {
										employment = data.d.results[i];
									}
								}
								employment.EndDate = Date.today()
									.toISOString();
								delete employment.__metadata.etag;
								delete employment.__metadata.id;
								delete employment.__metadata.uri;
								// delete employment.Id;
								delete employment.StartDate;
								delete employment.Employee;
								dataService.updateItem('Employment', employment.Id, employment, employment.__metadata.etag)
									.success(function(data) {});
							});
					}
				}
				$scope.updatedEmployee.PhoneNumber = (checkPhoneNumber($scope.updatedEmployee.PhoneNumber)) ? $scope.updatedEmployee.PhoneNumber : employee.PhoneNumber;
				dataService.updateItem('Employee', employee.Id, $scope.updatedEmployee, employee.__metadata.etag)
					.success(function(data) {
						$modal({
							show: true,
							placement: 'center',
							title: 'Notice',
							content: employee.FirstName + ' ' + employee.LastName + '\'s file has been updated!'
						});
						$scope.$emit('Refresh Content');
					});
			};
			ctrl.tab = 1;
		}
	]);
})();
