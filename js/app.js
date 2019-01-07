define(["goi-machine"],
	function (machine) {
		var CALLBACK_TIMEOUT = 100;
		var abstractedConsole;
		// need to add console to Prepack
		if (global.__residual) {
			abstractedConsole = __abstract({}, 'console');
		}	

		function interpret (program, callback, addTiming, maxTermCalls) {
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
				autoPlay(0, maxTermCalls || 125, callback);
			}
		}

		function autoPlay (termCalls, maxTermCalls, callback) {
			console.log(termCalls);
			machine.setPlaying(true);
			let data = "";
			if (!machine.isFinished()) {
				data = machine.pass();
			} 
			if (machine.isFinished()) {
				callback(data);
			} else {
				if (machine.isPlay()) {
					if (global.__residual) {
						// if we're in Prepack, and weve reached its maximum nubmer of calls
						if (termCalls > maxTermCalls/3) {
							// check what to leave behind for the interpreter
							if (termCalls > maxTermCalls) {
								global.__assumeDataProperty(global, 'setTimeout', function (cb, time) {
									setTimeout(cb, time)
								});
			
								global.__residual("void", function(setTimeout, autoPlay, termCalls, maxTermCalls, callback) {
									setTimeout(function () { 
										autoPlay (termCalls + 1, maxTermCalls, callback);
									}, CALLBACK_TIMEOUT);
								}, global.setTimeout, autoPlay, termCalls, maxTermCalls, callback);			
							} else {
								global.__residual("void", function(autoPlay, termCalls, maxTermCalls, callback) {
									// do not increase termCalls because this is just residual/copied code
									autoPlay (termCalls, maxTermCalls, callback);
								}, autoPlay, termCalls, maxTermCalls, callback);
							}
						} else {
							// just call the function as it is
							autoPlay (termCalls + 1, maxTermCalls, callback);
						}	
					} else {
						// otherwise, if we've reached the maximum number of calls on the stack
						if (termCalls > maxTermCalls) {
							// call the function with a timeout
							setTimeout(function () {
								return autoPlay (termCalls + 1, maxTermCalls, callback);
							}, CALLBACK_TIMEOUT);
						} else {
							// just call the function as it is
							return autoPlay (termCalls + 1, maxTermCalls, callback);
						}		
					}
				} else {
					machine.setPlaying(false);
				}
			}
        }

        return interpret;
	}
);