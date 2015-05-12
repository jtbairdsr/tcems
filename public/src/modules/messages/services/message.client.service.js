/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-04 22:53:21
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-07 12:57:48
 */

'use strict';

angular.module('messages').service('messageService', function(
	$q, Message, SentMessage, currentUser, unreadMessages, sentMessages,
	userMessages, messages, userSentMessages, policies
) {
	var that = this;

	that.refresh = function() {
		var deffered = $q.defer();
		Message.query().then(function() {
			SentMessage.query().then(function() {
				that.setUnreadMessageCount();
				that.setUserSentMessages();
				deffered.resolve();
			});
		});
		return deffered.promise;
	};
	that.setUnreadMessageCount = function() {
		unreadMessages.count = 0;
		userMessages.list.splice(0, userMessages.list.length);
		_.each(sentMessages.list, function(mess) {
			if (mess.Employee.Id === currentUser.data.Id) {
				userMessages.list.push(mess);
				if (Date.today().compareTo(mess.Message.ExpDate) < 1 &&
					!mess.Read && mess.Message.Mandatory) {
					unreadMessages.count++;
				}
			}
		});
	};
	that.setUserSentMessages = function() {
		policies.list.splice(0, policies.list.length);
		userSentMessages.list.splice(0, userSentMessages.list.length);
		var positionTest = /FTE|HR/;
		_.each(messages.list, function(mess) {
			if (currentUser.data.Area.Description === 'Campus' && positionTest.test(currentUser.data.Position.Description)) {
				if (mess.From.Area.Description === 'Campus' && positionTest.test(mess.From.Position.Description)) {
					userSentMessages.list.push(mess);
				}
			} else {
				if (currentUser.data.Id === mess.FromId) {
					userSentMessages.list.push(mess);
				}
			}
			if ((mess.AreaId === currentUser.data.AreaId || mess.Area.Description === 'Director') &&
				mess.Active && mess.Policy) {
				policies.list.push(mess);
			}
		});
		userSentMessages.list.activePanel = -1;
	};

	return this;
});
