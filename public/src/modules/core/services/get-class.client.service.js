/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-29 15:46:38
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-04-29 15:51:22
 */

'use strict';

angular.module('core').value('getClass', function(object) {
	return Object.prototype.toString.call(object).slice(8, -1);
});
