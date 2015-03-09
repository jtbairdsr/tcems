/*
 * @Author: Jonathan Baird
 * @Date:   2014-10-28 15:04:12
 * @Last Modified 2014-11-18
 * @Last Modified time: 2015-02-06 10:43:38
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
                var employmentsCounter = 0;
                var finishedAlert = {
                    show: true,
                    placement: 'top-right',
                    content: 'Finished adding Position and Area information',
                    animation: 'am-fade-and-slide-top',
                    duration: '3',
                    type: 'success',
                    template: 'partials/alerts/success-alert.html'
                };
                addPositionAndArea(DATA.employments[employmentsCounter]);

                function addPositionAndArea(employment) {
                    console.groupCollapsed(employment.Employee.toString());
                    console.log(employment.Employee.Area.Description);
                    console.log(employment.Employee.Position.Description);
                    console.groupEnd();
                    if (employment.AreaId === undefined || employment.PositionId === undefined) {
                        employment.AreaId = employment.Employee.AreaId;
                        employment.PositionId = employment.Employee.PositionId;
                        employment.update(true)
                            .then(function() {
                                if (++employmentsCounter < DATA.employments.length) {
                                    addPositionAndArea(DATA.employments[employmentsCounter]);
                                } else {
                                    $alert(finishedAlert);
                                }
                            });
                    } else {
                        if (++employmentsCounter < DATA.employments.length) {
                            addPositionAndArea(DATA.employments[employmentsCounter]);
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
                        FTEList.push(employee.Picture.split('media/')[1].replace(/\//g, '\\') + ' ');
                    } else {
                        batFileContents.push(employee.Picture.split('media/')[1].replace(/\//g, '\\') + ' ');
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
                    batFileContents.push(professor.Picture.split('media/')[1].replace(/\//g, '\\') + ' ');
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
