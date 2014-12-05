/* 
 * @Author: Jonathan Baird
 * @Date:   2014-10-28 15:04:12
 * @Last Modified 2014-11-18
 * @Last Modified time: 2014-11-18 17:07:08
 */
/* global angular, saveAs */
(function() {
	var utilities = angular.module('Utilities');

	utilities.controller('UtilitiesCtrl', ['dataService', '$scope', '$modal', '$http',
		function(dataService, $scope, $modal, $http) {
			var ctrl = this;
			$scope.properties.currentApp = 'Utilities';
			ctrl.moveShiftTimes = function() {
				new dataService.getItems('Shift')
					.top(999999999)
					.execute()
					.success(function(data) {
						var shifts = data.d.results;
						var shiftsCounter = 0;
						var moveTheData = function(shift) {
							var item = {
								'__metadata': {
									type: 'SP.Data.ShiftListItem'
								},
								temp1: shift.StartTime,
								temp2: shift.EndTime,
							};
							dataService.updateItem('Shift', shift.Id, item, '*')
								.success(function() {
									shiftsCounter++;
									if (shiftsCounter < shifts.length) {
										moveTheData(shifts[shiftsCounter]);
									} else {
										window.alert('All of the times have been copied to the temp columns');
									}
								});
						};
						moveTheData(shifts[shiftsCounter]);
					});
			};
			ctrl.fixShiftTimes = function() {
				new dataService.getItems('Shift')
					.top(999999999)
					.execute()
					.success(function(data) {
						var shifts = data.d.results;
						var shiftsCounter = 0;
						var moveTheData = function(shift) {
							var item = {
								'__metadata': {
									type: 'SP.Data.ShiftListItem'
								},
								StartTime: new Date(shift.temp1),
								EndTime: new Date(shift.temp2)
							};
							dataService.updateItem('Shift', shift.Id, item, '*')
								.success(function() {
									shiftsCounter++;
									if (shiftsCounter < shifts.length) {
										moveTheData(shifts[shiftsCounter]);
									} else {
										window.alert('All of the times have been copied to the temp columns');
									}
								});
						};
						moveTheData(shifts[shiftsCounter]);
					});
			};
			ctrl.getPictures = function() {
				new dataService.getItems('Employee')
					.top(999999999)
					.select(['EmailAddress', 'Position/Position'])
					.expand(['Position'])
					.execute(false)
					.success(function(data) {
						window.alert(data.d.results.length);
						var results = data.d.results,
							batFileContents = ['robocopy \\\\joseph\\stupix$ \\\\testcenterems\\C$\\inetpub\\wwwroot\\media '],
							employeeList = [],
							FTEList = [],
							blob,
							i = 0;
						for (i = 0; i < results.length; i++) {
							if (results[i].Position.Position === 'FTE') {
								FTEList.push(results[i].EmailAddress.split('@')[0].toLowerCase() + '.jpg ');
							} else {
								employeeList.push(results[i].EmailAddress.split('@')[0].toLowerCase() + '.jpg ');
							}
						}
						for (i = 0; i < employeeList.length; i++) {
							batFileContents.push(employeeList[i]);
						}
						batFileContents.push('/XC /XN /XO\nrobocopy \\\\joseph\\emppix$ \\\\testcenterems\\C$\\inetpub\\wwwroot\\media ');
						new dataService.getItems('Professor')
							.top(999999999)
							.select(['EmailAddress'])
							.execute(false)
							.success(function(data) {
								results = data.d.results;
								for (var i = 0; i < results.length; i++) {
									FTEList.push(results[i].EmailAddress.split('@')[0].toLowerCase() + '.jpg ');
								}
								for (i = 0; i < FTEList.length; i++) {
									batFileContents.push(FTEList[i]);
								}
								batFileContents.push('/XC /XN /XO\ndel /f "%~f0%"'); //
								blob = new Blob(batFileContents, {
									type: 'text/plain;charset=utf-8'
								});
								saveAs(blob, 'updatePictures.bat');
							});
					});
			};
			ctrl.fixPictureUrls = function() {
				var employeesCounter = 0,
					rawEmployees = [],
					fixEmployee = function(employee) {
						var fixedEmployee = {
							'__metadata': {
								type: 'SP.Data.ProfessorListItem'
							},
							Picture: '/media/' + employee.EmailAddress.split('@')[0].toLowerCase() + '.jpg'
						};
						dataService.updateItem('Professor', employee.Id, fixedEmployee, employee.__metadata.etag)
							.success(function() {
								employeesCounter++;
								fixEmployee(rawEmployees[employeesCounter]);
							});
					};
				new dataService.getItems('Professor')
					.top(999999999)
					.select(['EmailAddress', 'Id'])
					.execute(false)
					.success(function(data) {
						rawEmployees = data.d.results;
						fixEmployee(rawEmployees[employeesCounter]);
					});
			};
			ctrl.migrateProfs = function() {
				window.alert('inside migrateProfs');
				var cms = 'https://cms.byui.edu/academic/TestingCenter/',
					getFacultyInfoArray = function() {
						return $http.get(cms + '_vti_bin/listdata.svc/FacultyTesting');
					};
				getFacultyInfoArray()
					.success(function(data) {
						var facultyInfo = data.d.results,
							stipulation,
							informationDetails,
							professorId,
							facultyInfoCounter = 0,
							addFacultyInfo = function(info) {
								if (facultyInfoCounter === facultyInfo.length) {
									$modal({
										show: true,
										placement: 'center',
										title: 'Notice',
										content: 'The Faculty Testing Info has been migrated!'
									});
								} else {
									new dataService.getItems('Professor')
										.select(['Id', 'EmailAddress'])
										.where(['EmailAddress', 'eq', info.Email])
										.execute(false)
										.success(function(data) {
											professorId = data.d.results[0].Id;
											if (info.StudentsAreToMakeArrangementsWithMePriorToAnyExams) {
												stipulation = 'Talk to the Professor.';
											} else if (info.StudentsWillTakeTheTestBeforeTheyComeOnDutyTheFirstDayTheTestOpens) {
												stipulation = 'Take before it opens.';
											} else {
												stipulation = 'Take before you work.';
											}
											informationDetails = {
												'__metadata': {
													type: 'SP.Data.FacultyTestingInfoListItem'
												},
												ProfessorId: professorId,
												Stipulation: stipulation
											};
											dataService.addItem('FacultyTestingInfo', informationDetails);
											facultyInfoCounter++;
											addFacultyInfo(facultyInfo[facultyInfoCounter]);
										});
								}
							};
						addFacultyInfo(facultyInfo[facultyInfoCounter]);
					});
			};
		}
	]);
	utilities.controller('migratorCtrl', ['$http', '$scope', 'dataService',
		function($http, $scope, dataService) {
			// Declare private attributes
			var ctrl = this,
				cms = 'https://cms.byui.edu/academic/TestingCenter/',
				newEmployeeIndex = 0,
				positions = [],
				areas = [],
				employees = [],
				// facultyInfo = [],
				// Declare private methods
				getEmployeeArray = function() {
					return $http.get(cms + '_vti_bin/listdata.svc/Directory'); // ?$top=50
				},
				addEmployee = function(employee, employment) {
					delete employee.PersonIDId;
					dataService.addItem('Employee', employee)
						.success(function(data) {
							employment.EmployeeId = data.d.Id;
							dataService.addItem('Employment', employment)
								.success(function() {
									newEmployeeIndex++;
									createNewEmployee();
								})
								.error(function(data) {
									$scope.errors.push(data);
								});
						})
						.error(function(data) {
							$scope.errors.push(data);
							if (data.error.code.indexOf('-2130575169') >= 0) {
								newEmployeeIndex++;
								createNewEmployee();
							}
						});
					// }
				},
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
					if (phoneNumber.length === 10 || phoneNumber.length === 5) {
						return phoneNumber;
					} else {
						return 'No Data';
					}
				},
				checkINumber = function(INumber) {
					var INumberArray = INumber.split('-');
					INumber = '';
					for (var i = 0; i < INumberArray.length; i++) {
						INumber += INumberArray[i];
					}
					if (INumber.length === 9) {
						return INumber;
					} else {
						return 'No Data';
					}
				},
				startMigration = function() {
					// reset the newEmployeeIndex to zero.
					newEmployeeIndex = 0;
					createNewEmployee();
				},
				createNewEmployee = function() {
					// Check to see if there are any employees left in the directory to create.
					if (newEmployeeIndex === employees.length) {
						window.alert('Migration Complete!');
					} else {
						// Create an employee object for current item in the Directory and add it to the employee table
						// Declare and initialize variables
						var newEmployee = {},
							newEmployment = {},
							employee = {},
							area = '',
							position = '',
							nextPosition = true,
							nextArea = true,
							pIndex = 0,
							aIndex = 0;
						// assign the current employee object to a variable to reduce the repitition.
						employee = employees[newEmployeeIndex];
						// Create the newEmployee object that will be sent to the Employee table.
						newEmployee = {
							'__metadata': {
								type: 'SP.Data.EmployeeListItem'
							},
							Picture: {
								Url: ''
							},
							FirstName: employee.FirstName,
							PreferredName: employee.PreferredName || employee.FirstName,
							LastName: employee.LastName,
							PhoneNumber: checkPhoneNumber(employee.HomePhone),
							EmailAddress: employee.EMailAddress,
							INumber: checkINumber(employee.I),
							PositionId: '',
							Reader: employee.Reader,
							PersonIDId: '',
							AreaId: '',
							Active: employee.Active,
							Admin: false
						};
						// Create the newEmployment object that will be sent to the Employment table.
						newEmployment = {
							'__metadata': {
								type: 'SP.Data.EmploymentListItem'
							},
							StartDate: new Date(parseInt(employee.HireDate.substr(6))),
							EndDate: (employee.EndDate === null) ? null : new Date(parseInt(employee.EndDate.substr(6))),
							EmployeeId: ''
						};
						// Resolve the position and area
						position = (employee.JobTitle === null) ? 'Proctor' : employee.JobTitle;
						switch (position) {
							case 'Secretary':
							case 'Coordinator':
							case 'Techy':
							case 'Driver':
							case 'HR':
								break;
							case 'Test Center Director':
							case 'Testing Assistant':
							case 'Testing Specialist':
							case 'FTE':
								position = 'FTE';
								break;
							default:
								position = 'Proctor';
						}
						// Add picture Url based on the newly defined position.
						newEmployee.Picture.Url = (position === 'FTE') ? 'https://web.byui.edu/Directory/Employee/' + employee.EMailAddress.split('@')[0] + '.jpg' : 'https://web.byui.edu/Directory/Student/' + employee.EMailAddress.split('@')[0] + '.jpg';
						// Determine the correct area to assign the employee to.
						if (position === 'Techy') {
							area = 'Technology';
						} else {
							area = 'Main';
						}
						// Position
						do {
							if (positions[pIndex].Position === position) {
								newEmployee.PositionId = positions[pIndex].Id;
								nextPosition = false;
							}
							pIndex++;
							if (nextPosition) {
								nextPosition = (pIndex !== positions.length);
							}
						} while (nextPosition);
						if (newEmployee.PositionId === '') {
							var alertData = [];
							for (var i = 0; i < positions.length; i++) {
								alertData.push(positions[i].Position + ':' + positions[i].Id);
							}
							window.alert(position + '\n' + alertData);
						}
						// Area
						do {
							if (areas[aIndex].Area === area) {
								newEmployee.AreaId = areas[aIndex].Id;
								nextArea = false;
							}
							aIndex++;
							if (nextArea) {
								nextArea = (aIndex !== areas.length);
							}
						} while (nextArea);
						addEmployee(newEmployee, newEmployment);
					}
				};
			ctrl = {
				// Declare public attributes
				notReady: {
					positions: true,
					areas: true,
					employees: true,
					facultyInfo: true
				},
				// Declare public methods.
				migrate: function() {

				},
			};

			// initialize the objects public and private attributes.
			new dataService.getItems('Position')
				.execute(true)
				.success(function(data) {
					positions = data.d.results;
					ctrl.notReady.positions = false;
				});
			new dataService.getItems('Area')
				.execute(true)
				.success(function(data) {
					areas = data.d.results;
					ctrl.notReady.areas = false;
				});
			getEmployeeArray()
				.success(function(data) {
					employees = data.d.results;
					ctrl.notReady.employees = false;
				});
			$scope.errors = [];
			$scope.testData = [];
			$scope.test = function() {
				startMigration();
			};

		}
	]);

})();
