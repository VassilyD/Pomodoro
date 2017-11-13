describe("styleTime", function() {

	var timeTest = 1510571532295;

	/*beforeEach(function() {
		timeTest = 1510571532295;
	});*/

	it("Should format time from timestamp (int)", function() {
		expect(styleTime(timeTest)).toBe("11h 12' 12\"");
	});

	it("Should return 00\" from negative number", function() {
		expect(styleTime(-10)).toBe("00\"");
	});

	it("Should return an error from float", function() {
		expect(styleTime.bind(null, -10.56)).toThrow("StyleTime : bad number, should be an integer");
	});

	it("Shouldn't format time from null", function() {
		expect(styleTime.bind(null, null)).toThrow("StyleTime : bad type, should be a number");
	});

	it("Shouldn't format time from string", function() {
		expect(styleTime.bind(null, 'someString')).toThrow("StyleTime : bad type, should be a number");
	});

	it("Shouldn't format time from Object", function() {
		expect(styleTime.bind(null, {truc: 'cheum'})).toThrow("StyleTime : bad type, should be a number");
	});
});

describe('styleTimeFull', function() {

	var timeTest = 1510571532295;
});