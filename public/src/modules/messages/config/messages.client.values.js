/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-24 09:41:42
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-01 09:06:33
 */

'use strict';

var app = angular.module('messages');

app.value('unreadMessages', {}); // Global value for the total number of unread mandatory messages
app.value('messages', {
	list: []
});
app.value('sentMessages', {
	list: []
});
