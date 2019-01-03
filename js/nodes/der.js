define(['nodes/expo'], function(Expo) {

	class Der extends Expo {

		constructor(name) {
			super(null, "D", name);
		}
		
		copy() {
			var der = new Der(this.name);
			return der;
		}
	}
	return Der;
});
