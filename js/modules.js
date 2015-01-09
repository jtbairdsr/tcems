/*
 * @Author: Jonathan Baird
 * @Date:   2014-10-28 15:04:12
 * @Last Modified 2014-12-02
 * @Last Modified time: 2015-01-09 10:07:45
 */
(function() {
    /**
     * App Module
     *
     * This module runs the schedule portion of the app.  All controllers that deal with Scheduling, Availability, and Shifts will be contained in this module
     */
    angular.module('App', [
            // ootb Angular Modules
            'ngRoute',
            'ngAnimate',
            'ngSanitize',

            // 3rd party libraries
            'ui.select2',
            'ui.router',
            'mgcrea.ngStrap',
            // 'mgcrea.ngStrap.collapse',
            // 'mgcrea.ngStrap.helpers.dateParser',
            // 'mgcrea.ngStrap.helpers.dimensions',
            // 'mgcrea.ngStrap.tooltip',
            // 'mgcrea.ngStrap.button',
            'dcbImgFallback',

            // Our custom libraries
            'Services',
            'Schedule',
            'Directory',
            'Utilities'
        ])
        .config(function($stateProvider, $urlRouterProvider, $locationProvider) {
            // For any unmatched url, redirect to /state1
            $urlRouterProvider.otherwise("/main/schedule/today");
            // Now set up the states
            $stateProvider
            /////////////////////////////
            // Inactive Employee State //
            /////////////////////////////
                .state('inactiveEmployee', {
                    url: '/inactiveEmployee',
                    templateUrl: 'partials/inactiveEmployee.html',
                })
                .state('main', {
                    url: '/main',
                    abstract: true,
                    templateUrl: 'partials/main.html',
                    controller: function($scope, scopeSetter, dataService, $templateCache) {
                        $scope.arrays = {
                            errors: [],
                            positions: [],
                            shiftGroups: [],
                            shifts: [],
                            employees: [],
                            directoryEmployees: [],
                            weeks: [],
                            days: [],
                            subShifts: [],
                            areas: [],
                            tracks: [],
                            professors: [],
                            availabilityDays: [],
                            allAvailabilityDays: []
                        };
                        dataService.properties.today = {};
                        dataService.properties.unreadMessages = 0;
                        $scope.properties = dataService.properties;
                        if (dataService.properties.loadEmployeeInformation) {
                            function availableShifts() {
                                var shifts = [];
                                var schedules = [];
                                getShifts();

                                function compileShifts() {
                                    _.each(shifts, function(shift) {
                                        var relevantSchedules = _.filter(schedules, function(schedule) {
                                            return schedule.ShiftId === shift.Id;
                                        });
                                        shift.aSlots = shift.Slots - relevantSchedules.length;
                                        shift.position = shift.Position.Id;
                                        shift.shiftGroup = shift.ShiftGroup.Id;
                                    });
                                    $scope.arrays.shifts = shifts;
                                }

                                function getShifts() {
                                    new dataService.getItems('Shift')
                                        .top()
                                        .select(['Id', 'Day', 'Slots', 'Current', 'ShiftGroup/Description',
                                            'ShiftGroup/Id', 'Position/Position', 'Position/Id', 'StartTime',
                                            'EndTime'
                                        ])
                                        .expand(['ShiftGroup', 'Position'])
                                        .where(['Current', 'eq', '1'])
                                        .execute(false)
                                        .success(function(data) {
                                            shifts = data.d.results;
                                            getSchedules();
                                        });
                                }

                                function getSchedules() {
                                    new dataService.getItems('Schedule')
                                        .top()
                                        .where(['Active', 'eq', 1])
                                        .execute(false)
                                        .success(function(data) {
                                            schedules = data.d.results;
                                            compileShifts();
                                        });
                                }
                            };
                            availableShifts();
                            new dataService.getItems('Employee')
                                .top(999999999)
                                .select(['Id', 'Picture', 'FirstName', 'PreferredName', 'LastName', 'PhoneNumber', 'EmailAddress', 'INumber', 'Position/Position', 'Position/Id', 'Reader', 'Area/Area', 'Area/Id', 'Team/Id', 'Track/Description', 'Track/Id', 'Active'])
                                .expand(['Position', 'Area', 'Team', 'Track'])
                                .where(['Active', 'eq', 1])
                                .execute(false)
                                .success(function(data) {
                                    _.each(data.d.results, function(result) {
                                        result.Position = _.find($scope.arrays.positions, function(position) {
                                            return position.Id === result.Position.Id;
                                        });
                                    });
                                    $scope.arrays.employees = data.d.results;
                                });
                            new dataService.getItems('Employee')
                                .top(999999999)
                                .select(['Id', 'Picture', 'FirstName', 'PreferredName', 'LastName', 'PhoneNumber', 'EmailAddress', 'INumber', 'Position/Position', 'Position/Id', 'Reader', 'Area/Area', 'Area/Id', 'Team/Id', 'Track/Description', 'Track/Id', 'Active'])
                                .expand(['Position', 'Area', 'Team', 'Track'])
                                .execute(false)
                                .success(function(data) {
                                    _.each(data.d.results, function(result) {
                                        result.Position = _.find($scope.arrays.allPositions, function(position) {
                                            return position.Id === result.Position.Id;
                                        });
                                    });
                                    $scope.arrays.directoryEmployees = data.d.results;
                                });
                            new dataService.getItems('Position')
                                .select(['Position', 'ID', 'Group/Id'])
                                .expand(['Group'])
                                .execute(true)
                                .success(function(data) {
                                    var defaultPosition = '';
                                    switch (dataService.properties.currentUser.employeeInfo.Area.Area) {
                                        case 'SARAS':
                                            defaultPosition = 'Presenter';
                                            break;
                                        case 'Technology':
                                            defaultPosition = 'Techy';
                                            break;
                                        default:
                                            defaultPosition = 'Proctor';
                                    }
                                    for (var i = 0; i < data.d.results.length; i++) {
                                        data.d.results[i].access = (
                                            data.d.results[i].Position === dataService.properties.currentUser.employeeInfo.Position.Position ||
                                            data.d.results[i].Position === defaultPosition ||
                                            data.d.results[i].Position === 'Proctor' ||
                                            dataService.properties.currentUser.employeeInfo.Position.Position === 'FTE' ||
                                            dataService.properties.currentUser.employeeInfo.Admin);
                                        if (data.d.results[i].Position === defaultPosition && dataService.properties.currentUser.employeeInfo.Position.Position === 'FTE') {
                                            data.d.results[i].visible = true;
                                        } else if (data.d.results[i].Position === dataService.properties.currentUser.employeeInfo.Position.Position) {
                                            data.d.results[i].visible = true;
                                        } else {
                                            data.d.results[i].visible = false;
                                        }
                                    }
                                    $scope.arrays.positions = _.filter(data.d.results, function(result) {
                                        return result.Position !== 'FTE' && result.Position !== 'Applicant' && result.Position !== 'Admin';
                                    });
                                    $scope.arrays.allPositions = data.d.results;
                                });
                            new dataService.getItems('FacultyTestingInfo')
                                .select(['Professor/FirstName', 'Professor/LastName', 'Professor/OfficePhone', 'Professor/EmailAddress', 'Professor/OfficeAddress', 'Professor/OtherPhone', 'Professor/Picture', 'Stipulation', 'Other'])
                                .expand(['Professor'])
                                .execute(true)
                                .success(function(data) {
                                    _.each(data.d.results, function(result){
                                        result.FirstName = result.Professor.FirstName;
                                        result.LastName = result.Professor.LastName;
                                    });
                                    $scope.arrays.professors = data.d.results;
                                });
                            new dataService.getItems('Message')
                                .select(['Id', 'From/PreferredName', 'From/LastName', 'From/EmailAddress', 'From/Id', 'To/PreferredName', 'To/LastName', 'To/EmailAddress', 'To/Id', 'Subject', 'Message', 'Manditory', 'ExpDate', 'Viewed', 'ViewedDate', 'Active', 'Semester/Id'])
                                .expand(['From', 'To', 'Semester'])
                                .where({
                                    and: [
                                        ['Active', 'eq', 1],
                                        ['To/Id', 'eq', dataService.properties.currentUser.employeeInfo.Id],
                                        ['Semester/Id', 'eq', dataService.properties.currentSemester.Id]
                                    ]
                                })
                                .execute(true)
                                .success(function(data) {
                                    for (var i = 0; i < data.d.results.length; i++) {
                                        if (data.d.results[i].Manditory && !data.d.results[i].Viewed) {
                                            $scope.properties.unreadMessages++;
                                        }
                                        if (!data.d.results[i].Manditory && new Date(data.d.results[i].ExpDate)
                                            .compareTo(Date.today()) < 0) {
                                            data.d.results[i].Active = false;
                                            delete data.d.results[i].From;
                                            delete data.d.results[i].To;
                                            dataService.updateItem('Message', data.d.results[i].Id, data.d.results[i], '*');
                                            data.d.results.splice(i, 1);
                                        }
                                    }
                                    data.d.results.activePanel = -1;
                                    $scope.panels = data.d.results;
                                });
                            new dataService.getItems('ShiftGroup')
                                .select(['Id', 'Description'])
                                .execute(true)
                                .success(function(data) {
                                    _.each(data.d.results, function(result) {
                                        if (dataService.properties.nextSemester.ShiftGroup !== undefined) {
                                            result.active = (result.Id === dataService.properties.currentSemester.ShiftGroup.Id ||
                                                result.Id === dataService.properties.nextSemester.ShiftGroup.Id);
                                        } else {
                                            result.active = (result.Id === dataService.properties.currentSemester.ShiftGroup.Id)
                                        }
                                    });
                                    $scope.arrays.shiftGroups = data.d.results;
                                });
                            new dataService.getItems('Track')
                                .execute(true)
                                .success(function(data) {
                                    $scope.arrays.tracks = data.d.results;
                                });
                            new dataService.getItems('Area')
                                .execute(true)
                                .success(function(data) {
                                    $scope.arrays.areas = data.d.results;
                                });
                        }
                    },
                    resolve: {
                        scopeSetter: function($location, $q, dataService) {
                            var deffered = $q.defer();
                            getCurrentSemester();

                            function getCurrentSemester() {
                                dataService.getSemester().success(function(data) {
                                    dataService.properties.currentSemester = data.d.results[0];
                                    dataService.getNoTestingDays(dataService.properties.currentSemester)
                                        .success(function(data) {
                                            dataService.properties.currentSemester.noTestingDays = data.d.results;
                                            getNextSemester()
                                        });
                                });
                            }

                            function getNextSemester() {
                                if (dataService.properties.currentSemester.NextSemester.Id !== undefined) {
                                    dataService.getSemester(dataService.properties.currentSemester.NextSemester.Id).success(function(data) {
                                        dataService.properties.nextSemester = data.d.results[0];
                                        dataService.getNoTestingDays(dataService.properties.nextSemester)
                                            .success(function(data) {
                                                dataService.properties.nextSemester.noTestingDays = data.d.results;
                                                getCurrentUser();
                                            });
                                    });
                                } else {
                                    getCurrentUser();
                                }

                            }

                            function getCurrentUser() {
                                dataService.getJson(dataService.properties.sharePointUrl + '_api/web/currentUser', true)
                                    .success(function(data) {
                                        dataService.properties.currentUser.userId = data.d;
                                        new dataService.getItems('Employee')
                                            .select(['PreferredName', 'FirstName', 'LastName', 'Picture', 'ID', 'EmailAddress', 'PhoneNumber', 'Position/Position', 'Position/Id', 'Area/Area', 'Area/Id', 'Track/Id', 'Track/Description', 'Admin', 'Reader', 'Active'])
                                            .where({
                                                and: [
                                                    ['EmailAddress', 'eq', dataService.properties.currentUser.userId.Email],
                                                    ['Active', 'eq', 1]
                                                ]
                                            })
                                            .expand(['Position', 'Area', 'Track'])
                                            .execute()
                                            .success(function(data) {
                                                if (data.d.results.length === 0) {
                                                    dataService.properties.loadEmployeeInformation = false;
                                                    if (/([a-zA-Z]){3}\d{5}/.test(dataService.properties.currentUser.userId.Email)) {
                                                        $location.path("/inactiveEmployee");
                                                    } else {
                                                        new dataService.getItems('Professor')
                                                            .select(['FirstName', 'LastName', 'Picture', 'Id', 'EmailAddress', 'OfficePhone', 'OtherPhone', 'OfficeAddress'])
                                                            .where(['EmailAddress', 'eq', dataService.properties.currentUser.userId.Email])
                                                            .execute()
                                                            .success(function(data) {
                                                                $location.path("/main/faculty/info");
                                                                if (data.d.results.length === 0) {
                                                                    dataService.addItem('Professor', {
                                                                            __metadata: {
                                                                                type: "SP.Data.ProfessorListItem"
                                                                            },
                                                                            FirstName: dataService.properties.currentUser.userId.Title.split(', ')[1],
                                                                            LastName: dataService.properties.currentUser.userId.Title.split(', ')[0],
                                                                            Picture: '/media/' + dataService.properties.currentUser.userId.Email.split('@')[0] + '.jpg',
                                                                            EmailAddress: dataService.properties.currentUser.userId.Email,
                                                                            OfficePhone: '',
                                                                            OfficeAddress: '',
                                                                            OtherPhone: ''
                                                                        })
                                                                        .success(function(data) {
                                                                            dataService.properties.currentUser.employeeInfo = {
                                                                                FirstName: data.d.FirstName,
                                                                                LastName: data.d.LastName,
                                                                                Picture: data.d.Picture,
                                                                                EmailAddress: data.d.EmailAddress,
                                                                            };
                                                                            deffered.resolve();
                                                                        });
                                                                } else {
                                                                    dataService.properties.currentUser.employeeInfo = data.d.results[0];
                                                                    new dataService.getItems('FacultyTestingInfo')
                                                                        .select(['Professor/Id', 'Stipulation', 'Other', 'Id'])
                                                                        .expand(['Professor'])
                                                                        .where(['Professor/Id', 'eq', dataService.properties.currentUser.employeeInfo.Id])
                                                                        .execute()
                                                                        .success(function(data) {
                                                                            if (data.d.results.length === 0) {
                                                                                dataService.properties.newUser = true;
                                                                                dataService.properties.currentUser.FacultyTestingInfo = {
                                                                                    __metadata: {
                                                                                        type: "SP.Data.FacultyTestingInfoListItem"
                                                                                    },
                                                                                    ProfessorId: dataService.properties.currentUser.employeeInfo.Id,
                                                                                    Stipulation: '',
                                                                                    Other: ''
                                                                                };
                                                                            } else {
                                                                                dataService.properties.newUser = false;
                                                                                data.d.results[0].ProfessorId = data.d.results[0].Professor.Id;
                                                                                delete data.d.results[0].Professor;
                                                                                dataService.properties.currentUser.FacultyTestingInfo = data.d.results[0];
                                                                            }
                                                                            deffered.resolve();
                                                                        });
                                                                }
                                                            });
                                                    }
                                                } else {
                                                    dataService.properties.loadEmployeeInformation = true;
                                                    dataService.properties.currentUser.employeeInfo = data.d.results[0];
                                                    if (dataService.properties.currentUser.employeeInfo.Position.Position === 'FTE' ||
                                                        dataService.properties.currentUser.employeeInfo.Position.Position === 'HR' ||
                                                        dataService.properties.currentUser.employeeInfo.Admin) {
                                                        dataService.properties.extendedPrivledges = true;
                                                    }
                                                    deffered.resolve();
                                                }
                                            });
                                    });
                            }
                            return deffered.promise;
                        }
                    }
                })
                ////////////////
                // Home State //
                ////////////////
                .state('main.home', {
                    url: '/home',
                    templateUrl: 'partials/home.html',
                })
                ////////////////////
                // Schedule State //
                ////////////////////
                .state('main.schedule', {
                    url: '/schedule',
                    templateUrl: 'partials/schedule.html',
                    abstract: true,
                    controller: 'ScheduleCtrl',
                    controllerAs: 'schedule'
                })
                .state('main.schedule.schedule', {
                    url: '/schedule',
                    templateUrl: 'partials/schedule.schedule.html',
                    controller: 'BasicScheduleCtrl'
                })
                .state('main.schedule.schedule.this-semester', {
                    url: '/this-semester',
                    templateUrl: 'partials/schedule.schedule.this-semester.html',
                })
                .state('main.schedule.schedule.next-semester', {
                    url: '/next-semester',
                    templateUrl: 'partials/schedule.schedule.next-semester.html',
                })
                .state('main.schedule.availability', {
                    url: '/availability',
                    templateUrl: 'partials/schedule.availability.html',
                    controller: 'AvailabilityCtrl',
                    controllerAs: 'ctrl'
                })
                .state('main.schedule.mySchedule', {
                    url: '/mySchedule',
                    templateUrl: 'partials/schedule.my-schedule.html',
                    controller: 'BasicScheduleCtrl'
                })
                .state('main.schedule.subShifts', {
                    url: '/subShifts',
                    templateUrl: 'partials/schedule.sub-shifts.html',
                    controller: 'BasicScheduleCtrl'
                })
                .state('main.schedule.myAvailability', {
                    url: '/myAvailability',
                    templateUrl: 'partials/schedule.my-availability.html',
                    controller: 'BasicScheduleCtrl'
                })
                .state('main.schedule.availableShifts', {
                    url: '/availableShifts',
                    templateUrl: 'partials/schedule.available-shifts.html',
                    controller: 'BasicScheduleCtrl'
                })
                .state('main.schedule.today', {
                    url: '/today',
                    templateUrl: 'partials/schedule.today.html',
                    controller: 'TodayCtrl',
                    controllerAs: 'ctrl'
                })

            /////////////////////
            // Directory State //
            /////////////////////
            .state('main.directory', {
                    url: '/directory',
                    templateUrl: 'partials/directory.html',
                    controller: 'DirectoryCtrl',
                    controllerAs: 'directory',
                    abstract: true
                })
                .state('main.directory.listView', {
                    url: '/listView',
                    templateUrl: 'partials/directory.list-view.html'
                })
                .state('main.directory.gridView', {
                    url: '/gridView',
                    templateUrl: 'partials/directory.grid-view.html'
                })
                //////////////////////////
                // Faculty Portal State //
                //////////////////////////
                .state('main.faculty', {
                    url: '/faculty',
                    abstract: true,
                    templateUrl: 'partials/faculty.html',
                    controllerAs: 'ctrl',
                    controller: function($scope, dataService) {
                        $scope.properties.currentApp = $scope.properties.currentUser.employeeInfo.FirstName + ' ' + $scope.properties.currentUser.employeeInfo.LastName;
                        this.addFacultyTestingInfo = function() {
                            dataService.addItem('FacultyTestingInfo', $scope.properties.currentUser.FacultyTestingInfo);
                        };
                        this.updateFacultyTestingInfo = function() {
                            dataService.updateItem('FacultyTestingInfo', $scope.properties.currentUser.FacultyTestingInfo.Id, $scope.properties.currentUser.FacultyTestingInfo, '*');
                        };
                        this.updateProfessor = function() {
                            dataService.updateItem('Professor', $scope.properties.currentUser.employeeInfo.Id, $scope.properties.currentUser.employeeInfo, '*');
                        };
                    }
                })
                .state('main.faculty.info', {
                    url: '/info',
                    templateUrl: 'partials/faculty.info.html',
                })
                ///////////////////
                // Utilities State //
                ///////////////////
                .state('main.utilities', {
                    url: '/utilities',
                    templateUrl: 'partials/utilities.html',
                    controller: 'UtilitiesCtrl'
                });
            // todo: add additional states

            // set html5Mode to true to allow faster partial loading and clean urls.
            // $locationProvider.html5Mode(true);
        });

    /**
     * Schedule Module
     *
     * This module runs the schedule portion of the app.  All controllers that deal with Scheduling, Availability, and Shifts will be contained in this module
     */
    angular.module('Schedule', [
        // Official Angular modules
        'ngAnimate',
        'ngSanitize',

        // 3rd party modules
        'ui.select2',
        'mgcrea.ngStrap',
        // 'mgcrea.ngStrap.helpers.dateParser',
        // 'ui.bootstrap',

        // Our custom libraries
        'Services'
    ]);
    /**
     * Directory Module
     *
     * This is the module that runs the directory portion of the app.
     */
    angular.module('Directory', [
        // Official Angular modules
        'ngAnimate',
        'ngSanitize',

        // 3rd party modules
        'ui.select2',
        'mgcrea.ngStrap',
        // 'mgcrea.ngStrap.helpers.dateParser',

        // Our custom libraries
        'Services'
    ]);
    /**
     * Utilities Module
     *
     * This is the module that will handle all of the controllers for admin utilities;
     */
    angular.module('Utilities', [
        // ootb Angular Modules
        'ngRoute',
        'ngAnimate',
        'ngSanitize',

        // 3rd party libraries
        'ui.select2',
        'ui.router',
        'mgcrea.ngStrap',
        // 'mgcrea.ngStrap.helpers.dateParser',

        // Our custom libraries
        'Services',
        'Schedule'
    ]);

})();
