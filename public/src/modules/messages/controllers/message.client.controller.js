/*
 * @Author: Jonathan Baird
 * @Date:   2014-10-28 15:04:10
 * @Last Modified 2014-11-18
 * @Last Modified time: 2015-05-14 15:58:52
 */

'use strict';

angular.module('messages').controller('MessageController', function(
	$scope, Message, messageService, employees, positions, areas, currentUser,
	unreadMessages
) {
	$scope.tab = 'new';
	$scope.createNewMessage = function() {
		$scope.newMessage = true;
	};
	var that = this;
	that.messViews = 'src/modules/messages/views/';
	that.newMessage = new Message({
		FromId: currentUser.data.Id,
		ExpDate: Date.today()
			.addWeeks(1),
		DueDate: Date.today()
			.addWeeks(1),
		AreaId: currentUser.data.Area.Id
	});
	that.positionFTE = _.find(positions.list, function(position) {
		return position.Position === 'FTE';
	});
	that.areaDirector = _.find(areas.list, function(area) {
		return area.Description === 'Director';
	});

	function newEmpItem(emp) {
		return {
			Id: emp.Id,
			id: emp.Id,
			desc: emp.toString('name'),
			pName: emp.PreferredName,
			fName: emp.FirstName,
			lName: emp.LastName,
			pos: emp.Position.Description,
			img: emp.Picture,
			add: false,
			admin: emp.Admin,
			aId: emp.AreaId,
			pId: emp.PositionId
		};
	}
	that.recipients = [];
	that.admins = [];
	that.emps = [];
	that.FTEs = [];
	that.areas = [];
	_.each(employees.list, function(emp) {
		if (currentUser.data.Admin || currentUser.data.Area.Description === 'Director') {
			if (emp.Position.Id === that.positionFTE.Id) {
				that.FTEs.push(newEmpItem(emp));
			} else if (emp.Active) {
				that.emps.push(newEmpItem(emp));
			}
			if (emp.Admin || emp.Position.Id === that.positionFTE.Id) {
				that.admins.push(newEmpItem(emp));
			}
		} else {
			if (emp.Position.Id === that.positionFTE.Id) {
				that.FTEs.push(newEmpItem(emp));
			} else if (emp.Active && emp.AreaId === currentUser.data.AreaId) {
				that.emps.push(newEmpItem(emp));
			}
		}
	});
	_.each(areas.list, function(a) {
		that.areas.push({
			id: a.Id,
			desc: a.Description
		});
	});
	that.toggleRecipient = function(emp) {
		var temp = _.find(that.recipients, function(recip) {
			return recip.id === emp.id;
		});
		if (temp) {
			emp.add = false;
			that.recipients = _.without(that.recipients, emp);
		} else {
			that.recipients.push(emp);
		}
	};
	that.clearMessage = function() {
		that.newMessage = new Message({
			FromId: currentUser.data.Id,
			ExpDate: Date.today()
				.addWeeks(1),
			DueDate: Date.today()
				.addWeeks(1),
			AreaId: currentUser.data.Area.Id
		});
	};
	that.clearRecips = function() {
		_.each(that.recipients, function(r) {
			r.add = false;
		});
		that.recipients = [];
		$scope.recips = !$scope.recips;
	};
	that.setUniversalPolicy = function() {
		if (that.newMessage.UniversalPolicy) {
			that.newMessage.AreaId = '';
		} else {
			that.newMessage.AreaId = that.areaDirector.Id;
		}
	};
	that.setPolicy = function() {
		if (!that.newMessage.Policy) {
			that.newMessage.Mandatory = true;
		}
	};
	that.readMessage = function(message) {
		message.read();
		if (message.Message.Mandatory) {
			unreadMessages.count--;
		}
	};
	that.saveMessage = function(message) {
		if (message.Edit) {
			message.update();
		} else {
			message.Edit = true;
		}
	};
	that.removeMessage = function(message) {
		if (message.Edit) {
			message.deactivate()
				.then(function() {
					that.refreshContent();
				});
		} else {
			message.Edit = true;
		}
	};
	that.positionFilter = function(position) {
		return position.Id !== that.positionFTE.Id;
	};
	that.areaFilter = function(area) {
		return area.Id !== that.areaDirector.Id;
	};
	that.positionEmployees = function(pId, aId) {
		aId = aId || currentUser.data.Area.Id;
		that.recipients.splice(0, that.recipients.length);
		if (pId === that.positionFTE.Id) {
			_.each(that.FTEs, function(emp) {
				if (emp.pId === pId && emp.aId === aId) {
					emp.add = true;
					that.recipients.push(emp);
				}
			});
		} else {
			_.each(that.emps, function(emp) {
				if (emp.pId === pId && emp.aId === aId) {
					emp.add = true;
					that.recipients.push(emp);
				}
			});
		}
	};
	that.areaEmployees = function(id) {
		id = id || currentUser.data.Area.Id;
		that.recipients.splice(0, that.recipients.length);
		_.each(that.emps, function(emp) {
			if (emp.aId === id) {
				emp.add = true;
				that.recipients.push(emp);
			}
		});
		_.each(that.FTEs, function(emp) {
			if (emp.aId === id) {
				emp.add = true;
				that.recipients.push(emp);
			}
		});
	};
	that.allEmployees = function() {
		that.recipients = _.union(that.emps, that.FTEs);
		_.each(that.recipients, function(r) {
			r.add = true;
		});
	};
	that.sendNewMessage = function() {
		if (that.newMessage.Policy) {
			that.newMessage.Mandatory = true;
		}
		if (that.newMessage.DueDate.compareTo(that.newMessage.ExpDate) > 0) {
			that.newMessage.DueDate = that.newMessage.ExpDate;
		}
		that.newMessage.send(that.recipients).then(function() {
			that.refreshContent();
		});
	};
	that.refreshContent = function() {
		messageService.refresh();
	};
});
