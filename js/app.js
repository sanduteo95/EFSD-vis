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

			function trampoline (res) {
				while (res && res.fn) {
					res = res.fn.apply(null, res.args);
				}
			}

			function interpret (program, callback) {
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
					return {
						fn: autoPlay,
						args: [callback]
					};
				}
			}
	
			function autoPlay (callback) {
				termCalls++;
				machine.setPlaying(true);
				let result;
				if (!machine.isFinished()) {
					result = machine.pass();
				} 
				if (machine.isFinished()) {
					if (typeof result === 'function') {
						return {
							fn: callback,
							args: [null, function () {
								machine.setPlay(false);
								machine.setPlaying(false);
								// can only receive one argument at a time so this work
								if (arguments.length !== 0 ) {
									result(arguments[0]);
								}
								machine.setPlay(true);
								machine.setFinished(false);
								if (!machine.isPlaying()) {
									return trampoline({
										fn: autoPlay,
										args: callback
									});
								}
							}]
						};
					} else {
						return {
							fn: callback,
							args: [null, result]
						};
					}
				} else {
					if (machine.isPlay()) {
						if (global.__residual && termCalls > maxTermCalls) {
							// set to 0 because up till now Prepack evaluated everything
							global.__residual("void", function(trampoline, autoPlay, callback) {
								return trampoline({
									fn: autoPlay,
									args: [callback]
								});
							}, trampoline, autoPlay, callback);
						} else {
							return {
								fn: autoPlay,
								args: [callback]
							};
						}
					} else {
						machine.setPlaying(false);
					}
				}
			}

			trampoline({
				fn: interpret,
				args: [program, function (err, result) {
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
					return {
						fn: mainCallback,
						args: [err, result]
					};
				}]
			});
		};
	}
);