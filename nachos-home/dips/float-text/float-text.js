setTimeout(function () {
	// This shouldn't work
	var api = parent.api;

	// This should work
	//var realApi = require('nachos-api');

	// So is this
	var test = require('./test');

	// Test
	alert(test.test);
}, 100);