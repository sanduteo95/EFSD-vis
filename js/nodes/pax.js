define(['nodes/expo'], function(Expo) {

	class Pax extends Expo {

		constructor(name) {
			super(null, "?", name);
		}

		copy() {
			return new Pax(this.name);
		}

		delete() {
			this.group.auxs.splice(this.group.auxs.indexOf(this), 1);
			super.delete();
		}
	}
	return Pax;
});