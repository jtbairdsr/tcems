/*
 * @Author: Jonathan Baird
 * @Date:   2014-10-28 15:04:12
 * @Last Modified 2014-11-18
 * @Last Modified time: 2015-01-29 15:57:45
 */
/* global angular, saveAs */
(function() {
    var utilities = angular.module('Utilities');

    utilities.controller('UtilitiesCtrl', ['dataService', 'generalService', '$q', '$scope', '$alert',
        function(dataService, generalService, $q, $scope, $alert) {
            var ctrl = this;
            var DATA = generalService.data,
                PROPERTIES = generalService.properties,
                CLASSES = dataService.classes;
            $scope.properties.currentApp = 'Utilities';
            ctrl.testScript = function() {
                var employeeCounter = 0;
                var finishedAlert = {
                    show: true,
                    placement: 'top-right',
                    content: 'Finished retiring Employees',
                    animation: 'am-fade-and-slide-top',
                    duration: '3',
                    type: 'success',
                    template: 'partials/alerts/success-alert.html'
                };
                retireEmployee(DATA.employees[employeeCounter]);

                function retireEmployee(employee) {
                        employee.setEmployements();
                        var retire = false;
                        if (!employee.Retired || employee.Active) {
                            retire = true;
                            _.each(employee.Employments, function(employment) {
                                if (employment.EndDate) {
                                    if (employment.EndDate.compareTo(Date.parse('January 1, 2014')) > 0) {
                                        retire = false;
                                    }
                                } else {
                                    retire = false;
                                }
                            });
                        }
                        if (retire) {
                            console.groupCollapsed('%c retireing employees "%s"', "color:orange", employee.toString('name'));
                        } else {
                            console.groupCollapsed('retireing employees "%s"', employee.toString('name'));
                        }
                        _.each(employee.Employments, function(employment) {
                            console.log(((employment.StartDate) ? employment.StartDate.toString('d-MMM-yyyy') : '') + ' ' + ((employment.EndDate) ? employment.EndDate.toString('d-MMM-yyyy') : ''));
                        });
                        console.log(retire);
                        console.groupEnd();
                        if (retire) {
                            employee.retire(true)
                                .then(function() {
                                    if (++employeeCounter < DATA.employees.length) {
                                        retireEmployee(DATA.employees[employeeCounter]);
                                    } else {
                                        $alert(finishedAlert);
                                    }
                                });
                        } else {
                            if (++employeeCounter < DATA.employees.length) {
                                retireEmployee(DATA.employees[employeeCounter]);
                            } else {
                                $alert(finishedAlert);
                            }
                        }
                    }
            };
            ctrl.getPictures = function() {
                // initialize lists
                var batFileContents = ['robocopy \\\\joseph\\stupix$ \\\\testcenterems\\C$\\inetpub\\wwwroot\\media '],
                    FTEList = [];
                // get all employees and add there pictures to the list
                // we have to sort out the FTEs from the student Employees so we set them aside temporarily
                _.each(DATA.employees, function(employee) {
                    if (employee.Position.Position === 'FTE') {
                        FTEList.push(employee.picture);
                    } else {
                        batFileContents.push(employee.picture);
                    }
                });
                // Add a different command to the batchfile
                batFileContents.push('/XC /XN /XO\nrobocopy \\\\joseph\\emppix$ \\\\testcenterems\\C$\\inetpub\\wwwroot\\media ');
                // Add each FTE to the batchfile
                _.each(FTEList, function(FTE) {
                    batFileContents.push(FTE);
                });
                // Add each professor to the batchfile
                _.each(DATA.professors, function(professor) {
                    batFileContents.push(professor.picture);
                });
                // Add the end options and commands to the batchfile
                batFileContents.push('/XC /XN /XO\ndel /f "%~f0%"');
                // Convert the batchfile to a blob then convert the blob to a text file titled updatePictures.bat and save it to the client
                saveAs(new Blob(batFileContents, {
                    type: 'text/plain;charset=utf-8'
                }), 'updatePictures.bat');
            };
        }
    ]);
})();
