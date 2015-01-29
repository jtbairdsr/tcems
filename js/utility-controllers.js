/*
 * @Author: Jonathan Baird
 * @Date:   2014-10-28 15:04:12
 * @Last Modified 2014-11-18
 * @Last Modified time: 2015-01-28 22:06:15
 */
/* global angular, saveAs */
(function() {
    var utilities = angular.module('Utilities');

    utilities.controller('UtilitiesCtrl', ['dataService', '$scope', '$modal', '$http', '$alert',
        function(dataService, $scope, $modal, $http, $alert) {
            var ctrl = this;
            $scope.properties.currentApp = 'Utilities';
            ctrl.testScript = function() {
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
        }
    ]);
})();
