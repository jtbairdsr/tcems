/*
 * @Author: Jonathan Baird
 * @Date:   2014-10-28 15:04:10
 * @Last Modified 2014-11-18
 * @Last Modified time: 2015-01-15 10:44:56
 */
(function() {
	var app = angular.module('App');
	/////////////////////
	// App Controllers //
	/////////////////////
	app.controller('UserCtrl', ['$location', '$scope', 'dataService',
		function($location, $scope, dataService) {
			var ctrl = this;
			ctrl.acknowledgedRead = function(Id) {
				dataService.updateItem('Message', Id, {
						'__metadata': {
							'type': 'SP.Data.MessageListItem'
						},
						'Viewed': true,
						'ViewedDate': Date.today()
							.toISOString()
					}, '*')
					.success(function(data) {
						new dataService.getItems('Message')
							.select(['Id', 'From/PreferredName', 'From/LastName', 'From/EmailAddress', 'From/Id', 'To/PreferredName', 'To/LastName', 'To/EmailAddress', 'To/Id', 'Subject', 'Message', 'Manditory', 'ExpDate', 'Viewed', 'ViewedDate', 'Semester/Id'])
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
								$scope.properties.unreadMessages = 0;
								for (var i = 0; i < data.d.results.length; i++) {
									if (data.d.results[i].Manditory && !data.d.results[i].Viewed) {
										$scope.properties.unreadMessages++;
									}
								}
								data.d.results.activePanel = -1;
								$scope.panels = data.d.results;
							});
					});
			};
		}
	]);
	app.controller('MessageCtrl', ['$scope', '$modal', 'dataService',
		function($scope, $modal, dataService) {
			var ctrl = this;
			ctrl.toList = [];
			ctrl.newMessage = {
				__metadata: {
					'type': 'SP.Data.MessageListItem'
				},
				FromId: dataService.properties.currentUser.employeeInfo.Id,
				ToId: '',
				Subject: '',
				Message: '',
				Manditory: false,
				ExpDate: Date.today()
					.addWeeks(1),
				Viewed: false,
				Active: true,
				SemesterId: dataService.properties.currentSemester.Id
			};
			ctrl.positionFTE = _.find($scope.arrays.allPositions, function(position){
				return position.Position === 'FTE';
			});
			console.log(ctrl.positionFTE);
			ctrl.sendNewMessage = function() {
				var toListCounter = 0,
					i = 0,
					createIndividualMessage = function(message) {
						if (toListCounter === ctrl.toList.length) {
							$modal({
								show: true,
								placement: 'center',
								title: 'Notice',
								content: 'The message has been sent!'
							});
						} else {
							ctrl.newMessage.ToId = message.Id || message;
							dataService.addItem('Message', ctrl.newMessage)
								.success(function(data) {
									toListCounter++;
									createIndividualMessage(ctrl.toList[toListCounter]);
								});
						}
					};
				do {
					if (ctrl.toList[i] === 'all') {
						ctrl.toList = $scope.arrays.employees;
						i = ctrl.toList.length;
					}
					i++;
				} while (i < ctrl.toList.length);
				ctrl.newMessage.ExpDate = ctrl.newMessage.ExpDate.toISOString();
				createIndividualMessage(ctrl.toList[toListCounter]);
			};

		}
	]);


})();
