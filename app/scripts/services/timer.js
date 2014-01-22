angular.module("travelPlanningGame.app")
	.factory("timer", function() {

		// Times of a day
		var times = ["morning", "afternoon", "evening", "night"];
		// Utility to get the display name by number
		function toTimeOfDay(time) {
			return times[time] ? times[time] : null;
		}

		// Limits on days and times
		var limits = {};
		limits.days = 1;
		limits.times = 1; // number of "times of day" currently used by the game
		// Set the day limits and times of day to use
		function setLimits(lastDay, lastTimeOfDay) {
			limits.days = (lastDay >= 1) ? lastDay : 1;

			limits.times = (lastTimeOfDay >= 1) ? (
				(lastTimeOfDay <= times.length) ? lastTimeOfDay : times.length
			) : 1;
		}
		// Get the limits - for the curious
		function getLimits() {
			return limits;
		}

		// Current time
		var current = null;
		var Time = function(day, time) {
			this.day = day;
			this.time = time;
		};
		// Get the time
		function getCurrent() {
			return current;
		}
		// Convert to timestamp
		function getTimestamp(time) {
			if (!time)
				time = current;

			return time.day + "." + time.time;
		}
		// Unmarshal a timestamp
		function fromTimestamp(timestamp) {
			var parts = timestamp.split(".");
			return new Time(parts[0], parts[1]);
		}

		// Start timer at (1, 1)
		function start() {
			current = new Time(1, 1);
			return true;
		}

		// Move to the next timeslot
		function next() {
			if (isLast())
				return false;

			var nextDay = _isEOD() ? (current.day + 1) : current.day;
			var nextTime = _isEOD() ? 1 : (current.time + 1);

			current = new Time(nextDay, nextTime);
			return true;
		}

		function _isEOD() {
			return current.time === limits.times;
		}

		function _isLastDay() {
			return current.day === limits.days;
		}

		function isLast() {
			return _isLastDay() && _isEOD();
		}

		return {
			config: setLimits
			, getLimits: getLimits
			, start: start
			, next: next
			, isLast: isLast
			, now: getCurrent
			, toTimestamp: getTimestamp
			, fromTimestamp: fromTimestamp
			, toTimeOfDay: toTimeOfDay
		};
	});
