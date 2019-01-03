define(['nodes/expo'], function(Expo) {

	class Weak extends Expo {

		constructor() {
			super(null, 'C0');
		}

		copy() {
			return new Weak();
		}
		
	}

	return Weak;
});