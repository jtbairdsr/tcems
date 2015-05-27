/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-22 07:04:06
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-27 16:17:58
 */

'use strict';

angular.module('fte-tools').controller('FTEToolsController', function(
	$scope, currentUser, areaPositions, areas
) {
	var ctrlAreaId = currentUser.data.emp.AreaId,
		aps = [];

	function toggle(prop) {
		this[prop] = !this[prop];
		this.object[prop] = !this[prop];

		// this.object.update();
	}

	function createApsList(id) {
		$scope.data.aId = id;
		var area = _.find(areas.list, function(a) {
			return a.Id === id;
		});
		$scope.data.area = {
			id: id,
			object: area,
			desc: area.Description,
			ar: area.ar,
			rr: area.rr,
			acl: area.acl,
			rcl: area.rcl,
			av: area.av,
			rv: area.rv,
			listName: 'Area',
			active: true,
			toggle: toggle
		};
		aps.splice(0, aps.length);
		_.each(areaPositions.list, function(ap) {
			if (ap.AreaId === id) {
				aps.push({
					id: ap.Id,
					pos: ap.Position,
					a: ap.Area,
					cSApps: ap.cSApps,
					hiring: ap.hiring,
					active: false,
					ar: ap.ar,
					rr: ap.rr,
					acl: ap.acl,
					rcl: ap.rcl,
					av: ap.av,
					rv: ap.rv,
					object: ap,
					toggle: toggle
				});
			}
		});
	}

	// Assign variables to $scope
	$scope.data = {
		aps: aps
	};
	$scope.changeArea = createApsList;
	$scope.appViews = 'src/modules/applications/views/';
	$scope.fteViews = 'src/modules/fte-tools/views/';

	createApsList(ctrlAreaId);
});
