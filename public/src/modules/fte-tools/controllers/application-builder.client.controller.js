/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-21 19:29:15
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-21 19:40:55
 */

'use strict';

angular.module('fte-tools').controller('ApplicationBuilderController', function(
	$scope, areaPositions, currentUser
) {
	var aps = [];
	_.each(areaPositions.list, function(ap) {
		if (ap.AreaId === currentUser.data.emp.AreaId) {
			aps.push({
				id: ap.Id,
				pos: ap.Position,
				a: ap.Area,
				cSApps: ap.cSApps,
				hiring: ap.hiring,
				active: false
			});
		}
	});
	aps[0].active = true;
	$scope.aps = aps;
	$scope.activateAP = function(id) {
		_.each(aps, function(ap) {
			ap.active = (ap.id === id);
		});
	};
});
