define(["goi-machine"],
	function (machine) {
        return function (program, mainCallback, addTiming, maxTermCalls) {
			var abstractedConsole;
			// need to add console to Prepack
			if (global.__residual) {
				abstractedConsole = __abstract({}, 'console');
			}	
	
			// global variables used to set-up timeouts to avoid stack overflow 
			var termCalls = 0;
			maxTermCalls = maxTermCalls || 125;
			var CALLBACK_TIMEOUT = 100;

			function interpret (program, callback, addTiming) {
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
					autoPlay(callback);
				}
			}
	
			function autoPlay (callback) {
				termCalls++;
				machine.setPlaying(true);
				let data = "";
				if (!machine.isFinished()) {
					data = machine.pass();
				} 
				if (machine.isFinished()) {
					callback(null, data);
				} else {
					if (machine.isPlay()) {
						if (global.__residual) {
							// if we're in Prepack, and weve reached its maximum nubmer of calls
							if (termCalls > maxTermCalls/3) {
								// set to 0 because up till now Prepack evaluated everything
								termCalls = 0;
								global.__residual("void", function(autoPlay, callback) {
									autoPlay (callback);
								}, autoPlay, callback);
							} else {
								// just call the function as it is
								autoPlay (callback);
							}	
						} else {
							// otherwise, if we've reached the maximum number of calls on the stack
							if (termCalls > maxTermCalls) {
								// call the function with a timeout
								setTimeout(function () {
									autoPlay (callback);
								}, CALLBACK_TIMEOUT);
							} else {
								// just call the function as it is
								autoPlay (callback);
							}		
						}
					} else {
						machine.setPlaying(false);
					}
				}
			}

			interpret(program, function (err, result) {
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
				mainCallback(err, result);
			});
		};
	}
);