/*
 * @Author: Jonathan Baird
 * @Date:   2014-10-28 15:04:12
 * @Last Modified 2014-12-08
 * @Last Modified time: 2014-12-11 20:03:45
 */
/* global angular, _ */

(function() {
    var schedule = angular.module('Schedule');

    schedule.service('scheduleService', ['$location', '$modal', 'dataService',
        function($location, $modal, dataService) {
            var service = this;
            service.showAddShift = false;
            service.showSubShift = false;
            service.scheduleService = function() {
                if (dataService.properties.currentUser.employeeInfo.Position.Position === 'FTE' ||
                    dataService.properties.currentUser.employeeInfo.Position.Position === 'HR' ||
                    dataService.properties.currentUser.employeeInfo.Admin) {
                    switch ($location.path()) {
                        case '/main/schedule/availableShifts':
                            service.showAddShift = true;
                            service.showAddSubShift = false;
                            break;
                        case '/main/schedule/subShifts':
                            service.showAddShift = false;
                            service.showAddSubShift = true;
                            break;
                        default:
                            service.showAddShift = false;
                            service.showAddSubShift = false;
                    }
                } else {
                    service.showAddShift = false;
                    service.showAddSubShift = false;
                }
            };
        }
    ]);
    schedule.controller('BasicScheduleCtrl', ['$scope', 'scheduleService',
        function($scope, scheduleService) {
            scheduleService.scheduleService();
            $scope.ctrlProperties.showAddShift = scheduleService.showAddShift;
            $scope.ctrlProperties.showAddSubShift = scheduleService.showAddSubShift;
        }
    ]);

    schedule.controller('ScheduleCtrl', ['$location', '$scope', '$modal',
        'dataService',
        function($location, $scope, $modal, dataService) {
            var ctrl = this;
            $scope.ctrlProperties = {
                showAddShift: false,
                showAddSubShift: false
            };

            if (dataService.properties.currentUser.employeeInfo.Position.Position !==
                'Coordinator' && dataService.properties.currentUser.employeeInfo.Position
                .Position !== 'FTE' && !(dataService.properties.currentUser.employeeInfo
                    .Admin)) {
                $location.path('/main/schedule/mySchedule');
            }
            $scope.properties.currentApp = 'Schedule';
            ctrl.refreshContent = function() {
                new dataService.getItems('Employee')
                    .top(999999999)
                    .select(['Id', 'Picture', 'FirstName', 'PreferredName', 'LastName',
                        'EmailAddress', 'PhoneNumber', 'INumber', 'Track/Description',
                        'Team/Id', 'Position/Position', 'Area/Area'
                    ])
                    .expand(['Track', 'Team', 'Position', 'Area'])
                    .where(['Active', 'eq', 1])
                    .execute(false)
                    .success(function(data) {
                        $scope.arrays.employees = data.d.results;
                    });
                var availableShifts = function() {
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
                            .top(999999999)
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
                new dataService.getItems('Availability')
                    .top(999999999)
                    .select(['Employee/Id', 'Day', 'StartTime', 'EndTime', 'Id'])
                    .expand(['Employee'])
                    .where({
                        and: [
                            ['Current', 'eq', 1],
                            ['Employee/Id', 'eq', dataService.properties.currentUser.employeeInfo
                                .Id
                            ]
                        ]
                    })
                    .execute(false)
                    .success(function(data) {
                        var createDays = function(data) {
                            var days = new Array(7),
                                i = 0;
                            for (i = 0; i < days.length; i++) {
                                days[i] = {
                                    day: Date.sun()
                                        .addDays(i)
                                        .toString('dddd'),
                                    availabilities: []
                                };
                            }
                            for (i = 0; i < data.length; i++) {
                                var daysCounter = 0;
                                do {
                                    var currentDay = days[daysCounter];
                                    if (data[i].Day === currentDay.day) {
                                        currentDay.availabilities.push({
                                            Id: data[i].Id,
                                            startTime: data[i].StartTime,
                                            endTime: data[i].EndTime
                                        });
                                        daysCounter = days.length;
                                    } else {
                                        daysCounter++;
                                    }
                                } while (daysCounter < days.length);
                            }
                            return days;
                        };
                        $scope.arrays.availabilityDays = createDays(data.d.results);
                    });


                // This is the function that gathers the data and assembles the array that is used by the mySchedule partial.
                // This function will pull the information from the database, process it, and pass it to the scope controller.
                var mySchedule = function() {

                    /////////////////////////////////////
                    // mySchedule Variable Declaration //
                    /////////////////////////////////////
                    var weeksCounter, daysCounter, weeks, schedules, subShifts;

                    ////////////////////////////////////////
                    // mySchedule Variable Initialization //
                    ////////////////////////////////////////
                    weeksCounter = 0;
                    daysCounter = 0;
                    weeks = createWeeks(3);
                    schedules = [];
                    subShifts = [];
                    shifts = [];

                    //////////////////////////////////////
                    // mySchedule Procedural Algorithm. //
                    //////////////////////////////////////

                    //First we request data from the Schedule table on SharePoint.
                    if (dataService.properties.currentUser.employeeInfo.Position.Position === 'FTE') {
                        // if we have, we pass the final result of all our work to the $scope controller.
                        $scope.arrays.weeks = weeks;
                        subShiftView();
                    } else {
                        getSchedules();
                    }

                    ////////////////////////
                    // mySchedule Methods //
                    ////////////////////////

                    // This method returns an array of week objects with the specified number of elements.
                    // The first week will be the week that the computer that is executing the code is currently in.
                    function createWeeks(numWeeks) {
                        var returnWeeks = [];
                        var sunDate = Date.sunday();
                        for (var i = 0; i < numWeeks; i++) {
                            returnWeeks.push({
                                title: 'Week ' + (i + 1),
                                days: createDays(sunDate),
                            });
                        }
                        return returnWeeks;
                    }

                    // This method returns an array of day objects that together are the days in a week.
                    // The first day will be the date passed as a parameter followed by 6 other consecutive days.
                    function createDays(firstDay) {
                        var days = [];
                        for (var i = 0; i < 7; i++) {
                            days.push({
                                title: firstDay.toString('dddd'),
                                day: firstDay.toString('ddd'),
                                date: new Date(firstDay),
                                weekend: ctrl.isWeekend(firstDay),
                                past: (firstDay < Date.today()),
                                shifts: [],
                                subShifts: [],
                                myShifts: []
                            });
                            firstDay.addDays(1);
                        }
                        return days;
                    }

                    // This method simply takes a week as a parameter and populates the days for that week.
                    // The population and loop are mostly housed in the populateDay method.
                    function populateWeek(week) {
                        populateDay(week.days[daysCounter]);
                    }

                    // This method takes a day as a parameter and populates the shifts for that day.
                    // This is the work horse of the myschedule function.
                    function populateDay(day) {

                        ///////////////////////////
                        // populateDay Variables //
                        ///////////////////////////

                        // Declaration
                        var daySubShifts, daySchedules, subOfSubShifts;

                        //Initialization
                        //This narrows the subShifts array down to just the subShifts that we need for the day we are compiling.
                        daySubShifts = _.filter(subShifts, function(subShift) {
                            return Date.equals(new Date(subShift.Date), day.date);
                        });
                        //This narrows the schedules array down to just the schedules that we need for the day we are compiling.
                        daySchedules = _.filter(schedules, function(schedule) {
                            return schedule.Shift.Day.indexOf(day.day) >= 0;
                        });
                        // This creates an additional list that contains just the subShifts that have requested a new subShift.
                        subOfSubShifts = _.filter(daySubShifts, function(subShift) {
                            return subShift.NewRequest.Id !== undefined;
                        });

                        ///////////////////////////////////////
                        // populateDay Procedural Algorithm. //
                        ///////////////////////////////////////

                        // attach NewRequest subShifts to the original subShift.
                        _.each(subOfSubShifts, function(subOfSubShift) {
                            subOfSubShift.NewRequest = _.find(daySubShifts, function(
                                subShift) {
                                return subShift.Id === subOfSubShift.NewRequest.Id;
                            });
                            daySubShifts = _.without(daySubShifts, subOfSubShift.NewRequest);
                        });

                        // Add each of the shifts associated with the schedule to the day.
                        // Before the shift is added check to see if a Sub has been requested for that day and compensate.
                        _.each(daySchedules, function(schedule) {
                            // This checks to see if there is a subShift in the narrowed list of subShifts with a matching shift Id.
                            // If there is, the subShift is assigned to the requestedSubShift variable otherwise it returns udefined.
                            var requestedSubShift = _.find(daySubShifts, function(subShift) {
                                return subShift.Shift.Id === schedule.Shift.Id;
                            });
                            if (requestedSubShift === undefined) {
                                // When the requestedSubShift variable is undefined, we simply add a new shift to the list with no additional parameters.
                                day.myShifts.push(newShift({
                                    shift: schedule.Shift
                                }));
                            } else if (requestedSubShift.Substitute.Id === undefined) {
                                // When the requestedSubShift variable is defined, we know that it contains information about a sub that the current user requested.
                                // We next check to see if someone has taken the subShift.
                                // When it is untaken, we simply add a new shift with the parameters that flag it as a subRequested shift.
                                // We also pass the subShift as a parameter so that we have the Id available in the newShift method. (this is used to pass the subShift Id to the requestSubOfSub method)
                                day.myShifts.push(newShift({
                                    subRequested: true,
                                    shift: schedule.Shift,
                                    subShift: requestedSubShift
                                }));
                                // After we have done all of this, we remove the subShift from the array so we don't have to deal with it again.
                                daySubShifts = _.without(daySubShifts, requestedSubShift);
                            } else {
                                // When someone has taken the subShift, we add a new shift and pass the parameters that flag it as a subRequested shift and as a subCovered shift.
                                // We also pass the subShift as a parameter so that we have the Id available in the newShift method. (this is used to pass the subShift Id to the requestSubOfSub method)
                                day.myShifts.push(newShift({
                                    subRequested: true,
                                    subCovered: true,
                                    shift: schedule.Shift,
                                    subShift: requestedSubShift
                                }));
                                // After we have done all of this, we remove the subShift from the array so we don't have to deal with it again.
                                daySubShifts = _.without(daySubShifts, requestedSubShift);
                            }
                        });

                        // Add the additional SubShifts to the day.
                        _.each(daySubShifts, function(subShift) {
                            // These are the shifts that the current user has aggreed to be the sub for.
                            if (subShift.NewRequest.Id === undefined) {
                                // First we check to see if the user has requested a new sub.
                                // If they haven't, we add a new shift and pass the parameters that flag it as an isSubShift shift.
                                // We also pass the subShift as a parameter so that we have the Id available in the newShift method. (this is used to pass the subShift Id to the requestSubOfSub method)
                                day.myShifts.push(newShift({
                                    isSubShift: true,
                                    shift: subShift.Shift,
                                    subShift: subShift
                                }));
                            } else if (subShift.NewRequest.Substitute.Id === undefined) {
                                // If they have, we check to see if someone has taken the subShift.
                                // If they haven't, we add a new shift and pass the parameters that flag it as an isSubShift shift and as a subRequested shift.
                                // We also pass the subShift as a parameter so that we have the Id available in the newShift method. (this is used to pass the subShift Id to the requestSubOfSub method)
                                // We also pass the NewRequest as a parameter so that we have access to the subOfSubShift in the newShift method. (this is used to pass the subOfSubShift Id to the cancelSubOfSubRequest method)
                                day.myShifts.push(newShift({
                                    isSubShift: true,
                                    subRequested: true,
                                    shift: subShift.Shift,
                                    subShift: subShift,
                                    subOfSubShift: subShift.NewRequest
                                }));
                            } else {
                                // If they have, we add a new shift and pass the parameters that flag it as an isSubShift shift, a subRequested shift, and a subCovered shift.
                                // We also pass the subShift as a parameter so that we have the Id available in the newShift method. (this is used to pass the subShift Id to the requestSubOfSub method)
                                // We also pass the NewRequest as a parameter so that we have access to the subOfSubShift in the newShift method. (this is used to pass the subOfSubShift Id to the cancelSubOfSubRequest method)
                                day.myShifts.push(newShift({
                                    isSubshift: true,
                                    subRequested: true,
                                    subCovered: true,
                                    shift: subShift.Shift,
                                    subShift: subShift,
                                    subOfSubShift: subShift.NewRequest
                                }));
                            }
                        });
                        // Now we have finished compiling the day so we increment the counter to move us to the next day.
                        daysCounter++;
                        // After we increment the counter we check to see if we have finished all of the days in the current week.
                        if (daysCounter < weeks[weeksCounter].days.length) {
                            // if we haven't, we simply pass the next day to the populateDay method and the cycle repeats.
                            populateDay(weeks[weeksCounter].days[daysCounter]);
                        } else {
                            // if we have, we increment the week counter to signify that we are done with the current week.
                            weeksCounter++;
                            // Now we check to see if we have finished all of the weeks in the weeks array.
                            if (weeksCounter < weeks.length) {
                                // if we haven't, we reset the daysCounter to 0 and pass the next week to the populateWeek method to start that cycle over.
                                daysCounter = 0;
                                populateWeek(weeks[weeksCounter]);
                            } else {
                                // if we have, we pass the final result of all our work to the $scope controller.
                                $scope.arrays.weeks = weeks;
                                subShiftView();
                            }

                        }
                    }

                    //This method returns a shift object that can be assigned to the shifts array property for a day.
                    //All of the properties of the params object are optional **EXCEPT the shift property** which is mandatory.
                    function newShift(params) {
                        // Assign default values to params if non are passed.
                        params = params || {};
                        params.subRequested = params.subRequested || false;
                        params.isSubShift = params.isSubShift || false;
                        params.subCovered = params.subCovered || false;
                        params.subShift = params.subShift || '';
                        params.subOfSubShift = params.subOfSubShift || '';
                        return {
                            Id: params.shift.Id,
                            startTime: params.shift.StartTime,
                            endTime: params.shift.EndTime,
                            subShiftId: params.subShift.Id,
                            subRequested: params.subRequested,
                            subCovered: params.subCovered,
                            isSubShift: params.isSubShift,
                            subOfSubShiftId: params.subOfSubShift.Id
                        };
                    }

                    function getSchedules() {
                        new dataService.getItems('Schedule')
                            .top(999999999)
                            .select(['Id', 'Shift/Id', 'Shift/Day', 'Shift/StartTime',
                                'Shift/EndTime', 'Employee/Id'
                            ])
                            .expand(['Shift', 'Employee'])
                            // we only want the schedules that are active and are associated with the current user.
                            .where({
                                and: [
                                    ['Employee/Id', 'eq', dataService.properties.currentUser.employeeInfo
                                        .Id
                                    ],
                                    ['Active', 'eq', 1]
                                ]
                            })
                            .execute()
                            .success(function(data) {
                                // Here we assign the results of this call to a variable whose scope is global to the mySchedule function.
                                schedules = data.d.results;

                                // Now we are going to request data from the SubShift table on SharePoint.
                                // This request is nested inside the callback of the other request in order to force syncronous execution.
                                getSubShifts();
                            });
                    }

                    function getSubShifts() {
                        new dataService.getItems('SubShift')
                            .top(999999999)
                            .select(['Substitute/Id', 'Requester/Id', 'Date', 'Shift/Id',
                                'Shift/StartTime', 'Shift/EndTime', 'Id', 'NewRequest/Id'
                            ])
                            .expand(['Substitute', 'Shift', 'NewRequest', 'Requester'])
                            // We want all subShifts that have the current users Id in the substitute collumn or in the requester collumn.
                            // After we have that list we filter it down by eliminating all of the inactive subshifts.
                            .where({
                                and: {
                                    or: [
                                        ['Substitute', 'eq', dataService.properties.currentUser.employeeInfo
                                            .Id
                                        ],
                                        ['Requester', 'eq', dataService.properties.currentUser.employeeInfo
                                            .Id
                                        ]
                                    ],
                                    other: ['Active', 'eq', 1]
                                }
                            })
                            .execute()
                            .success(function(data) {
                                // Here we assign the results of this call to a variable whose scope is global to the mySchedule function.
                                subShifts = data.d.results;
                                // Now we are going to request data from the Shift table on SharePoint.
                                // This request is nested inside the callback of the other request in order to force syncronous execution.
                                getShifts();
                            });
                    }

                    function getShifts() {
                        new dataService.getItems('Shift')
                            .top(999999999)
                            .select(['Id', 'Day', 'Slots', 'Current',
                                'ShiftGroup/Description', 'ShiftGroup/Id', 'Position/Position',
                                'Position/Id', 'StartTime', 'EndTime'
                            ])
                            .expand(['ShiftGroup', 'Position'])
                            // We want all shifts that are current and belong to this semester.
                            .where({
                                and: [
                                    ['Current', 'eq', 1],
                                    ['ShiftGroup/Id', 'eq', dataService.properties.currentSemester.Id]
                                ]
                            })
                            .execute()
                            .success(function(data) {
                                // Here we assign the results of this call to a variable whose scope is global to the mySchedule function.
                                shifts = data.d.results;
                                // Here we are going to filter the schedules to only be those from the current semester.
                                schedules = filterSchedules();
                                // Now we start the assemblage of the data rolling by calling the populateWeek method.
                                populateWeek(weeks[weeksCounter]);
                            });
                    }

                    function filterSchedules() {
                        return _.filter(schedules, function(schedule) {
                            return _.find(shifts, function(shift) {
                                return shift.Id === schedule.Shift.Id;
                            }) !== undefined;
                        });
                    }

                };

                // call the mySchedule function to collect and organize the mySchedule data.
                mySchedule();
                // This Semesters Schedule overview.
                new dataService.getItems('Schedule')
                    .top(999999999)
                    .select(['Id', 'Shift/Id', 'Shift/Day', 'Shift/StartTime',
                        'Shift/EndTime', 'Employee/Id', 'Employee/FirstName',
                        'Employee/LastName', 'Employee/PreferredName', 'Employee/Picture'
                    ])
                    .expand(['Shift', 'Employee'])
                    .where(['Active', 'eq', 1])
                    .execute(false)
                    .success(function(data) {
                        var createDays = function() {
                                var days = new Array(6);
                                for (var i = 0; i < days.length; i++) {
                                    days[i] = {
                                        title: Date.mon()
                                            .addDays(i)
                                            .toString('dddd'),
                                        day: Date.mon()
                                            .addDays(i)
                                            .toString('ddd'),
                                        visible: true,
                                        shifts: []
                                    };
                                }
                                return days;
                            },
                            addEmployees = function(shift) {
                                var employees = [],
                                    i = 0;
                                for (i = 0; i < schedules.length; i++) {
                                    if (schedules[i].Shift.Id === shift.Id) {
                                        delete schedules[i].Employee.__metadata;
                                        schedules[i].Employee.ShiftId = shift.Id;
                                        schedules[i].Employee.ScheduleId = schedules[i].Id;
                                        employees.push(schedules[i].Employee);
                                    }
                                }
                                var remainingSlots = shift.Slots - employees.length;
                                if (remainingSlots !== 0) {
                                    for (i = 0; i < remainingSlots; i++) {
                                        employees.push({
                                            Id: 0,
                                            FirstName: 'No',
                                            LastName: 'Employee',
                                            PreferredName: '',
                                            Picture: '/media/missing.png',
                                            ShiftId: shift.Id,
                                            ScheduleId: 0
                                        });
                                    }
                                }
                                shift.employees = employees;
                                return shift;
                            },
                            createShift = function(shift) {
                                return {
                                    startTime: new Date(shift.StartTime),
                                    endTime: new Date(shift.EndTime),
                                    position: shift.Position.Position,
                                    employees: shift.employees
                                };
                            },
                            compileSchedules = function() {
                                var shift = {},
                                    tempDays = [],
                                    day = {},
                                    daysCounter = 0,
                                    shiftsCounter = 0;
                                for (var i = 0; i < shifts.length; i++) {
                                    shift = createShift(addEmployees(shifts[i]));
                                    tempDays = shifts[i].Day.split(' - ');
                                    for (var j = 0; j < tempDays.length; j++) {
                                        daysCounter = 0;
                                        do {
                                            day = days[daysCounter];
                                            if (day.day === tempDays[j]) {
                                                if (day.shifts.length > 0) {
                                                    shiftsCounter = 0;
                                                    do {
                                                        var currentShift = day.shifts[shiftsCounter];
                                                        if ((currentShift.startTime.toString('HH:mm') === shift.startTime
                                                                .toString('HH:mm') && currentShift.endTime.toString(
                                                                    'HH:mm') === shift.endTime.toString('HH:mm')) &&
                                                            currentShift.position === shift.position) {
                                                            for (var k = 0; k < shift.employees.length; k++) {
                                                                currentShift.employees.push(shift.employees[k]);
                                                            }
                                                            shiftsCounter = day.shifts.length;
                                                        } else if (shiftsCounter === day.shifts.length - 1) {
                                                            day.shifts.push(createShift(addEmployees(shifts[i])));
                                                            shiftsCounter = day.shifts.length;
                                                        } else {
                                                            shiftsCounter++;
                                                        }
                                                    } while (shiftsCounter < day.shifts.length);
                                                } else {
                                                    day.shifts.push(createShift(addEmployees(shifts[i])));
                                                }
                                                daysCounter = days.length;
                                            } else {
                                                daysCounter++;
                                            }
                                        } while (daysCounter < days.length);
                                    }
                                }
                            },
                            getShifts = function() {
                                new dataService.getItems('Shift')
                                    .top(999999999)
                                    .select(['Id', 'Day', 'Slots', 'Current',
                                        'ShiftGroup/Description', 'ShiftGroup/Id', 'Position/Position',
                                        'Position/Id', 'StartTime', 'EndTime'
                                    ])
                                    .expand(['ShiftGroup', 'Position'])
                                    .where({
                                        and: [
                                            ['Current', 'eq', '1'],
                                            ['ShiftGroup/Id', 'eq', dataService.properties.currentSemester.Id]
                                        ]
                                    })
                                    .execute(false)
                                    .success(function(data) {
                                        shifts = data.d.results;
                                        compileSchedules();
                                    });
                            },
                            days = createDays(),
                            shifts = [],
                            schedules = data.d.results;
                        getShifts();
                        compileSchedules();
                        $scope.arrays.days = days;
                    });
                // Next Semesters Schedule overview.
                new dataService.getItems('Schedule')
                    .top(999999999)
                    .select(['Id', 'Shift/Id', 'Shift/Day', 'Shift/StartTime',
                        'Shift/EndTime', 'Employee/Id', 'Employee/FirstName',
                        'Employee/LastName', 'Employee/PreferredName', 'Employee/Picture'
                    ])
                    .expand(['Shift', 'Employee'])
                    .where(['Active', 'eq', 1])
                    .execute(false)
                    .success(function(data) {
                        var createDays = function() {
                                var days = new Array(6);
                                for (var i = 0; i < days.length; i++) {
                                    days[i] = {
                                        title: Date.mon()
                                            .addDays(i)
                                            .toString('dddd'),
                                        day: Date.mon()
                                            .addDays(i)
                                            .toString('ddd'),
                                        visible: true,
                                        shifts: []
                                    };
                                }
                                return days;
                            },
                            addEmployees = function(shift) {
                                var employees = [],
                                    i = 0;
                                for (i = 0; i < schedules.length; i++) {
                                    if (schedules[i].Shift.Id === shift.Id) {
                                        delete schedules[i].Employee.__metadata;
                                        schedules[i].Employee.ShiftId = shift.Id;
                                        schedules[i].Employee.ScheduleId = schedules[i].Id;
                                        employees.push(schedules[i].Employee);
                                    }
                                }
                                var remainingSlots = shift.Slots - employees.length;
                                if (remainingSlots !== 0) {
                                    for (i = 0; i < remainingSlots; i++) {
                                        employees.push({
                                            Id: 0,
                                            FirstName: 'No',
                                            LastName: 'Employee',
                                            PreferredName: '',
                                            Picture: '/media/missing.png',
                                            ShiftId: shift.Id,
                                            ScheduleId: 0
                                        });
                                    }
                                }
                                shift.employees = employees;
                                return shift;
                            },
                            createShift = function(shift) {
                                return {
                                    startTime: new Date(shift.StartTime),
                                    endTime: new Date(shift.EndTime),
                                    position: shift.Position.Position,
                                    employees: shift.employees
                                };
                            },
                            compileSchedules = function() {
                                var shift = {},
                                    tempDays = [],
                                    day = {},
                                    daysCounter = 0,
                                    shiftsCounter = 0;
                                for (var i = 0; i < shifts.length; i++) {
                                    shift = createShift(addEmployees(shifts[i]));
                                    tempDays = shifts[i].Day.split(' - ');
                                    for (var j = 0; j < tempDays.length; j++) {
                                        daysCounter = 0;
                                        do {
                                            day = days[daysCounter];
                                            if (day.day === tempDays[j]) {
                                                if (day.shifts.length > 0) {
                                                    shiftsCounter = 0;
                                                    do {
                                                        var currentShift = day.shifts[shiftsCounter];
                                                        if ((currentShift.startTime.toString('HH:mm') === shift.startTime
                                                                .toString('HH:mm') && currentShift.endTime.toString(
                                                                    'HH:mm') === shift.endTime.toString('HH:mm')) &&
                                                            currentShift.position === shift.position) {
                                                            for (var k = 0; k < shift.employees.length; k++) {
                                                                currentShift.employees.push(shift.employees[k]);
                                                            }
                                                            shiftsCounter = day.shifts.length;
                                                        } else if (shiftsCounter === day.shifts.length - 1) {
                                                            day.shifts.push(createShift(addEmployees(shifts[i])));
                                                            shiftsCounter = day.shifts.length;
                                                        } else {
                                                            shiftsCounter++;
                                                        }
                                                    } while (shiftsCounter < day.shifts.length);
                                                } else {
                                                    day.shifts.push(createShift(addEmployees(shifts[i])));
                                                }
                                                daysCounter = days.length;
                                            } else {
                                                daysCounter++;
                                            }
                                        } while (daysCounter < days.length);
                                    }
                                }
                            },
                            getShifts = function() {
                                new dataService.getItems('Shift')
                                    .top(999999999)
                                    .select(['Id', 'Day', 'Slots', 'Current',
                                        'ShiftGroup/Description', 'ShiftGroup/Id', 'Position/Position',
                                        'Position/Id', 'StartTime', 'EndTime'
                                    ])
                                    .expand(['ShiftGroup', 'Position'])
                                    .where({
                                        and: [
                                            ['Current', 'eq', '1'],
                                            ['ShiftGroup/Id', 'eq', dataService.properties.nextSemester.Id]
                                        ]
                                    })
                                    .execute(false)
                                    .success(function(data) {
                                        shifts = data.d.results;
                                        compileSchedules();
                                    });
                            },
                            days = createDays(),
                            shifts = [],
                            schedules = data.d.results;
                        getShifts();
                        compileSchedules();
                        $scope.arrays.nextDays = days;
                    });
                // This is the function that will add the data necessary for the subShifts view.  It is called after the mySchedule function finishes.
                function subShiftView() {

                    ////////////////////////////
                    // subShiftView Variables //
                    ////////////////////////////

                    // Declaration
                    var subShifts, shifts, weeks;

                    // Initialization
                    subShifts = [];
                    shifts = [];

                    ////////////////////////////
                    // subShiftView Functions //
                    ////////////////////////////
                    function getSubShifts() {
                        new dataService.getItems('SubShift')
                            .top()
                            .select(
                                // SubShift Info
                                ['Id',
                                    'Date',
                                    'Shift/Id',
                                    // Requester Info
                                    'Requester/Id',
                                    'Requester/PreferredName',
                                    'Requester/LastName',
                                    'Requester/Picture',
                                    'Requester/EmailAddress',
                                    'Requester/PhoneNumber',
                                    // Substitute Info
                                    'Substitute/Id',
                                    'Substitute/PreferredName',
                                    'Substitute/LastName',
                                    'Substitute/Picture',
                                    'Substitute/EmailAddress',
                                    'Substitute/PhoneNumber'
                                ]
                            )
                            .expand(['Shift', 'Requester', 'Substitute'])
                            .where(['Active', 'eq', 1])
                            .execute()
                            .success(function(data) {
                                // This assigns the results to a global (to the subShiftView function) variable so other functions and use them.
                                subShifts = data.d.results;
                                // Now we call the getShifts function to force it to fire syncronously after we get back the results from the query of the SubShift table.
                                getShifts();
                            });
                    }

                    function getShifts() {
                        new dataService.getItems('Shift')
                            .top()
                            .select(
                                // Shift Info
                                ['Id',
                                    'Day',
                                    'StartTime',
                                    'EndTime',
                                    'Current',
                                    // Shift Group Info
                                    'ShiftGroup/Description',
                                    'ShiftGroup/Id',
                                    // Position Info
                                    'Position/Id',
                                    'Position/Position'
                                ]
                            )
                            .expand(['ShiftGroup', 'Position'])
                            .where({
                                and: [
                                    //This selects only those shifts that apply to the current semester
                                    ['ShiftGroup/Id', 'eq', dataService.properties.currentSemester.Id],
                                    // This selects only those shifts that are active (sorry about the poor data naming choice)
                                    ['Current', 'eq', 1]
                                ]
                            })
                            .execute()
                            .success(function(data) {
                                // This assigns the results to a global (to the subShiftView function) variable so other functions and use them.
                                shifts = data.d.results;
                                // Now we will call the populateWeeks function to force it to execute syncronously after we get back the results from the query of the Shift table.
                                populateWeeks();
                            });
                    }

                    function newShift(subShift, shift) {
                        var requester = _.find($scope.arrays.employees, function(employee) {
                            return employee.Id === subShift.Requester.Id;
                        });
                        if (requester !== undefined &&
                            (requester.Position.Position === 'FTE' ||
                                requester.Position.Position === 'HR')) {
                            subShift.Requester = {
                                Id: 0,
                                PreferredName: "Extra",
                                LastName: " ",
                                Picture: "/media/missing.png",
                                EmailAddress: "",
                                PhoneNumber: ""
                            };
                        }
                        var position = _.find($scope.arrays.positions, function(position) {
                            return position.Id === shift.Position.Id;
                        });
                        return {
                            // shift Info
                            Id: shift.Id,
                            startTime: shift.StartTime,
                            endTime: shift.EndTime,
                            position: position,
                            // subShift Info
                            subShiftId: subShift.Id,
                            requester: subShift.Requester,
                            substitute: subShift.Substitute,
                            // General Info
                            taken: (subShift.Substitute.Id !== undefined),
                            hide: (subShift.Substitute.Id !== undefined &&
                                !(dataService.properties.currentUser.employeeInfo.Position.Position === 'FTE' ||
                                    dataService.properties.currentUser.employeeInfo.Position.Position === 'HR' ||
                                    dataService.properties.currentUser.employeeInfo.Admin)
                            )
                        };
                    }

                    function populateDay(day) {
                        // this function needs to find all of the subShifts that belong to the day that is passed in,
                        // and assign them to the day's subShifts array

                        // this returns the subShifts that are for the day that has been passed.
                        var relevantSubShifts = _.filter(subShifts, function(subShift) {
                            return Date.equals(new Date(subShift.Date), new Date(day.date));
                        });
                        // now we will walk through each of the relevant SubShifts and add them to the day's subShifts list.
                        _.each(relevantSubShifts, function(subShift) {
                            relatedShift = _.find(shifts, function(shift) {
                                return shift.Id === subShift.Shift.Id;
                            });
                            day.subShifts.push(newShift(subShift, relatedShift));
                        });
                    }

                    function populateWeeks() {
                            _.each($scope.arrays.weeks, function(week) {
                                _.each(week.days, function(day) {
                                    populateDay(day);
                                });
                            });
                        }
                        // This is where we start the whole thing rolling.
                    getSubShifts();
                }

            };
            ctrl.isToday = function(date) {
                var today = Date.today();
                date = new Date(date);
                if (Date.equals(date, today)) {
                    return true;
                } else {
                    return false;
                }
            };
            ctrl.isWeekend = function(date) {
                date = new Date(date)
                    .toString('dddd');
                if (date === 'Sunday' || date === 'Saturday') {
                    return true;
                } else {
                    return false;
                }
            };
            ctrl.refreshContent();
            $scope.$on('Refresh Content', function() {
                ctrl.refreshContent();
            });
        }
    ]);

    schedule.controller('AvailabilityCtrl', ['$scope', '$modal', 'dataService',
        'scheduleService',
        function($scope, $modal, dataService, scheduleService) {
            scheduleService.scheduleService();
            $scope.ctrlProperties.showAddShift = scheduleService.showAddShift;
            $scope.ctrlProperties.showAddSubShift = scheduleService.showAddSubShift;
            $scope.toggle = true;
            var createDays = function() {
                    var days = new Array(6);
                    for (var i = 0; i < days.length; i++) {
                        days[i] = {
                            day: Date.mon()
                                .addDays(i)
                                .toString('ddd'),
                            title: Date.mon()
                                .addDays(i)
                                .toString('dddd'),
                            visible: true,
                            shifts: []
                        };
                    }
                    return days;
                },
                getShifts = function() {
                    new dataService.getItems('Shift')
                        .top(999999999)
                        .select(['Id', 'Day', 'Current', 'ShiftGroup/Description',
                            'ShiftGroup/Id', 'Position/Position', 'Position/Id', 'StartTime',
                            'EndTime'
                        ])
                        .expand(['ShiftGroup', 'Position'])
                        .where({
                            and: [
                                ['Current', 'eq', '1'],
                                ['ShiftGroup/Id', 'eq', dataService.properties.currentSemester.Id]
                            ]
                        })
                        .execute(false)
                        .success(function(data) {
                            shifts = data.d.results;
                            getAvailabilities();
                        });
                },
                getAvailabilities = function() {
                    new dataService.getItems('Availability')
                        .top(999999999)
                        .select(['Employee/Id', 'Day', 'StartTime', 'EndTime', 'Id'])
                        .expand(['Employee'])
                        .where(['Current', 'eq', 1])
                        .execute(false)
                        .success(function(data) {
                            allAvailabilities = data.d.results;
                            getSchedules();
                        });
                },
                getSchedules = function() {
                    new dataService.getItems('Schedule')
                        .top(999999999)
                        .select(['Shift/StartTime', 'Shift/EndTime', 'Employee/Id'])
                        .expand(['Shift', 'Employee'])
                        .where(['Active', 'eq', 1])
                        .execute(false)
                        .success(function(data) {
                            allSchedules = data.d.results;
                            getEmployees();
                        });
                },
                getEmployees = function() {
                    new dataService.getItems('Employee')
                        .top(999999999)
                        .select(['Id', 'PreferredName', 'FirstName', 'LastName', 'PhoneNumber',
                            'EmailAddress', 'Picture', 'Position/Position', 'Position/Id',
                            'Area/Id', 'Area/Area'
                        ])
                        .expand(['Position', 'Area'])
                        .where({
                            and: [
                                ['Active', 'eq', 1],
                                ['Position/Position', 'ne ', 'FTE']
                            ]
                        })
                        .execute(false)
                        .success(function(data) {
                            for (var result in data.d.results) {
                                result = data.d.results[result];
                                result.hasSubmittedAvailability = false;
                                for (var availability in allAvailabilities) {
                                    availability = allAvailabilities[availability];
                                    if (availability.Employee.Id === result.Id) {
                                        result.hasSubmittedAvailability = true;
                                        break;
                                    }
                                }
                            }
                            ctrl.allActiveEmployees = data.d.results;
                            allActiveEmployees = data.d.results;
                            compileDays();
                        });
                },
                compileDays = function() {
                    for (var day in days) {
                        day = days[day];
                        for (var shift in shifts) {
                            checkShifts: {
                                var needsNewShift = true;
                                // foundEmployee = false;
                                shift = shifts[shift];
                                shift.StartTime = new Date(shift.StartTime);
                                shift.EndTime = new Date(shift.EndTime);
                                shift.Position = shift.Position.Position || shift.Position;
                                shift.Employees = [];
                                var tempDays = shift.Day.replace(/\s/g, '')
                                    .split('-');
                                for (var tempDay in tempDays) {
                                    tempDay = tempDays[tempDay];
                                    if (tempDay === day.day) {
                                        for (var dayShift in day.shifts) {
                                            dayShift = day.shifts[dayShift];

                                        }
                                        for (var employee in allActiveEmployees) {
                                            employee = allActiveEmployees[employee];
                                            if (shift.Position === employee.Position.Position ||
                                                (employee.Position.Position === 'Coordinator' &&
                                                    employee.Area.Area === 'SARAS' &&
                                                    shift.Position === 'Presenter') ||
                                                (employee.Position.Position === 'Coordinator' &&
                                                    employee.Area.Area === 'Technology' &&
                                                    shift.Position === 'Techy') ||
                                                (employee.Position.Position === 'Coordinator' &&
                                                    employee.Area.Area === 'Main' &&
                                                    shift.Position === 'Proctor')) {
                                                for (dayShift in day.shifts) {
                                                    dayShift = day.shifts[dayShift];
                                                    if (dayShift.StartTime.toString('HH:mm') === shift.StartTime.toString(
                                                            'HH:mm') &&
                                                        dayShift.EndTime.toString('HH:mm') === shift.EndTime.toString(
                                                            'HH:mm') &&
                                                        dayShift.Position === shift.Position) {
                                                        break checkShifts;
                                                    }
                                                }
                                                var notWorkingTheShift = !(checkSchedules(employee, shift));
                                                if (notWorkingTheShift) {
                                                    checkAvailabilities(employee, shift, tempDay);
                                                }
                                            }
                                        }
                                        if (needsNewShift) {
                                            day.shifts.push({
                                                StartTime: shift.StartTime,
                                                EndTime: shift.EndTime,
                                                Position: shift.Position,
                                                Employees: shift.Employees
                                            });
                                            delete shift.Employees;
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                checkSchedules = function(employee, shift) {
                    for (var schedule in allSchedules) {
                        schedule = allSchedules[schedule];
                        schedule.Shift.StartTime = new Date(schedule.Shift.StartTime);
                        schedule.Shift.EndTime = new Date(schedule.Shift.EndTime);
                        // alert(schedule.EmployeeId + ' === ' + employee.Id + '\n' + schedule.ShiftId + ' === ' + shift.Id);
                        if (schedule.Employee.Id === employee.Id) {
                            if ((schedule.Shift.StartTime.toString('HH:mm') === shift.StartTime.toString(
                                        'HH:mm') ||
                                    schedule.Shift.EndTime.toString('HH:mm') === shift.EndTime.toString(
                                        'HH:mm'))) {
                                return true;
                            }
                        }
                    }
                    return false;
                },
                checkAvailabilities = function(employee, shift, day) {
                    for (var availability in allAvailabilities) {
                        availability = allAvailabilities[availability];
                        availability.StartTime = new Date(availability.StartTime);
                        availability.EndTime = new Date(availability.EndTime);
                        // alert(day + ' === ' + availability.Day.substring(0,3));
                        if (availability.Employee.Id === employee.Id &&
                            availability.Day.substring(0, 3) === day &&
                            availability.StartTime.toString('HH:mm') <= shift.StartTime.toString(
                                'HH:mm') &&
                            availability.EndTime.toString('HH:mm') >= shift.EndTime.toString(
                                'HH:mm')) {
                            shift.Employees.push({
                                FirstName: employee.FirstName,
                                PreferredName: employee.PreferredName,
                                LastName: employee.LastName,
                                Picture: employee.Picture,
                                EmailAddress: employee.EmailAddress,
                                PhoneNumber: employee.PhoneNumber
                            });
                            break;
                        }
                    }
                },
                ctrl = this,
                days = createDays(),
                shifts = [],
                allActiveEmployees = [],
                allAvailabilities = [],
                allSchedules = [];
            getShifts();
            $scope.arrays.allAvailabilityDays = days;
            ctrl.activePanel = -1;
        }
    ]);

    schedule.controller('HrScheduleCtrl', ['$scope', '$modal', 'dataService',
        function($scope, $modal, dataService) {
            var ctrl = this;
            ctrl.slots = 1;
            ctrl.disableShiftList = true;
            ctrl.disableSubmitButton = true;
            new dataService.getItems('Area')
                .top(999999999)
                .execute(true)
                .success(function(data) {
                    $scope.arrays.areas = data.d.results;
                });
            new dataService.getItems('Track')
                .top(999999999)
                .execute(true)
                .success(function(data) {
                    $scope.arrays.tracks = data.d.results;
                });
            ctrl.subRequest = {
                '__metadata': {
                    type: 'SP.Data.SubShiftListItem'
                },
                ShiftId: '',
                RequesterId: dataService.properties.currentUser.employeeInfo.Id,
                Date: Date.today()
            };
            new dataService.getItems('Shift')
                .top(999999999)
                .where({
                    and: [
                        ['Current', 'eq', '1'],
                        ['ShiftGroup/Id', 'eq', dataService.properties.currentSemester.Id]
                    ]
                })
                .execute(false)
                .success(function(data) {
                    $scope.arrays.HRshifts = data.d.results;
                });
            ctrl.requestSub = function() {
                for (var i = 0; i < ctrl.slots; i++) {
                    // alert('this is request #' + (i + 1));
                    dataService.addItem('SubShift', ctrl.subRequest);
                }
                $modal({
                    show: true,
                    placement: 'center',
                    title: 'Notice',
                    content: 'The sub/s has been requested!'
                });
                $scope.$emit('Refresh Content');
            };
            ctrl.removeEmployee = function() {
                var item = {
                    '__metadata': {
                        'type': 'SP.Data.ScheduleListItem'
                    },
                    'Active': false
                };
                dataService.updateItem('Schedule', $scope.employee.ScheduleId, item,
                        '*')
                    .success(function() {
                        $modal({
                            show: true,
                            placement: 'center',
                            title: 'Notice',
                            content: 'That employee no longer works this shift!'
                        });
                        $scope.$emit('Refresh Content');
                    });
            };
            ctrl.assignShift = function(shiftId, employeeId) {
                var newSchedule = {
                    '__metadata': {
                        type: 'SP.Data.ScheduleListItem'
                    },
                    ShiftId: shiftId,
                    EmployeeId: employeeId
                };
                dataService.addItem('Schedule', newSchedule)
                    .success(function() {
                        $modal({
                            show: true,
                            placement: 'center',
                            title: 'Notice',
                            content: 'The shift has been assigned!'
                        });
                        $scope.$emit('Refresh Content');
                    });
            };
        }
    ]);

    schedule.controller('TodayCtrl', ['$scope', '$modal', 'dataService',
        'scheduleService',
        function($scope, $modal, dataService, scheduleService) {
            var ctrl = this;
            scheduleService.scheduleService();
            $scope.time1 = new Date();
            $scope.ctrlProperties.showAddShift = scheduleService.showAddShift;
            $scope.ctrlProperties.showAddSubShift = scheduleService.showAddSubShift;
            ctrl.queryDate = Date.today();
            ctrl.getTodaySchedule = function() {
                ///////////////
                // Variables //
                ///////////////

                // Definition
                var subShifts, shifts, schedules;

                // Initialization
                ctrl = this;
                subShifts = [];
                shifts = [];
                schedules = [];

                /////////////
                // Methods //
                /////////////

                // Definition
                var getSubShifts = function() {
                    new dataService.getItems('SubShift')
                        .top()
                        .select(
                            ['Id',
                                'Date',
                                'Substitute/Id',
                                'Substitute/LastName',
                                'Substitute/PreferredName',
                                'Substitute/Picture',
                                'Substitute/PhoneNumber',
                                'Substitute/EmailAddress',
                                'Requester/Id',
                                'Requester/LastName',
                                'Requester/PreferredName',
                                'Requester/Picture',
                                'Requester/PhoneNumber',
                                'Requester/EmailAddress',
                                'Shift/Id',
                                'Shift/StartTime',
                                'Shift/EndTime',
                                'NewRequest/Id'
                            ]
                        )
                        .expand(
                            ['Substitute',
                                'Shift',
                                'Requester',
                                'NewRequest',
                            ]
                        )
                        .where({
                            and: [
                                ['Date',
                                    'eq datetime',
                                    new Date(ctrl.queryDate)
                                    .toISOString()
                                ],
                                ['Active',
                                    'eq',
                                    1
                                ]
                            ]
                        })
                        .execute()
                        .success(function(data) {
                            subShifts = data.d.results;
                            getShifts();
                        });
                };
                var getSchedules = function() {
                    new dataService.getItems('Schedule')
                        .top()
                        .select(
                            ['Id',
                                'Shift/Id',
                                'Shift/Day',
                                'Employee/Id',
                                'Employee/LastName',
                                'Employee/PreferredName',
                                'Employee/Picture',
                                'Employee/PhoneNumber',
                                'Employee/EmailAddress'
                            ]
                        )
                        .expand(
                            ['Employee',
                                'Shift'
                            ]
                        )
                        .where({
                            and: [
                                ['Active',
                                    'eq',
                                    1
                                ], (
                                    'substringof(\'' +
                                    new Date(ctrl.queryDate)
                                    .toString('ddd') +
                                    '\', Shift/Day)'
                                )
                            ]
                        })
                        .execute()
                        .success(function(data) {
                            schedules = data.d.results;
                            getSubShifts();
                        });
                };
                var getShifts = function() {
                    new dataService.getItems('Shift')
                        .top()
                        .select(
                            ['Id',
                                'Day',
                                'Slots',
                                'Current',
                                'ShiftGroup/Description',
                                'ShiftGroup/Id',
                                'Position/Position',
                                'Position/Id',
                                'StartTime',
                                'EndTime'
                            ]
                        )
                        .expand(
                            ['ShiftGroup',
                                'Position'
                            ]
                        )
                        .where({
                            and: [
                                ['Current',
                                    'eq',
                                    1
                                ], ('substringof(\'' +
                                    new Date(ctrl.queryDate)
                                    .toString('ddd') +
                                    '\', Day)'
                                ), ['ShiftGroup/Id',
                                    'eq',
                                    dataService.properties.currentSemester.Id
                                ]
                            ]
                        })
                        .execute()
                        .success(function(data) {
                            shifts = data.d.results;
                            compileDayViewShifts();
                        });
                };
                var addEmployee = function(params) {
                    var employee = params.employee || {
                        PreferredName: 'No',
                        LastName: 'Employee',
                        Picture: '/media/missing.png',
                    };
                    var substitute = params.substitute || {
                        PreferredName: '',
                        LastName: '',
                        Picture: ''
                    };
                    var needsASub = params.needsASub || false;
                    return {
                        // original employee info
                        employeePreferredName: employee.PreferredName,
                        employeeLastName: employee.LastName,
                        employeePhoneNumber: employee.PhoneNumber,
                        employeeEmailAddress: employee.EmailAddress,
                        employeePicture: employee.Picture,
                        // substitute employee info
                        substitutePreferredName: substitute.PreferredName,
                        substituteLastName: substitute.LastName,
                        substitutePhoneNumber: substitute.PhoneNumber,
                        substituteEmailAddress: substitute.EmailAddress,
                        substitutePicture: substitute.Picture,
                        // false since there is a sub
                        needsASub: needsASub
                    };
                };
                var getShiftEmployees = function(shift) {
                    var relevantSchedules, relevantSubShifts, returnEmployeeArray;
                    returnEmployeeArray = [];
                    relevantSchedules = _.filter(schedules, function(schedule) {
                        return schedule.Shift.Id === shift.Id;
                    });
                    relevantSubShifts = _.filter(subShifts, function(subShift) {
                        return subShift.Shift.Id === shift.Id;
                    });
                    newRequestShifts = _.filter(relevantSubShifts, function(subShift) {
                        return subShift.NewRequest.Id !== undefined;
                    });
                    _.each(newRequestShifts, function(subShift) {
                        subShift.NewRequest = _.find(relevantSubShifts, function(foundSubShift) {
                            return foundSubShift.Id === subShift.NewRequest.Id;
                        });
                        relevantSubShifts = _.without(relevantSubShifts, subShift.NewRequest);
                    });
                    _.each(relevantSchedules, function(schedule) {
                        var substitute = _.find(relevantSubShifts, function(subShift) {
                            return subShift.Requester.Id === schedule.Employee.Id;
                        });
                        if (substitute !== undefined) {
                            relevantSubShifts = _.without(relevantSubShifts, substitute);
                            while (substitute.NewRequest.Id !== undefined) {
                                substitute = substitute.NewRequest;
                                substitute.isNewRequest = true;
                            }
                            if (substitute.Substitute.Id !== undefined) {
                                // we pass the basics, the original employee and the substitute
                                returnEmployeeArray.push(addEmployee({
                                    substitute: substitute.Substitute,
                                    employee: schedule.Employee,
                                }));
                            } else if (substitute.isNewRequest) {
                                // we are using the requester as the sub because he/she is the current sub until his/her request is filled
                                returnEmployeeArray.push(addEmployee({
                                    substitute: substitute.Requester,
                                    employee: schedule.Employee,
                                    needsASub: true
                                }));
                            } else {
                                // we pass the original employee and true because there is a sub request but no sub yet
                                returnEmployeeArray.push(addEmployee({
                                    employee: schedule.Employee,
                                    needsASub: true
                                }));
                            }
                        } else {
                            // we pass the original employee
                            returnEmployeeArray.push(addEmployee({
                                employee: schedule.Employee,
                            }));
                        }
                    });
                    while (returnEmployeeArray.length < shift.Slots) {
                        returnEmployeeArray.push(addEmployee({
                            needsASub: true
                        }));
                    }
                    _.each(relevantSubShifts, function(subShift) {
                        var extraEmployee = {
                            PreferredName: 'Extra',
                            LastName: '',
                            PhoneNumber: '',
                            EmailAddress: '',
                            Picture: 'media/missing.png'
                        };
                        while (subShift.NewRequest.Id !== undefined) {
                            subShift = subShift.NewRequest;
                            subShift.isNewRequest = true;
                        }
                        if (subShift.Substitute.Id !== undefined) {
                            // we pass the basics, the original employee and the substitute
                            returnEmployeeArray.push(addEmployee({
                                substitute: subShift.Substitute,
                                employee: extraEmployee
                            }));
                        } else if (subShift.isNewRequest) {
                            // we are using the requester as the sub because he/she is the current sub until his/her request is filled
                            returnEmployeeArray.push(addEmployee({
                                substitute: subShift.Requester,
                                employee: extraEmployee,
                                needsASub: true
                            }));
                        } else {
                            // we pass the original employee and true because there is a sub request but no sub yet
                            returnEmployeeArray.push(addEmployee({
                                employee: extraEmployee,
                                needsASub: true
                            }));
                        }
                    });
                    return returnEmployeeArray;
                };
                var compileDayViewShifts = function() {
                    var dayView = {
                        title: ctrl.queryDate.toString('dddd'),
                        day: ctrl.queryDate.toString('ddd'),
                        shifts: []
                    };
                    _.each(shifts, function(shift) {
                        var assignableEmployees = getShiftEmployees(shift);
                        var assignedShift = _.find(dayView.shifts, function(dayShift) {
                            return dayShift.startTime === shift.StartTime && dayShift.endTime === shift.EndTime && dayShift.position === shift.Position.Position;
                        });
                        if (assignedShift !== undefined) {
                            _.each(assignableEmployees, function(employee) {
                                assignedShift.employees.push(employee);
                            });
                        } else {
                            dayView.shifts.push({
                                startTime: shift.StartTime,
                                endTime: shift.EndTime,
                                position: shift.Position.Position,
                                employees: assignableEmployees
                            });
                        }
                    });
                    $scope.properties.today = dayView;
                };
                getSchedules();
            };
            ctrl.getTodaySchedule();
            // $scope.today = function() {
            //     ctrl.queryDate = new Date();
            // };
            // $scope.today();

            // Disable weekend selection
            $scope.disabled = function(date, mode) {
                return (mode === 'day' && (date.getDay() === 0));
            };

            $scope.open = function($event) {
                $event.preventDefault();
                $event.stopPropagation();

                $scope.opened = false;
            };

            $scope.dateOptions = {
                formatYear: 'yy',
                startingDay: 1
            };
        }
    ]);

    schedule.controller('MyScheduleCtrl', ['$scope', '$modal', 'dataService',
        function($scope, $modal, dataService) {
            var ctrl = this;
            ctrl.requestSub = function(shiftId, date) {
                var subRequest = {
                    '__metadata': {
                        type: 'SP.Data.SubShiftListItem'
                    },
                    ShiftId: shiftId,
                    RequesterId: dataService.properties.currentUser.employeeInfo.Id,
                    Date: date
                };
                dataService.addItem('SubShift', subRequest)
                    .success(function() {
                        $modal({
                            show: true,
                            placement: 'center',
                            title: 'Notice',
                            content: 'The sub has been requested!  You are responsible for this shift until a sub has taken it!'
                        });
                    });
                $scope.$emit('Refresh Content');
            };
            ctrl.cancelSubRequest = function() {
                var item = {
                    '__metadata': {
                        'type': 'SP.Data.SubShiftListItem'
                    },
                    'Active': false
                };
                dataService.updateItem('SubShift', $scope.shift.subShiftId, item, '*')
                    .success(function() {
                        $modal({
                            show: true,
                            placement: 'center',
                            title: 'Notice',
                            content: 'You are now responsible for this shift!'
                        });
                        $scope.$emit('Refresh Content');
                    });
            };
            ctrl.requestSubOfSub = function(shiftId, date) {
                var subRequest = {
                        '__metadata': {
                            type: 'SP.Data.SubShiftListItem'
                        },
                        ShiftId: shiftId,
                        RequesterId: dataService.properties.currentUser.employeeInfo.Id,
                        Date: date
                    },
                    item = {
                        '__metadata': {
                            type: 'SP.Data.SubShiftListItem'
                        }
                    };
                dataService.addItem('SubShift', subRequest)
                    .success(function(data) {
                        item.NewRequestId = data.d.Id;
                        dataService.updateItem('SubShift', $scope.shift.subShiftId, item,
                                '*')
                            .success(function() {
                                $modal({
                                    show: true,
                                    placement: 'center',
                                    title: 'Notice',
                                    content: 'The sub has been requested!  You are responsible for this shift until a sub has taken it!'
                                });
                                $scope.$emit('Refresh Content');
                            });
                    });
            };
            ctrl.cancelSubOfSubRequest = function(subShiftId, subOfSubShiftId) {
                dataService.updateItem('SubShift', subOfSubShiftId, {
                        '__metadata': {
                            type: 'SP.Data.SubShiftListItem'
                        },
                        Active: false
                    }, '*')
                    .success(function() {
                        dataService.updateItem('SubShift', subShiftId, {
                                '__metadata': {
                                    type: 'SP.Data.SubShiftListItem'
                                },
                                NewRequestId: null
                            }, '*')
                            .success(function() {
                                $modal({
                                    show: true,
                                    placement: 'center',
                                    title: 'Notice',
                                    content: 'You are now responsible for this shift!'
                                });
                                $scope.$emit('Refresh Content');
                            });
                    });
            };
        }
    ]);

    schedule.controller('SubShiftCtrl', ['$scope', '$modal', 'dataService',
        function($scope, $modal, dataService) {
            var ctrl = this;
            ctrl.removeSubShift = function() {
                var shift = $scope.shift,
                    item = {
                        '__metadata': {
                            'type': 'SP.Data.SubShiftListItem'
                        },
                        'Active': false
                    };
                dataService.updateItem('SubShift', shift.SubShiftId, item, '*')
                    .success(function() {
                        $modal({
                            show: true,
                            placement: 'center',
                            title: 'Notice',
                            content: 'You are now responsible for this shift!'
                        });
                        $scope.$emit('Refresh Content');
                    })
                    .error(function(data) {
                        $modal({
                            show: true,
                            placement: 'center',
                            title: 'Notice',
                            content: JSON.stringify(data, null, '\t')
                        });
                    });
            };
            ctrl.takeSubShift = function(subShiftId, shiftId, subShiftDate) {
                // var shift = $scope.shift,
                var item = {
                    '__metadata': {
                        'type': 'SP.Data.SubShiftListItem'
                    },
                    'SubstituteId': dataService.properties.currentUser.employeeInfo.Id
                };
                new dataService.getItems('Schedule')
                    .select(['Shift/Id', 'Employee/Id'])
                    .expand(['Shift', 'Employee'])
                    .where({
                        and: [
                            ['Shift/Id', 'eq', shiftId],
                            ['Employee/Id', 'eq', dataService.properties.currentUser.employeeInfo
                                .Id
                            ],
                            ['Active', 'eq', 1]
                        ]
                    })
                    .execute(false)
                    .success(function(data) {
                        if (data.d.results.length > 0) {
                            $modal({
                                show: true,
                                placement: 'center',
                                title: 'Notice',
                                content: 'You already work this shift!'
                            });
                        } else {
                            new dataService.getItems('SubShift')
                                .select(['Shift/Id', 'Substitute/Id'])
                                .expand(['Shift', 'Substitute'])
                                .where({
                                    and: [
                                        ['Shift/Id', 'eq', shiftId],
                                        ['Substitute/Id', 'eq', dataService.properties.currentUser.employeeInfo
                                            .Id
                                        ],
                                        ['Date', 'eq datetime', new Date(subShiftDate)
                                            .toISOString()
                                        ],
                                        ['Active', 'eq', 1]
                                    ]
                                })
                                .execute(false)
                                .success(function(data) {
                                    if (data.d.results.length > 0) {
                                        $modal({
                                            show: true,
                                            placement: 'center',
                                            title: 'Notice',
                                            content: 'You are already substituting for this shift!'
                                        });
                                    } else {
                                        dataService.updateItem('SubShift', subShiftId, item, '*')
                                            .success(function() {
                                                $modal({
                                                    show: true,
                                                    placement: 'center',
                                                    title: 'Notice',
                                                    content: 'You are now responsible for this shift!'
                                                });
                                                $scope.$emit('Refresh Content');
                                            })
                                            .error(function(data) {
                                                $modal({
                                                    show: true,
                                                    placement: 'center',
                                                    title: 'Notice',
                                                    content: JSON.stringify(data, null, '\t')
                                                });
                                            });
                                    }
                                });
                        }
                    });
            };
        }
    ]);

    schedule.controller('ShiftEditCtrl', ['$scope', '$modal', 'dataService',
        function($scope, $modal, dataService) {
            var ctrl = this,
                shift = $scope.shift,
                tmp = '';
            // init methods
            ctrl.workDays = [];
            ctrl.newShift = {
                '__metadata': {
                    'type': 'SP.Data.ShiftListItem'
                },
                Day: '',
                temp: shift.Day.replace(/\s/g, '')
                    .split('-'),
                Slots: shift.Slots,
                StartTime: shift.StartTime,
                EndTime: shift.EndTime,
                PositionId: shift.Position.Id,
                ShiftGroupId: shift.ShiftGroup.Id
            };
            for (var i = 0; i < 6; i++) {
                tmp = Date.mon()
                    .addDays(i);
                ctrl.workDays[i] = {
                    value: tmp.toString('ddd'),
                    day: tmp.toString('dddd')
                };
            }
            ctrl.updateShift = function() {
                for (var i = 0; i < ctrl.newShift.temp.length; i++) {
                    ctrl.newShift.Day += (i === ctrl.newShift.temp.length - 1) ? ctrl.newShift
                        .temp[i].substr(0, 3) : ctrl.newShift.temp[i].substr(0, 3) + ' - ';
                }
                delete ctrl.newShift.temp;
                dataService.updateItem('Shift', shift.Id, ctrl.newShift, shift.__metadata
                        .etag)
                    .success(function() {
                        $modal({
                            show: true,
                            placement: 'center',
                            title: 'Notice',
                            content: 'The shift has been updated!'
                        });
                        $scope.$emit('Refresh Content');
                    });
            };
            ctrl.deleteShift = function() {
                new dataService.getItems('Schedule')
                    .select(['Id', 'Shift/Id'])
                    .expand(['Shift'])
                    .where({
                        and: [
                            ['Active', 'eq', 1],
                            ['Shift/Id', 'eq', shift.Id]
                        ]
                    })
                    .execute(false)
                    .success(function(data) {
                        var schedules = data.d.results,
                            schedulesCounter = 0,
                            inactivateSchedule = function(schedule) {
                                if (schedulesCounter === schedules.length) {
                                    dataService.updateItem('Shift', shift.Id, {
                                            '__metadata': {
                                                'type': 'SP.Data.ShiftListItem'
                                            },
                                            Current: false
                                        }, shift.__metadata.etag)
                                        .success(function() {
                                            $modal({
                                                show: true,
                                                placement: 'center',
                                                title: 'Notice',
                                                content: 'The shift has been deleted!'
                                            });
                                            $scope.$emit('Refresh Content');
                                        });
                                } else {
                                    dataService.updateItem('Schedule', schedule.Id, {
                                            '__metadata': {
                                                'type': 'SP.Data.ScheduleListItem'
                                            },
                                            Active: false
                                        }, shift.__metadata.etag)
                                        .success(function() {
                                            schedulesCounter++;
                                            inactivateSchedule(schedulesCounter[schedulesCounter]);
                                        });
                                }
                            };
                        inactivateSchedule(schedules[schedulesCounter]);
                    });
                // dataService.deleteItem('Shift', id)
                //  .success(function(data) {
                //      $modal({
                //          show: true,
                //          placement: 'center',
                //          title: 'Notice',
                //          content: 'The shift has been deleted!'
                //      });
                //      $scope.$emit('Refresh Content');
                //  })
                //  .error(function(data) {
                //      $scope.arrays.errors.push(data);
                //  });
            };
            ctrl.takeShift = function(shiftId) {
                var newSchedule = {
                    '__metadata': {
                        type: 'SP.Data.ScheduleListItem'
                    },
                    ShiftId: shiftId,
                    EmployeeId: dataService.properties.currentUser.employeeInfo.Id
                };
                new dataService.getItems('Schedule')
                    .select(['Shift/Id', 'Employee/Id'])
                    .expand(['Shift', 'Employee'])
                    .where({
                        and: [
                            ['Shift/Id', 'eq', shiftId],
                            ['Employee/Id', 'eq', dataService.properties.currentUser.employeeInfo
                                .Id
                            ],
                            ['Active', 'eq', 1]
                        ]
                    })
                    .execute(false)
                    .success(function(data) {
                        if (data.d.results.length > 0) {
                            $modal({
                                show: true,
                                placement: 'center',
                                title: 'Notice',
                                content: 'You already work this shift!'
                            });
                        } else {
                            dataService.addItem('Schedule', newSchedule)
                                .success(function() {
                                    $modal({
                                        show: true,
                                        placement: 'center',
                                        title: 'Notice',
                                        content: 'You are now responsible to work this shift!'
                                    });
                                    $scope.$emit('Refresh Content');
                                });
                        }
                    });
            };
        }
    ]);

    schedule.controller('ShiftCreationCtrl', ['$scope', '$modal', 'dataService',
        function($scope, $modal, dataService) {
            var ctrl = this,
                newItem = {};
            $scope.newShift = {
                '__metadata': {
                    type: 'SP.Data.ShiftListItem'
                },
                Day: '',
                Current: true
            };
            ctrl.addShift = function() {
                for (var i = 0; i < $scope.newShift.temp.length; i++) {
                    $scope.newShift.Day += (i === $scope.newShift.temp.length - 1) ?
                        $scope.newShift.temp[i].substr(0, 3) : $scope.newShift.temp[i].substr(
                            0, 3) + ' - ';
                }
                delete $scope.newShift.temp;
                for (var attribute in $scope.newShift) {
                    if (attribute.indexOf('Id') > 0) {
                        $scope.newShift[attribute] = parseInt($scope.newShift[attribute]);
                    }
                }
                newItem = $scope.newShift;
                dataService.addItem('Shift', newItem)
                    .success(function() {
                        $modal({
                            show: true,
                            placement: 'center',
                            title: 'Notice',
                            content: 'The shift has been added!'
                        });
                    })
                    .error(function(data) {
                        $scope.arrays.errors.push(data);
                    });

                $scope.newShift = {
                    '__metadata': {
                        type: 'SP.Data.ShiftListItem'
                    },
                    Day: '',
                    Current: true,
                    StartTime: new Date(),
                    EndTime: new Date(),
                };
                $scope.$emit('Refresh Content');
            };
        }
    ]);

    schedule.controller('MyAvailabilityCtrl', ['$scope', '$modal', 'dataService',
        function($scope, $modal, dataService) {
            var ctrl = this;
            ctrl.newAvailability = {
                '__metadata': {
                    type: 'SP.Data.AvailabilityListItem'
                },
                Day: $scope.day.day,
                StartTime: $scope.availability.startTime || '',
                EndTime: $scope.availability.endTime || '',
                EmployeeId: dataService.properties.currentUser.employeeInfo.Id
            };
            ctrl.updateAvailability = function() {
                delete ctrl.newAvailability.EmployeeId;
                delete ctrl.newAvailability.Day;
                dataService.updateItem('Availability', $scope.availability.Id, ctrl.newAvailability,
                        '*')
                    .success(function() {
                        $modal({
                            show: true,
                            placement: 'center',
                            title: 'Notice',
                            content: 'The shift has been updated!'
                        });
                        $scope.$emit('Refresh Content');
                    })
                    .error(function(data) {
                        $modal({
                            show: true,
                            placement: 'center',
                            title: 'Notice',
                            content: JSON.stringify(data, null, '\t')
                        });
                    });
            };
            ctrl.removeAvailability = function() {
                dataService.deleteItem('Availability', $scope.availability.Id)
                    .success(function() {
                        $modal({
                            show: true,
                            placement: 'center',
                            title: 'Notice',
                            content: 'The availability has been removed!'
                        });
                        $scope.$emit('Refresh Content');
                    });
            };
        }
    ]);
    schedule.controller('AddAvailability', ['$scope', '$modal', 'dataService',
        function($scope, $modal, dataService) {
            var ctrl = this;
            ctrl.newAvailability = {
                '__metadata': {
                    type: 'SP.Data.AvailabilityListItem'
                },
                Day: $scope.day.day,
                StartTime: '',
                EndTime: '',
                EmployeeId: dataService.properties.currentUser.employeeInfo.Id
            };
            ctrl.addAvailability = function() {
                ctrl.newAvailability.StartTime = ctrl.newAvailability.StartTime.toISOString();
                ctrl.newAvailability.EndTime = ctrl.newAvailability.EndTime.toISOString();
                dataService.addItem('Availability', ctrl.newAvailability)
                    .success(function() {
                        $modal({
                            show: true,
                            placement: 'center',
                            title: 'Notice',
                            content: 'The availability has been added!'
                        });
                        $scope.$emit('Refresh Content');
                    });
            };
        }
    ]);
    schedule.config(function($datepickerProvider) {
        angular.extend($datepickerProvider.defaults, {
            dateFormat: 'd - MMM - yyyy',
            startWeek: 0
        });
    });
    schedule.config(function($timepickerProvider) {
        angular.extend($timepickerProvider.defaults, {
            timeType: 'date',
            length: 7
        });
    });
})();
