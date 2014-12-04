function createSubShiftViewData() {

	////////////////////////////
	// subShiftView Variables //
	////////////////////////////

	// Declaration
	// TODO: declare global(to the subShiftView function) variables...
	var subShifts, shifts, weeks;

	// Initialization
	// TODO: initialize global(to the subShiftView function) variables...
	subShifts = [];
	shifts = [];
	weeks = createWeeks(3);
	//////////////////////////
	// subShiftView Methods //
	//////////////////////////
	function getSubShifts() {
		new dataService.getItems('SubShift')
			.top()
			.select(
				// SubShift Info
				['Id',
				 'Date',
				 'Shift/Id',
				 // Requester Info
				 'Requester/Id',
				 'Requester/PreferredName',
				 'Requester/LastName',
				 'Requester/Picture',
				 'Requester/EmailAddress',
				 'Requester/PhoneNumber',
				 // Substitute Info
				 'Substitute/Id',
				 'Substitute/PreferredName',
				 'Substitute/LastName',
				 'Substitute/Picture',
				 'Substitute/EmailAddress',
				 'Substitute/PhoneNumber'
				]
			)
			.expand(['Shift', 'Requester', 'Substitute'])
			.where(['Active', 'eq', 1])
			.execute()
			.success(function(data) {
				// This assigns the results to a global (to the subShiftView function) variable so other functions and use them.
				subShifts = data.d.results;
				// Now we call the getShifts function to force it to fire syncronously after we get back the results from the query of the SubShift table.
				getShifts();
			});
	}

	function getShifts() {
		new dataService.getItems('Shifts')
			.top()
			.select(
				// Shift Info
				['Id',
				 'Day',
				 'StartTime',
				 'EndTime',
				 'Current',
				 // Shift Group Info
				 'ShiftGroup/Description',
				 'ShiftGroup/Id',
				 // Position Info
				 'Position/Id',
				 'Position/Position'
				]
			)
			.expand(['ShiftGroup', 'Position'])
			.where({
				and: [
					//This selects only those shifts that apply to the current semester 
					['ShiftGroup/Id', 'eq', dataService.properties.currentSemester.Id],
					// This selects only those shifts that are active (sorry about the poor data naming choice)
					['Current', 'eq', 1]
				]
			})
			.execute()
			.success(function(data) {
				// This assigns the results to a global (to the subShiftView function) variable so other functions and use them.
				shifts = data.d.results;
				// Now we will call the ... function to force it to execute syncronously after we get back the results from the query of the Shift table.
				// TODO: determine the next step that needs to be executed syncronously after the results from the query of the Shift table retrun...
			});
	}

	function newShift(subShift, shift) {
		return {
			// shift Info
			Id: params.shift.Id,
			startTime: shift.StartTime,
			endTime: shift.EndTime,
			position: shift.Position,
			// subShift Info
			subShiftId: subShift.Id,
			requester: subShift.Requester,
			substitute: subShift.Substitute,
			// General Info
			taken: (subShift.Substitute.Id !== undefined),
			hide: (subShift.Substitute.Id !== undefined &&
				   !(dataService.properties.currentUser.employeeInfo.Position.Position === 'FTE' || 
				   	 dataService.properties.currentUser.employeeInfo.Position.Position === 'HR'  || 
				   	 dataService.properties.currentUser.employeeInfo.Admin)
			)
		};
	}

	function populateDay(day) {
			// TODO: write the populateDay function...
			// this function needs to find all of the subShifts that belong to the day that is passed in,
			// and assign them to the day's subShifts array

			// this returns the subShifts that are for the day that has been passed.
			var relevantSubShifts = _.filter(subShifts, function(subShift) {
				return subShift.Date === day.date;
			});
			_.each(relevantSubShifts, function(subShift) {
				relatedShift = _.find(shifts, function(shift) {
					return shift.Id === subShift.Shift.Id;
				});
				day.subShifts.push()
			});
		}
		/////////////////////////////////////
		// subShifts Procedural Algorithm. //
		/////////////////////////////////////
	var __newVar__20141125200442013081 = 	_.each($scope.arrays.weeks, function(week) {
		_.each(week.days, function(day) {
			populateDay(day);
		});
	});;
__newVar__20141125200442013081
}
