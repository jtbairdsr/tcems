/*
 * @Author: Jonathan Baird
 * @Date:   2014-10-28 15:04:12
 * @Last Modified 2014-11-18
 * @Last Modified time: 2015-05-11 14:58:55
 */

'use strict';

angular.module('utilities').controller('UtilitiesController', function(
	$q, $scope, $alert, sentMessages, employees, professors, professorService
) {
	var that = this,
		moduleDirectoryPath = '\\\\testcenterems\\C$\\inetpub\\wwwroot\\public\\src\\modules';
	$scope.currentApp.title = 'Utilities';
	that.test = false;
	that.testScript = function() {
		var sMessageCounter = 0,
			finishedAlert = {
				show: false,
				placement: 'top-right',
				content: 'Finished adding Semester information',
				animation: 'am-fade-and-slide-top',
				duration: '3',
				type: 'success',
				template: 'src/modules/core/views/alerts/success-alert.client.view.html'
			},
			modSentMessages = _.filter(sentMessages.list, function(sMess) {
				return sMess.SemesterId === undefined;
			});

		function addSemesterId(sMessage) {
			console.log(sMessage);
			console.groupCollapsed(sMessage.Employee.toString());
			console.log(sMessage.Employee.Area.Description);
			console.log(sMessage.Employee.Position.Description);
			console.groupEnd();
			sMessage.SemesterId = sMessage.Message.SemesterId;
			sMessage.update(true)
				.then(function() {
					if (++sMessageCounter < modSentMessages.length) {
						addSemesterId(modSentMessages[sMessageCounter]);
					} else {
						$alert(finishedAlert);
					}
				});
		}

		if (modSentMessages.length) {
			addSemesterId(modSentMessages[sMessageCounter]);
		} else {
			console.log(modSentMessages.length);
			$alert(finishedAlert);
		}
	};
	that.getSarasInfo = function() {
		// Initialize lists
		var csvFileContents = [];

		// Get all employees
		_.each(employees.list, function(emp) {
			if (!emp.Retired) {
				csvFileContents.push(
					'tstproctor' + emp.Id + ','
					+ emp.FirstName + ','
					+ emp.LastName + ','
					+ emp.EmailAddress + ','
					+ emp.LastName.toLowerCase() + emp.Id + ','
					+ ((emp.Active) ? 'Yes,' : 'No,')
					+ ',\n'
				);
			}
		});

		// Convert the csvfile to a blob then convert the blob to a text file
		// titled saras-employees.csv and save it to the client
		saveAs(new Blob(csvFileContents, {
			type: 'text/plain;charset=utf-8'
		}), 'saras-employees.csv');
	};
	that.getPictures = function() {
		// Initialize lists
		var batFileContents = [],
			professorCall = professorService.refresh(),
			FTEList = [];

		batFileContents.push(
			'robocopy \\\\joseph\\stupix$ ' + moduleDirectoryPath + '\\employees\\img'
		);

		// Get all employees and add there pictures to the list
		// we have to sort out the FTEs from the student Employees so we set
		// them aside temporarily
		_.each(employees.list, function(employee) {
			if (employee.Position.Position === 'FTE') {
				FTEList.push(employee.Picture.split('src/modules/employees/img/')[1].replace(/\//g, '\\') + ' ');
			} else {
				batFileContents.push(employee.Picture.split('src/modules/employees/img/')[1].replace(/\//g, '\\') + ' ');
			}
		});

		// Add a different command to the batchfile
		batFileContents.push(
			'/XC /XN /XO\nrobocopy \\\\joseph\\emppix$ ' + moduleDirectoryPath + '\\employees\\img'
		);

		// Add each FTE to the batchfile
		_.each(FTEList, function(FTE) {
			batFileContents.push(FTE);
		});

		batFileContents.push(
			'/XC /XN /XO\nrobocopy \\\\joseph\\emppix$ ' + moduleDirectoryPath + '\\professors\\img'
		);

		// Add each professor to the batchfile
		professorCall.then(function() {
			_.each(professors.list, function(professor) {
				if (professor.Picture.indexOf('professors') > 0) {
					batFileContents.push(professor.Picture.split('src/modules/professors/img/')[1].replace(/\//g, '\\') + ' ');
				} else {
					batFileContents.push(professor.Picture.split('src/modules/employees/img/')[1].replace(/\//g, '\\') + ' ');
				}
			});

			// Add the end options and commands to the batchfile
			batFileContents.push('/XC /XN /XO\ndel /f "%~f0%"');

			// Convert the batchfile to a blob then convert the blob to a text file
			// titled updatePictures.bat and save it to the client
			saveAs(new Blob(batFileContents, {
				type: 'text/plain;charset=utf-8'
			}), 'updatePictures.bat');
		});
	};
});
