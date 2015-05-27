/*
 * @Author: Jonathan Baird
 * @Date:   2015-05-20 18:42:05
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-22 07:31:53
 */

'use strict';

angular.module('applications').controller('ApplicationsController', function(
	$scope, areas, areaPositions, currentUser
) {
	$scope.as = [];
	$scope.aPs = [];
	$scope.appViews = 'src/modules/applications/views/';

	var as = $scope.as,
		aPs = $scope.aPs;

	_.each(areas.list, function(a) {
		var hAPs = _.filter(areaPositions.list, function(aP) {
			return aP.hiring && aP.AreaId === a.Id;
		});
		if (hAPs.length > 0 && !/Director/.test(a.Description)) {
			as.push({
				id: a.Id,
				desc: a.Description,
				active: false
			});
		}
	});
	_.each(areaPositions.list, function(aP) {
		if (!/FTE/.test(aP.Position.Description)) {
			aPs.push({
				id: aP.Id,
				aId: aP.AreaId,
				posId: aP.PositionId,
				desc: aP.Position.Description,
				active: false,
				hiring: aP.hiring
			});
		}
	});

	$scope.activateA = function(id) {
		_.each(as, function(a) {
			if (a.id === id) {
				a.active = true;
			} else {
				a.active = false;
			}
		});
	};
	$scope.activateAP = function(id) {
		_.each(aPs, function(aP) {
			if (aP.id === id) {
				aP.active = true;
			} else {
				aP.active = false;
			}
		});
	};
	$scope.saveEmpData = function() {
		if (currentUser.data.emp.Id) {
			currentUser.data.emp.add();
		} else {
			currentUser.data.emp.update();
		}
	};
});
