/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-24 09:41:42
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-04 23:45:39
 */

'use strict';

var app = angular.module('messages');

app.value('unreadMessages', {
	count: 0
}); // Global value for the total number of unread mandatory messages
app.value('messages', {
	list: []
});
app.value('sentMessages', {
	list: []
});
app.value('userMessages', {
	list: []
});
app.value('userSentMessages', {
	list: []
});
app.value('policies', {
	list: []
});
