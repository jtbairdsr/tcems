/*
 * @Author: Jonathan Baird
 * @Date:   2014-10-28 15:04:10
 * @Last Modified 2014-11-18
 * @Last Modified time: 2015-01-28 21:42:52
 */
(function() {
	var app = angular.module('App');

	app.controller('MessageCtrl', ['$scope', '$log', '$modal', 'dataService', 'generalService', 'employeeFilterFilter',
		function($scope, $log, $modal, dataService, generalService, employeeFilterFilter) {
			$scope.tab = 'new';
			$scope.$log = $log;
			var CLASSES = dataService.classes,
				DATA = generalService.data,
				PROPERTIES = generalService.properties,
				REFRESH = dataService.refresh;
			var ctrl = this;
			ctrl.newMessage = new CLASSES.Message({
				FromId: generalService.properties.currentUser.Id,
				ExpDate: Date.today()
					.addWeeks(1),
				DueDate: Date.today()
					.addWeeks(1),
				AreaId: PROPERTIES.defaultArea.Id
			});
			ctrl.activeEmloyees = _.filter(DATA.employees, function(employee) {
				return employee.Active;
			});
			ctrl.employees = employeeFilterFilter(DATA.employees, {
				inactive: true,
				area: true
			});
			ctrl.positionFTE = _.find(DATA.positions, function(position) {
				return position.Position === 'FTE';
			});
			ctrl.areaDirector = _.find(DATA.areas, function(area) {
				return area.Description === 'Director';
			});
			ctrl.FTEs = _.filter(DATA.employees, function(employee) {
				return employee.Position.Id === ctrl.positionFTE.Id ||
					employee.Admin;
			});
			ctrl.setUniversalPolicy = function() {
				if (ctrl.newMessage.UniversalPolicy) {
					ctrl.newMessage.AreaId = '';
				} else {
					ctrl.newMessage.AreaId = ctrl.areaDirector.Id;
				}
			};
			ctrl.setPolicy = function() {
				if (!ctrl.newMessage.Policy) {
					ctrl.newMessage.Mandatory = true;
				}
			};
			ctrl.readMessage = function(message) {
				message.read();
				if (message.Message.Mandatory) {
					PROPERTIES.unreadMessages--;
				}
			};
			ctrl.saveMessage = function(message) {
				if (message.Edit) {
					message.update();
				} else {
					message.Edit = true;
				}
			};
			ctrl.positionFilter = function(position) {
				return position.Id !== ctrl.positionFTE.Id;
			};
			ctrl.areaFilter = function(area) {
				return area.Id !== ctrl.areaDirector.Id;
			};
			ctrl.positionEmployees = function(positionId, areaId) {
				areaId = areaId || PROPERTIES.defaultArea.Id;
					ctrl.newMessage.Recipients = _.filter(ctrl.activeEmloyees, function(employee) {
						return employee.PositionId === positionId && employee.AreaId === areaId;
					});
			};
			ctrl.areaEmployees = function(Id) {
				ctrl.newMessage.Recipients = _.filter(ctrl.activeEmloyees, function(employee) {
					return 	employee.Area.Id === Id;
				});
			};
			ctrl.sendNewMessage = function() {
				if (ctrl.newMessage.Policy) {
					ctrl.newMessage.Mandatory = true;
				}
				ctrl.newMessage.send().then(function() {
					REFRESH.messages(true);
				});
			};
		}
	]);


})();
