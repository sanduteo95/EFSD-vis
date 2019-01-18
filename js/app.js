define(["goi-machine"],
	function (machine) {
        return function (program, mainCallback, maxTermCalls) {	
			var termCalls = 0;
			maxTermCalls = maxTermCalls || 125;

			function trampoline (res) {
				while (res && res.fn) {
					res = res.fn.apply(null, res.args);
				}
			}

			function interpret (program, callback) {
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
							termCalls = 0;
							machine.setPlaying(false);
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
				args: [program, mainCallback]
			});
		};
	}
);