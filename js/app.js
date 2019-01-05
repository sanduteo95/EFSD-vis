Array.prototype.last = function() {
    return this[this.length-1];
}

define(["goi-machine"],
	function (machine) {
		function interpret (program, addTiming) {
            // start time
            if (addTiming) {
                if (global.__residual) {
                    global.__residual('void', console => {
                        console.time('time');
                    }, abstractedConsole);
                } else {
                    console.time('time');
                }
            }
			machine.setPlay(false);
			machine.setPlaying(false);
			machine.compile(program);
			machine.setPlay(true);
			machine.setFinished(false);
			if (!machine.isPlaying()) {
                // end time
                if (addTiming) {
                    if (global.__residual) {
                        global.__residual('void', console => {
                            console.timeEnd('time');
                        }, abstractedConsole);
                    } else {
                        console.timeEnd('time');
                    }
                } 
				return autoPlay();
			}
		}

		function autoPlay () {
			machine.setPlaying(true);
			let data = "";
			if (!machine.isFinished()) {
				data = machine.pass();
			} 
			if (machine.isFinished()) {
				return data;
			} else {
				if (machine.isPlay()) {
					return autoPlay();
				} else {
					machine.setPlaying(false);
				}
			}
        }

        exports.interpret = interpret;
	}
);